import { Request, Response } from 'express';
import { WatchlistItem } from '../models/WatchlistItem';
import { PriceHistory } from '../models/PriceHistory';
import { priceAnalyticsEngine } from '../services/PriceAnalyticsEngine';

export class WatchlistController {
  /**
   * GET /api/v1/watchlist
   * Get user's watchlist with current prices and metrics
   */
  async getWatchlist(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id; // Assuming authentication middleware sets req.user
      
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { page = 1, limit = 20 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      // Get watchlist items
      const watchlistItems = await WatchlistItem.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await WatchlistItem.countDocuments({ userId });

      // Update prices for each item
      for (const item of watchlistItems) {
        await priceAnalyticsEngine.updateWatchlistItemPrices(item._id.toString());
      }

      // Fetch updated items
      const updatedItems = await WatchlistItem.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      res.json({
        success: true,
        data: updatedItems,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      res.status(500).json({ error: 'Failed to fetch watchlist' });
    }
  }

  /**
   * POST /api/v1/watchlist
   * Add product to watchlist
   */
  async addToWatchlist(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const {
        masterProductId,
        productName,
        productImage,
        targetPrice,
        targetPercentageDrop,
        alertType = 'any',
        channels = ['email']
      } = req.body;

      // Validate input
      if (!masterProductId || !productName) {
        res.status(400).json({ error: 'masterProductId and productName are required' });
        return;
      }

      // Check if already in watchlist
      const existing = await WatchlistItem.findOne({ userId, masterProductId });
      if (existing) {
        res.status(400).json({ error: 'Product already in watchlist' });
        return;
      }

      // Get current price
      const currentPrice = await PriceHistory.findOne({ productId: masterProductId })
        .sort({ timestamp: -1 });

      if (!currentPrice) {
        res.status(400).json({ error: 'No price history found for this product' });
        return;
      }

      // Get all-time low
      const allTimeLow = await PriceHistory.findOne({ productId: masterProductId })
        .sort({ price: 1 });

      // Create watchlist item
      const watchlistItem = new WatchlistItem({
        userId,
        masterProductId,
        productName,
        productImage: productImage || '',
        targetPrice,
        targetPercentageDrop,
        alertType,
        channels,
        isActive: true,
        initialPrice: currentPrice.price,
        currentLowestPrice: currentPrice.price,
        allTimeLow: allTimeLow?.price || currentPrice.price,
        allTimeLowDate: allTimeLow?.timestamp || currentPrice.timestamp,
        totalSavings: 0,
        savingsPercentage: 0
      });

      await watchlistItem.save();

      res.status(201).json({
        success: true,
        data: watchlistItem,
        message: 'Product added to watchlist'
      });
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      res.status(500).json({ error: 'Failed to add product to watchlist' });
    }
  }

  /**
   * PUT /api/v1/watchlist/:watchlistId
   * Update watchlist item (alert settings)
   */
  async updateWatchlistItem(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { watchlistId } = req.params;
      
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const {
        targetPrice,
        targetPercentageDrop,
        alertType,
        channels,
        isActive
      } = req.body;

      const watchlistItem = await WatchlistItem.findOne({ _id: watchlistId, userId });

      if (!watchlistItem) {
        res.status(404).json({ error: 'Watchlist item not found' });
        return;
      }

      // Update fields
      if (targetPrice !== undefined) watchlistItem.targetPrice = targetPrice;
      if (targetPercentageDrop !== undefined) watchlistItem.targetPercentageDrop = targetPercentageDrop;
      if (alertType !== undefined) watchlistItem.alertType = alertType;
      if (channels !== undefined) watchlistItem.channels = channels;
      if (isActive !== undefined) watchlistItem.isActive = isActive;

      await watchlistItem.save();

      res.json({
        success: true,
        data: watchlistItem,
        message: 'Watchlist item updated'
      });
    } catch (error) {
      console.error('Error updating watchlist item:', error);
      res.status(500).json({ error: 'Failed to update watchlist item' });
    }
  }

  /**
   * DELETE /api/v1/watchlist/:watchlistId
   * Remove product from watchlist
   */
  async removeFromWatchlist(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { watchlistId } = req.params;
      
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const watchlistItem = await WatchlistItem.findOneAndDelete({ _id: watchlistId, userId });

      if (!watchlistItem) {
        res.status(404).json({ error: 'Watchlist item not found' });
        return;
      }

      res.json({
        success: true,
        message: 'Product removed from watchlist'
      });
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      res.status(500).json({ error: 'Failed to remove product from watchlist' });
    }
  }

  /**
   * GET /api/v1/watchlist/stats
   * Get watchlist summary statistics
   */
  async getWatchlistStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const watchlistItems = await WatchlistItem.find({ userId });

      const stats = {
        totalItems: watchlistItems.length,
        activeItems: watchlistItems.filter(item => item.isActive).length,
        totalSavings: watchlistItems.reduce((sum, item) => sum + item.totalSavings, 0),
        averageSavingsPercentage: watchlistItems.length > 0
          ? watchlistItems.reduce((sum, item) => sum + item.savingsPercentage, 0) / watchlistItems.length
          : 0,
        itemsAtAllTimeLow: watchlistItems.filter(item => 
          item.currentLowestPrice === item.allTimeLow
        ).length,
        itemsWithAlerts: watchlistItems.filter(item => 
          item.targetPrice || item.targetPercentageDrop
        ).length
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching watchlist stats:', error);
      res.status(500).json({ error: 'Failed to fetch watchlist stats' });
    }
  }
}

export const watchlistController = new WatchlistController();
