import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { WatchlistItem } from '../models/WatchlistItem';
import { PriceHistory } from '../models/PriceHistory';
import { Notification } from '../models/Notification';
import { notificationService } from './NotificationService';

// Redis connection for BullMQ
const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null
});

// Alert evaluation queue
export const alertQueue = new Queue('alert-evaluation', {
  connection: redisConnection
});

export interface AlertEvaluationJob {
  productId: string;
  retailerId: string;
  oldPrice: number;
  newPrice: number;
  timestamp: Date;
}

export class AlertEvaluationEngine {
  /**
   * Queue a price update for alert evaluation
   */
  async queuePriceUpdate(
    productId: string,
    retailerId: string,
    oldPrice: number,
    newPrice: number
  ): Promise<void> {
    const job: AlertEvaluationJob = {
      productId,
      retailerId,
      oldPrice,
      newPrice,
      timestamp: new Date()
    };

    await alertQueue.add('evaluate-alerts', job, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });
  }

  /**
   * Evaluate alerts for a price update
   */
  async evaluateAlerts(job: AlertEvaluationJob): Promise<void> {
    const { productId, retailerId, oldPrice, newPrice, timestamp } = job;

    // Only process if price dropped
    if (newPrice >= oldPrice) {
      return;
    }

    // Find all active watchlist items for this product
    const watchlistItems = await WatchlistItem.find({
      masterProductId: productId,
      isActive: true
    });

    if (watchlistItems.length === 0) {
      return;
    }

    // Evaluate each watchlist item
    for (const item of watchlistItems) {
      await this.evaluateWatchlistItem(item, retailerId, oldPrice, newPrice, timestamp);
    }
  }

  /**
   * Evaluate a single watchlist item against new price
   */
  private async evaluateWatchlistItem(
    item: any,
    retailerId: string,
    oldPrice: number,
    newPrice: number,
    timestamp: Date
  ): Promise<void> {
    const priceDrop = oldPrice - newPrice;
    const priceDropPercentage = (priceDrop / oldPrice) * 100;

    let shouldTrigger = false;
    let triggerReason = '';

    // Check alert conditions
    switch (item.alertType) {
      case 'absolute':
        if (item.targetPrice && newPrice <= item.targetPrice) {
          shouldTrigger = true;
          triggerReason = `Price dropped to ₦${newPrice.toLocaleString()} (target: ₦${item.targetPrice.toLocaleString()})`;
        }
        break;

      case 'percentage':
        if (item.targetPercentageDrop && priceDropPercentage >= item.targetPercentageDrop) {
          shouldTrigger = true;
          triggerReason = `Price dropped by ${priceDropPercentage.toFixed(1)}% (target: ${item.targetPercentageDrop}%)`;
        }
        break;

      case 'any':
        if (priceDrop > 0) {
          shouldTrigger = true;
          triggerReason = `Price dropped by ₦${priceDrop.toLocaleString()} (${priceDropPercentage.toFixed(1)}%)`;
        }
        break;
    }

    if (!shouldTrigger) {
      return;
    }

    // Check cool-down period (24 hours)
    if (item.lastTriggeredAt) {
      const hoursSinceLastTrigger = (timestamp.getTime() - item.lastTriggeredAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastTrigger < 24) {
        // Check if price dropped by additional 5% since last trigger
        const lastTriggerPrice = item.currentLowestPrice;
        const additionalDrop = ((lastTriggerPrice - newPrice) / lastTriggerPrice) * 100;
        
        if (additionalDrop < 5) {
          console.log(`Skipping alert for ${item._id} - cool-down period not met and additional drop < 5%`);
          return;
        }
      }
    }

    // Check if this is all-time low
    const allTimeLow = await PriceHistory.findOne({
      productId: item.masterProductId
    }).sort({ price: 1 });

    const isAllTimeLow = allTimeLow && newPrice <= allTimeLow.price;

    // Trigger notifications
    await this.triggerNotifications(item, retailerId, oldPrice, newPrice, triggerReason, isAllTimeLow);

    // Update watchlist item
    item.lastTriggeredAt = timestamp;
    item.currentLowestPrice = newPrice;
    item.totalSavings = item.initialPrice - newPrice;
    item.savingsPercentage = (item.totalSavings / item.initialPrice) * 100;

    await item.save();
  }

  /**
   * Trigger notifications for all configured channels
   */
  private async triggerNotifications(
    item: any,
    retailerId: string,
    oldPrice: number,
    newPrice: number,
    triggerReason: string,
    isAllTimeLow: boolean
  ): Promise<void> {
    const savingsAmount = oldPrice - newPrice;
    const savingsPercentage = (savingsAmount / oldPrice) * 100;

    // Get retailer info (you'll need to implement this based on your retailer data)
    const retailerName = retailerId.charAt(0).toUpperCase() + retailerId.slice(1);
    const affiliateUrl = `https://${retailerId}.com/product/${item.masterProductId}?ref=pricewise`;

    // Send notifications for each configured channel
    for (const channel of item.channels) {
      try {
        const notification = new Notification({
          userId: item.userId,
          watchlistItemId: item._id,
          masterProductId: item.masterProductId,
          type: 'price_drop',
          channel,
          status: 'pending',
          productName: item.productName,
          oldPrice,
          newPrice,
          savingsAmount,
          savingsPercentage,
          retailerName,
          affiliateUrl,
          isAllTimeLow,
          templateData: {
            triggerReason,
            isAllTimeLow
          }
        });

        await notification.save();

        // Send notification
        if (channel === 'email') {
          await notificationService.sendEmailNotification(notification);
        } else if (channel === 'sms') {
          await notificationService.sendSmsNotification(notification);
        } else if (channel === 'push') {
          await notificationService.sendPushNotification(notification);
        }

        notification.status = 'sent';
        notification.sentAt = new Date();
        await notification.save();

      } catch (error) {
        console.error(`Failed to send ${channel} notification for watchlist item ${item._id}:`, error);
        
        // Mark notification as failed
        const failedNotification = await Notification.findOne({
          watchlistItemId: item._id,
          channel,
          status: 'pending'
        }).sort({ createdAt: -1 });

        if (failedNotification) {
          failedNotification.status = 'failed';
          failedNotification.failedAt = new Date();
          failedNotification.errorMessage = error instanceof Error ? error.message : 'Unknown error';
          await failedNotification.save();
        }
      }
    }
  }
}

export const alertEvaluationEngine = new AlertEvaluationEngine();
