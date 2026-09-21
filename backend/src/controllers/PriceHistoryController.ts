import { Request, Response } from 'express';
import { priceAnalyticsEngine } from '../services/PriceAnalyticsEngine';

export class PriceHistoryController {
  /**
   * GET /api/v1/products/:masterProductId/price-history
   * Get price history with analytics
   */
  async getPriceHistory(req: Request, res: Response): Promise<void> {
    try {
      const { masterProductId } = req.params;
      const { range = '90d' } = req.query;

      // Validate range
      const validRanges = ['30d', '90d', '180d', 'all'];
      if (!validRanges.includes(range as string)) {
        res.status(400).json({ error: 'Invalid range. Must be one of: 30d, 90d, 180d, all' });
        return;
      }

      // Get analytics
      const analytics = await priceAnalyticsEngine.getProductAnalytics(
        masterProductId,
        range as '30d' | '90d' | '180d' | 'all'
      );

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Error fetching price history:', error);
      
      if (error instanceof Error && error.message === 'No price history found for this product') {
        res.status(404).json({ error: 'No price history found for this product' });
        return;
      }

      res.status(500).json({ error: 'Failed to fetch price history' });
    }
  }

  /**
   * GET /api/v1/products/:masterProductId/price-summary
   * Get quick price summary (current, low, high)
   */
  async getPriceSummary(req: Request, res: Response): Promise<void> {
    try {
      const { masterProductId } = req.params;

      // Get analytics for all time
      const analytics = await priceAnalyticsEngine.getProductAnalytics(masterProductId, 'all');

      const summary = {
        currentPrice: analytics.statistics.currentPrice,
        allTimeLow: analytics.statistics.allTimeLow,
        allTimeHigh: analytics.statistics.allTimeHigh,
        averagePrice: analytics.statistics.averagePrice,
        priceVolatility: analytics.statistics.priceVolatility,
        totalDataPoints: analytics.statistics.totalDataPoints
      };

      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Error fetching price summary:', error);
      res.status(500).json({ error: 'Failed to fetch price summary' });
    }
  }
}

export const priceHistoryController = new PriceHistoryController();
