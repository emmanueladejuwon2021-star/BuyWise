import { Request, Response } from 'express';
import { CampaignService } from '../services/CampaignService';
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

const campaignService = new CampaignService();

export class CampaignController {
  /**
   * POST /api/v1/store/campaigns
   * Create a new ad campaign
   */
  async createCampaign(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const store = await StoreProfile.findOne({ userId });
      if (!store) {
        return res.status(404).json({ error: 'Store not found' });
      }

      const {
        campaignName,
        productId,
        targetCategory,
        totalBudget,
        costPerClick,
        placementLocation,
        startDate,
        endDate,
      } = req.body;

      // Validation
      if (!campaignName || !totalBudget || !costPerClick || !placementLocation || !startDate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (!productId && !targetCategory) {
        return res.status(400).json({ error: 'Either productId or targetCategory is required' });
      }

      const campaign = await campaignService.createCampaign({
        storeId: store._id.toString(),
        campaignName,
        productId,
        targetCategory,
        totalBudget,
        costPerClick,
        placementLocation,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
      });

      res.status(201).json({
        success: true,
        data: campaign,
        message: 'Campaign created successfully',
      });
    } catch (error: any) {
      logger.error('Error creating campaign:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/v1/store/campaigns
   * Get store's campaigns
   */
  async getStoreCampaigns(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const store = await StoreProfile.findOne({ userId });
      if (!store) {
        return res.status(404).json({ error: 'Store not found' });
      }

      const { status } = req.query;
      const campaigns = await campaignService.getStoreCampaigns(
        store._id.toString(),
        status as string
      );

      res.json({
        success: true,
        data: campaigns,
      });
    } catch (error: any) {
      logger.error('Error fetching campaigns:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/v1/store/campaigns/:campaignId
   * Get campaign details with metrics
   */
  async getCampaignDetails(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const store = await StoreProfile.findOne({ userId });
      if (!store) {
        return res.status(404).json({ error: 'Store not found' });
      }

      const { campaignId } = req.params;
      const metrics = await campaignService.getCampaignMetrics(campaignId);

      // Verify campaign belongs to this store
      if (metrics.campaign.storeId !== store._id.toString()) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error: any) {
      logger.error('Error fetching campaign details:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * PUT /api/v1/store/campaigns/:campaignId/pause
   * Pause a campaign
   */
  async pauseCampaign(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const store = await StoreProfile.findOne({ userId });
      if (!store) {
        return res.status(404).json({ error: 'Store not found' });
      }

      const { campaignId } = req.params;
      const campaign = await campaignService.pauseCampaign(campaignId, store._id.toString());

      res.json({
        success: true,
        data: campaign,
        message: 'Campaign paused successfully',
      });
    } catch (error: any) {
      logger.error('Error pausing campaign:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * PUT /api/v1/store/campaigns/:campaignId/resume
   * Resume a campaign
   */
  async resumeCampaign(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const store = await StoreProfile.findOne({ userId });
      if (!store) {
        return res.status(404).json({ error: 'Store not found' });
      }

      const { campaignId } = req.params;
      const campaign = await campaignService.resumeCampaign(campaignId, store._id.toString());

      res.json({
        success: true,
        data: campaign,
        message: 'Campaign resumed successfully',
      });
    } catch (error: any) {
      logger.error('Error resuming campaign:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/v1/store/campaigns/stats
   * Get store's campaign statistics
   */
  async getCampaignStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const store = await StoreProfile.findOne({ userId });
      if (!store) {
        return res.status(404).json({ error: 'Store not found' });
      }

      const stats = await campaignService.getStoreCampaignStats(store._id.toString());

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      logger.error('Error fetching campaign stats:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export const campaignController = new CampaignController();
