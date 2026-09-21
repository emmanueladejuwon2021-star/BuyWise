import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { ClickLog } from '../models/ClickLog';
import winston from 'winston';
import { config } from '../config';

const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

export class RedirectController {
  /**
   * GET /api/v1/redirect/:productId/:retailerId
   * 
   * Outbound redirection endpoint with affiliate tracking
   * Logs click analytics and redirects to retailer with affiliate tags
   */
  async redirect(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const { productId, retailerId } = req.params;
    const { subId, source, ref } = req.query;

    try {
      // 1. Find the product
      const product = await Product.findById(productId);
      
      if (!product) {
        logger.warn(`[Redirect] Product not found: ${productId}`);
        res.status(404).json({ 
          error: 'Product not found',
          redirectUrl: null 
        });
        return;
      }

      // 2. Find the retailer listing
      const listing = product.listings.find(l => l.store.id === retailerId);
      
      if (!listing) {
        logger.warn(`[Redirect] Retailer not found for product: ${productId}, retailer: ${retailerId}`);
        res.status(404).json({ 
          error: 'Retailer listing not found',
          redirectUrl: null 
        });
        return;
      }

      // 3. Construct affiliate URL
      const redirectUrl = this.constructAffiliateUrl(listing, {
        subId: subId as string,
        source: source as string,
        ref: ref as string,
        timestamp: Date.now(),
      });

      // 4. Log click analytics (async to not block redirect)
      const clickLog = new ClickLog({
        userId: req.user?.id || undefined,
        sessionId: req.headers['x-session-id'] as string,
        productId: product._id.toString(),
        productName: product.name,
        retailerId,
        retailerName: listing.store.name,
        userIp: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        referrerUrl: req.headers.referer || req.headers.referrer as string,
        sourcePage: source as string || 'unknown',
        affiliateTag: listing.affiliateTag,
        originalPrice: listing.price,
        currency: listing.currency,
        redirectUrl,
        timestamp: new Date(),
        conversionTracked: false,
      });

      // Save click log asynchronously (don't block redirect)
      clickLog.save().catch(err => {
        logger.error('[Redirect] Failed to save click log:', err);
      });

      // 5. Update product click count
      product.totalClicks = (product.totalClicks || 0) + 1;
      product.save().catch(err => {
        logger.error('[Redirect] Failed to update click count:', err);
      });

      const duration = Date.now() - startTime;
      logger.info(`[Redirect] ${productId} → ${retailerId} (${duration}ms)`);

      // 6. Issue 302 redirect
      res.redirect(302, redirectUrl);

    } catch (error: any) {
      logger.error('[Redirect] Error:', error);
      res.status(500).json({ 
        error: 'Redirect failed',
        message: error.message 
      });
    }
  }

  /**
   * Construct affiliate URL with tracking parameters
   */
  private constructAffiliateUrl(
    listing: any, 
    params: { subId?: string; source?: string; ref?: string; timestamp: number }
  ): string {
    let url = listing.affiliateUrl || listing.productUrl;

    // Fallback to direct URL if affiliate URL missing
    if (!url) {
      logger.warn('[Redirect] No affiliate URL, using direct URL');
      return listing.productUrl || '#';
    }

    try {
      const urlObj = new URL(url);
      
      // Add affiliate tracking parameters
      if (listing.affiliateTag) {
        urlObj.searchParams.set('tag', listing.affiliateTag);
      }
      
      if (params.subId) {
        urlObj.searchParams.set('sub_id', params.subId);
      }
      
      if (params.source) {
        urlObj.searchParams.set('source', params.source);
      }
      
      if (params.ref) {
        urlObj.searchParams.set('ref', params.ref);
      }
      
      // Add timestamp for conversion tracking
      urlObj.searchParams.set('click_ts', params.timestamp.toString());
      
      // Add platform identifier
      urlObj.searchParams.set('platform', 'pricewise');
      
      return urlObj.toString();
    } catch (error) {
      // If URL parsing fails, return original URL
      logger.error('[Redirect] Failed to parse URL:', error);
      return url;
    }
  }

  /**
   * GET /api/v1/clicks/stats
   * Get click analytics (admin)
   */
  async getClickStats(req: Request, res: Response): Promise<void> {
    try {
      const { days = 7, retailerId, productId } = req.query;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Number(days));

      const matchStage: any = {
        timestamp: { $gte: startDate }
      };

      if (retailerId) matchStage.retailerId = retailerId;
      if (productId) matchStage.productId = productId;

      // Aggregate click stats
      const stats = await ClickLog.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$retailerId',
            totalClicks: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' },
            uniqueProducts: { $addToSet: '$productId' },
            avgPrice: { $avg: '$originalPrice' },
          }
        },
        {
          $project: {
            retailerId: '$_id',
            totalClicks: 1,
            uniqueUsers: { $size: '$uniqueUsers' },
            uniqueProducts: { $size: '$uniqueProducts' },
            avgPrice: 1,
          }
        },
        { $sort: { totalClicks: -1 } }
      ]);

      // Get total clicks
      const totalClicks = await ClickLog.countDocuments(matchStage);

      // Get recent clicks
      const recentClicks = await ClickLog.find(matchStage)
        .sort({ timestamp: -1 })
        .limit(20);

      res.json({
        success: true,
        totalClicks,
        retailerStats: stats,
        recentClicks,
        period: `${days} days`,
      });
    } catch (error: any) {
      logger.error('[ClickStats] Error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/v1/clicks/user/:userId
   * Get user's click history
   */
  async getUserClicks(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { limit = 50 } = req.query;

      const clicks = await ClickLog.find({ userId })
        .sort({ timestamp: -1 })
        .limit(Number(limit));

      res.json({
        success: true,
        clicks,
        total: clicks.length,
      });
    } catch (error: any) {
      logger.error('[UserClicks] Error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export const redirectController = new RedirectController();
