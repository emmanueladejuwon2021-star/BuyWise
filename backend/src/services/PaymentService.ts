import { Payment } from '../models/Payment';
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

export interface MembershipPlan {
  level: 'free' | 'premium' | 'enterprise';
  name: string;
  price: number;
  duration: number; // in days
  features: string[];
  adCreditsIncluded: number;
}

export const MEMBERSHIP_PLANS: Record<string, MembershipPlan> = {
  free: {
    level: 'free',
    name: 'Free Store',
    price: 0,
    duration: 365,
    features: [
      'Basic store profile',
      'Regular product listing',
      'Standard search ranking',
    ],
    adCreditsIncluded: 0,
  },
  premium: {
    level: 'premium',
    name: 'Premium Store',
    price: 25000, // ₦25,000/month
    duration: 30,
    features: [
      'Verified Store badge',
      'Faster price updates',
      'Higher search priority',
      'Shopper search reports',
      'Market demand trends',
      '500 free ad credits/month',
    ],
    adCreditsIncluded: 500,
  },
  enterprise: {
    level: 'enterprise',
    name: 'Enterprise Store',
    price: 100000, // ₦100,000/month
    duration: 30,
    features: [
      'All Premium features',
      'Priority customer support',
      'Custom analytics dashboard',
      'API access',
      'Dedicated account manager',
      '2000 free ad credits/month',
    ],
    adCreditsIncluded: 2000,
  },
};

export class PaymentService {
  /**
   * Initialize membership purchase
   */
  async initializeMembershipPurchase(
    storeId: string,
    userId: string,
    membershipLevel: 'premium' | 'enterprise',
    paymentProvider: 'paystack' | 'flutterwave' | 'stripe' = 'paystack'
  ) {
    const plan = MEMBERSHIP_PLANS[membershipLevel];
    if (!plan) {
      throw new Error('Invalid membership level');
    }

    const transactionRef = `MEM_${storeId}_${Date.now()}`;

    // Create pending payment record
    const payment = new Payment({
      storeId,
      userId,
      paymentType: 'membership',
      amount: plan.price,
      currency: 'NGN',
      paymentProvider,
      transactionRef,
      status: 'pending',
      description: `${plan.name} Membership - ${plan.duration} days`,
      metadata: {
        membershipLevel,
      },
    });

    await payment.save();

    // In production, this would call Paystack/Flutterwave API
    // For now, return payment details for frontend to initiate payment
    return {
      paymentId: payment._id,
      transactionRef,
      amount: plan.price,
      currency: 'NGN',
      paymentProvider,
      // In production: authorization_url, access_code from payment gateway
      paymentUrl: `https://checkout.paystack.com/${transactionRef}`,
    };
  }

  /**
   * Initialize ad credits purchase
   */
  async initializeCreditsPurchase(
    storeId: string,
    userId: string,
    creditsAmount: number,
    paymentProvider: 'paystack' | 'flutterwave' | 'stripe' = 'paystack'
  ) {
    const costPerCredit = 50; // ₦50 per credit
    const totalAmount = creditsAmount * costPerCredit;
    const transactionRef = `CRD_${storeId}_${Date.now()}`;

    const payment = new Payment({
      storeId,
      userId,
      paymentType: 'ad_credits',
      amount: totalAmount,
      currency: 'NGN',
      paymentProvider,
      transactionRef,
      status: 'pending',
      description: `${creditsAmount} Ad Credits`,
      metadata: {
        creditsPurchased: creditsAmount,
      },
    });

    await payment.save();

    return {
      paymentId: payment._id,
      transactionRef,
      amount: totalAmount,
      currency: 'NGN',
      paymentProvider,
      paymentUrl: `https://checkout.paystack.com/${transactionRef}`,
    };
  }

  /**
   * Handle successful payment webhook
   */
  async handlePaymentSuccess(transactionRef: string) {
    const payment = await Payment.findOne({ transactionRef });
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status === 'successful') {
      logger.warn(`Payment ${transactionRef} already processed`);
      return;
    }

    // Update payment status
    payment.status = 'successful';
    payment.paidAt = new Date();
    await payment.save();

    // Process based on payment type
    if (payment.paymentType === 'membership') {
      await this.activateMembership(payment);
    } else if (payment.paymentType === 'ad_credits') {
      await this.addAdCredits(payment);
    }

    logger.info(`Payment ${transactionRef} processed successfully`);
  }

  /**
   * Handle failed payment webhook
   */
  async handlePaymentFailure(transactionRef: string, reason: string) {
    const payment = await Payment.findOne({ transactionRef });
    if (!payment) {
      throw new Error('Payment not found');
    }

    payment.status = 'failed';
    payment.failedAt = new Date();
    payment.failureReason = reason;
    await payment.save();

    logger.error(`Payment ${transactionRef} failed: ${reason}`);
  }

  /**
   * Activate store membership after successful payment
   */
  private async activateMembership(payment: any) {
    const membershipLevel = payment.metadata.membershipLevel;
    const plan = MEMBERSHIP_PLANS[membershipLevel];

    const store = await StoreProfile.findOne({ userId: payment.userId });
    if (!store) {
      throw new Error('Store not found');
    }

    // Update store membership
    store.membershipLevel = membershipLevel;
    store.membershipStatus = 'active';
    store.membershipExpiry = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000);
    store.adCreditsBalance += plan.adCreditsIncluded;
    store.totalAdCreditsPurchased += plan.adCreditsIncluded;

    await store.save();

    logger.info(`Store ${store._id} upgraded to ${membershipLevel} membership`);
  }

  /**
   * Add ad credits after successful payment
   */
  private async addAdCredits(payment: any) {
    const credits = payment.metadata.creditsPurchased;

    const store = await StoreProfile.findOne({ userId: payment.userId });
    if (!store) {
      throw new Error('Store not found');
    }

    store.adCreditsBalance += credits;
    store.totalAdCreditsPurchased += credits;
    await store.save();

    logger.info(`Added ${credits} credits to store ${store._id}`);
  }

  /**
   * Get payment history for a store
   */
  async getPaymentHistory(storeId: string, limit: number = 50) {
    const payments = await Payment.find({ storeId })
      .sort({ createdAt: -1 })
      .limit(limit);

    return payments;
  }

  /**
   * Get membership plans
   */
  getMembershipPlans() {
    return MEMBERSHIP_PLANS;
  }

  /**
   * Calculate credit cost
   */
  calculateCreditCost(credits: number) {
    return credits * 50; // ₦50 per credit
  }
}

export const paymentService = new PaymentService();
