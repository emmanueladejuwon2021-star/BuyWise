import { AdCampaign } from '../models/AdCampaign';
import { StoreProfile } from '../models/StoreProfile';
import { SponsoredClick } from '../models/SponsoredClick';
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

export interface CampaignCreateData {
  storeId: string;
  campaignName: string;
  productId?: string;
  targetCategory?: string;
  totalBudget: number;
  costPerClick: number;
  placementLocation: 'search_top' | 'comparison_top' | 'homepage_banner';
  startDate: Date;
  endDate?: Date;
}

export class CampaignService {
  /**
   * Create a new ad campaign
   */
  async createCampaign(data: CampaignCreateData) {
    const store = await StoreProfile.findById(data.storeId);
    if (!store) {
      throw new Error('Store not found');
    }

    // Check if store has enough credits
    if (store.adCreditsBalance < data.totalBudget) {
      throw new Error('Insufficient ad credits');
    }

    // Create campaign
    const campaign = new AdCampaign({
      storeId: data.storeId,
      campaignName: data.campaignName,
      productId: data.productId,
      targetCategory: data.targetCategory,
      totalBudget: data.totalBudget,
      costPerClick: data.costPerClick,
      placementLocation: data.placementLocation,
      status: 'active',
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: true,
    });

    await campaign.save();

    logger.info(`Campaign ${campaign._id} created for store ${data.storeId}`);

    return campaign;
  }

  /**
   * Get all campaigns for a store
   */
  async getStoreCampaigns(storeId: string, status?: string) {
    const query: any = { storeId };
    if (status) {
      query.status = status;
    }

    const campaigns = await AdCampaign.find(query)
      .sort({ createdAt: -1 });

    return campaigns;
  }

  /**
   * Get active campaigns for a specific placement
   */
  async getActiveCampaigns(placementLocation: string, productId?: string, category?: string) {
    const query: any = {
      placementLocation,
      status: 'active',
      isActive: true,
    };

    if (productId) {
      query.productId = productId;
    }

    if (category) {
      query.targetCategory = category;
    }

    const campaigns = await AdCampaign.find(query)
      .sort({ costPerClick: -1 }); // Higher CPC = higher priority

    return campaigns;
  }

  /**
   * Record a sponsored click and deduct credits
   */
  async recordSponsoredClick(
    campaignId: string,
    clickData: {
      storeId: string;
      productId?: string;
      userId?: string;
      sessionId?: string;
      userIp?: string;
      userAgent?: string;
      referrerUrl?: string;
    }
  ) {
    const campaign = await AdCampaign.findById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.status !== 'active') {
      throw new Error('Campaign is not active');
    }

    // Check if campaign has budget remaining
    if (campaign.spentAmount >= campaign.totalBudget) {
      campaign.status = 'out_of_credits';
      campaign.isActive = false;
      await campaign.save();
      throw new Error('Campaign out of credits');
    }

    // Record the click
    const click = new SponsoredClick({
      campaignId,
      storeId: clickData.storeId,
      productId: clickData.productId,
      userId: clickData.userId,
      sessionId: clickData.sessionId,
      userIp: clickData.userIp,
      userAgent: clickData.userAgent,
      referrerUrl: clickData.referrerUrl,
      costPerClick: campaign.costPerClick,
      placementLocation: campaign.placementLocation,
    });

    await click.save();

    // Update campaign metrics
    campaign.totalClicks += 1;
    campaign.spentAmount += campaign.costPerClick;
    campaign.clickThroughRate = (campaign.totalClicks / campaign.totalImpressions) * 100;

    // Check if budget exhausted
    if (campaign.spentAmount >= campaign.totalBudget) {
      campaign.status = 'out_of_credits';
      campaign.isActive = false;
      logger.info(`Campaign ${campaignId} out of credits`);
    }

    await campaign.save();

    // Update store credits
    const store = await StoreProfile.findById(campaign.storeId);
    if (store) {
      store.adCreditsBalance -= campaign.costPerClick;
      store.totalClicks += 1;
      await store.save();
    }

    logger.info(`Sponsored click recorded for campaign ${campaignId}`);

    return click;
  }

  /**
   * Record impression for a campaign
   */
  async recordImpression(campaignId: string) {
    const campaign = await AdCampaign.findById(campaignId);
    if (!campaign) {
      return;
    }

    campaign.totalImpressions += 1;
    campaign.clickThroughRate = (campaign.totalClicks / campaign.totalImpressions) * 100;
    await campaign.save();
  }

  /**
   * Pause a campaign
   */
  async pauseCampaign(campaignId: string, storeId: string) {
    const campaign = await AdCampaign.findOne({ _id: campaignId, storeId });
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    campaign.status = 'paused';
    campaign.isActive = false;
    await campaign.save();

    logger.info(`Campaign ${campaignId} paused`);

    return campaign;
  }

  /**
   * Resume a campaign
   */
  async resumeCampaign(campaignId: string, storeId: string) {
    const campaign = await AdCampaign.findOne({ _id: campaignId, storeId });
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.spentAmount >= campaign.totalBudget) {
      throw new Error('Campaign out of credits');
    }

    campaign.status = 'active';
    campaign.isActive = true;
    await campaign.save();

    logger.info(`Campaign ${campaignId} resumed`);

    return campaign;
  }

  /**
   * Get campaign performance metrics
   */
  async getCampaignMetrics(campaignId: string) {
    const campaign = await AdCampaign.findById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const clicks = await SponsoredClick.find({ campaignId })
      .sort({ timestamp: -1 })
      .limit(100);

    return {
      campaign,
      recentClicks: clicks,
      performance: {
        totalImpressions: campaign.totalImpressions,
        totalClicks: campaign.totalClicks,
        clickThroughRate: campaign.clickThroughRate,
        spentAmount: campaign.spentAmount,
        remainingBudget: campaign.totalBudget - campaign.spentAmount,
        daysActive: Math.ceil((Date.now() - new Date(campaign.startDate).getTime()) / (1000 * 60 * 60 * 24)),
      },
    };
  }

  /**
   * Get store's total campaign statistics
   */
  async getStoreCampaignStats(storeId: string) {
    const campaigns = await AdCampaign.find({ storeId });

    const totalBudget = campaigns.reduce((sum, c) => sum + c.totalBudget, 0);
    const totalSpent = campaigns.reduce((sum, c) => sum + c.spentAmount, 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + c.totalClicks, 0);
    const totalImpressions = campaigns.reduce((sum, c) => sum + c.totalImpressions, 0);

    return {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === 'active').length,
      totalBudget,
      totalSpent,
      totalClicks,
      totalImpressions,
      averageCTR: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
    };
  }
}

export const campaignService = new CampaignService();
