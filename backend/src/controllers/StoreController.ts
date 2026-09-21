import { Request, Response } from 'express';
import { StoreProfile } from '../models/StoreProfile';
import { paymentService } from '../services/PaymentService';
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

export class StoreController {
  /**
   * POST /api/v1/store/register
   * Register a new store
   */
  async registerStore(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const {
        businessName,
        logoUrl,
        description,
        address,
        city,
        state,
        deliveryAreas,
        contactEmail,
        contactPhone,
        website,
      } = req.body;

      // Check if store already exists
      const existingStore = await StoreProfile.findOne({ userId });
      if (existingStore) {
        return res.status(400).json({ error: 'Store already registered' });
      }

      // Create store profile
      const store = new StoreProfile({
        userId,
        businessName,
        logoUrl: logoUrl || '',
        description: description || '',
        address: address || '',
        city: city || '',
        state: state || '',
        deliveryAreas: deliveryAreas || [],
        contactEmail,
        contactPhone: contactPhone || '',
        website: website || '',
        membershipLevel: 'free',
        membershipStatus: 'active',
        membershipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        adCreditsBalance: 0,
        totalAdCreditsPurchased: 0,
        isVerified: false,
        rating: 0,
        totalProducts: 0,
        totalClicks: 0,
        totalSales: 0,
      });

      await store.save();

      logger.info(`Store registered: ${store._id} (${businessName})`);

      res.status(201).json({
        success: true,
        data: store,
        message: 'Store registered successfully',
      });
    } catch (error: any) {
      logger.error('Error registering store:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/v1/store/profile
   * Get store profile
   */
  async getStoreProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const store = await StoreProfile.findOne({ userId });
      if (!store) {
        return res.status(404).json({ error: 'Store not found' });
      }

      res.json({
        success: true,
        data: store,
      });
    } catch (error: any) {
      logger.error('Error fetching store profile:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * PUT /api/v1/store/profile
   * Update store profile
   */
  async updateStoreProfile(req: Request, res: Response) {
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
        businessName,
        logoUrl,
        description,
        address,
        city,
        state,
        deliveryAreas,
        contactEmail,
        contactPhone,
        website,
        payoutDetails,
      } = req.body;

      // Update fields
      if (businessName) store.businessName = businessName;
      if (logoUrl) store.logoUrl = logoUrl;
      if (description) store.description = description;
      if (address) store.address = address;
      if (city) store.city = city;
      if (state) store.state = state;
      if (deliveryAreas) store.deliveryAreas = deliveryAreas;
      if (contactEmail) store.contactEmail = contactEmail;
      if (contactPhone) store.contactPhone = contactPhone;
      if (website) store.website = website;
      if (payoutDetails) store.payoutDetails = payoutDetails;

      await store.save();

      logger.info(`Store profile updated: ${store._id}`);

      res.json({
        success: true,
        data: store,
        message: 'Store profile updated successfully',
      });
    } catch (error: any) {
      logger.error('Error updating store profile:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /api/v1/store/membership/checkout
   * Initialize membership purchase
   */
  async initializeMembershipCheckout(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { membershipLevel, paymentProvider } = req.body;

      if (!['premium', 'enterprise'].includes(membershipLevel)) {
        return res.status(400).json({ error: 'Invalid membership level' });
      }

      const store = await StoreProfile.findOne({ userId });
      if (!store) {
        return res.status(404).json({ error: 'Store not found' });
      }

      const checkoutData = await paymentService.initializeMembershipPurchase(
        store._id.toString(),
        userId,
        membershipLevel,
        paymentProvider || 'paystack'
      );

      res.json({
        success: true,
        data: checkoutData,
        message: 'Membership checkout initialized',
      });
    } catch (error: any) {
      logger.error('Error initializing membership checkout:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /api/v1/store/credits/checkout
   * Initialize ad credits purchase
   */
  async initializeCreditsCheckout(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { creditsAmount, paymentProvider } = req.body;

      if (!creditsAmount || creditsAmount <= 0) {
        return res.status(400).json({ error: 'Invalid credits amount' });
      }

      const store = await StoreProfile.findOne({ userId });
      if (!store) {
        return res.status(404).json({ error: 'Store not found' });
      }

      const checkoutData = await paymentService.initializeCreditsPurchase(
        store._id.toString(),
        userId,
        creditsAmount,
        paymentProvider || 'paystack'
      );

      res.json({
        success: true,
        data: checkoutData,
        message: 'Credits checkout initialized',
      });
    } catch (error: any) {
      logger.error('Error initializing credits checkout:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/v1/store/membership/plans
   * Get available membership plans
   */
  getMembershipPlans(req: Request, res: Response) {
    try {
      const plans = paymentService.getMembershipPlans();
      res.json({
        success: true,
        data: plans,
      });
    } catch (error: any) {
      logger.error('Error fetching membership plans:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/v1/store/payments
   * Get payment history
   */
  async getPaymentHistory(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const store = await StoreProfile.findOne({ userId });
      if (!store) {
        return res.status(404).json({ error: 'Store not found' });
      }

      const { limit = 50 } = req.query;
      const payments = await paymentService.getPaymentHistory(store._id.toString(), Number(limit));

      res.json({
        success: true,
        data: payments,
      });
    } catch (error: any) {
      logger.error('Error fetching payment history:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export const storeController = new StoreController();
