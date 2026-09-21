import { Request, Response } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';
import { StoreProfile } from '../models/StoreProfile';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
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

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  /**
   * GET /api/v1/store/analytics/demand
   * Get market demand report for store's categories
   */
  async getDemandReport(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const store = await StoreProfile.findOne({ userId });
      if (!store) {
        return res.status(404).json({ error: 'Store not found' });
      }

      // Check if store is premium or enterprise
      if (store.membershipLevel === 'free') {
        return res.status(403).json({ 
          error: 'Market demand reports are only available for Premium and Enterprise stores' 
        });
      }

      const { category, days = 30 } = req.query;

      if (!category) {
        return res.status(400).json({ error: 'Category parameter is required' });
      }

      const report = await analyticsService.getCategoryDemandReport(
        category as string,
        Number(days)
      );

      res.json({
        success: true,
        data: report,
      });
    } catch (error: any) {
      logger.error('Error fetching demand report:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/v1/store/analytics/insights
   * Get shopper insights for store
   */
  async getShopperInsights(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const store = await StoreProfile.findOne({ userId });
      if (!store) {
        return res.status(404).json({ error: 'Store not found' });
      }

      // Check if store is premium or enterprise
      if (store.membershipLevel === 'free') {
        return res.status(403).json({ 
          error: 'Shopper insights are only available for Premium and Enterprise stores' 
        });
      }

      const { days = 30 } = req.query;
      const insights = await analyticsService.getShopperInsights(
        store._id.toString(),
        Number(days)
      );

      res.json({
        success: true,
        data: insights,
      });
    } catch (error: any) {
      logger.error('Error fetching shopper insights:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/v1/store/analytics/performance
   * Get store performance analytics
   */
  async getStorePerformance(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const store = await StoreProfile.findOne({ userId });
      if (!store) {
        return res.status(404).json({ error: 'Store not found' });
      }

      const { days = 30 } = req.query;
      const performance = await analyticsService.getStorePerformance(
        store._id.toString(),
        Number(days)
      );

      res.json({
        success: true,
        data: performance,
      });
    } catch (error: any) {
      logger.error('Error fetching store performance:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/v1/store/analytics/competitive
   * Get competitive analysis
   */
  async getCompetitiveAnalysis(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const store = await StoreProfile.findOne({ userId });
      if (!store) {
        return res.status(404).json({ error: 'Store not found' });
      }

      // Check if store is premium or enterprise
      if (store.membershipLevel === 'free') {
        return res.status(403).json({ 
          error: 'Competitive analysis is only available for Premium and Enterprise stores' 
        });
      }

      const analysis = await analyticsService.getCompetitiveAnalysis(store._id.toString());

      res.json({
        success: true,
        data: analysis,
      });
    } catch (error: any) {
      logger.error('Error fetching competitive analysis:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/v1/admin/analytics/platform
   * Get platform-wide analytics (admin only)
   */
  async getPlatformAnalytics(req: Request, res: Response) {
    try {
      // Check if user is admin (you'll need to implement admin check)
      const isAdmin = req.user?.role === 'admin';
      if (!isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { days = 30 } = req.query;
      const analytics = await analyticsService.getPlatformAnalytics(Number(days));

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error: any) {
      logger.error('Error fetching platform analytics:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export const analyticsController = new AnalyticsController();
