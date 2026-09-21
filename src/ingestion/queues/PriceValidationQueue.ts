/**
 * PHASE 3 - INGESTION: Price Validation Queue
 * 
 * Handles re-validation of stale prices with:
 * - Automatic detection of prices older than 24 hours
 * - Priority-based re-validation
 * - Batch processing for efficiency
 */

import { Queue } from './QueueManager';

export interface PriceValidationJobData {
  productId: string;
  retailerId: string;
  currentPrice: number;
  currency: string;
  lastVerified: number;
  url: string;
}

export class PriceValidationQueue extends Queue<PriceValidationJobData> {
  constructor() {
    super('PriceValidationQueue', {
      concurrency: 8,
      maxRetries: 2,
      retryDelay: 15000,
      rateLimitPerMinute: 40,
    });
  }

  /**
   * Add a price validation job
   */
  async addValidationJob(data: PriceValidationJobData): Promise<any> {
    // Calculate priority based on staleness
    const hoursSinceVerification = (Date.now() - data.lastVerified) / (1000 * 60 * 60);
    const priority = Math.min(10, Math.floor(hoursSinceVerification)); // Higher priority for older prices

    return this.add(`validate_${data.productId}_${data.retailerId}`, data, {
      priority,
    });
  }

  /**
   * Bulk add validation jobs for stale prices
   */
  async addBulkValidationJobs(products: PriceValidationJobData[]) {
    const jobs = [];
    for (const product of products) {
      const job = await this.addValidationJob(product);
      jobs.push(job);
    }
    return jobs;
  }

  /**
   * Schedule automatic stale price detection
   */
  scheduleStalePriceDetection(getStalePrices: () => Promise<PriceValidationJobData[]>, intervalMinutes: number = 60) {
    const checkAndValidate = async () => {
      try {
        const stalePrices = await getStalePrices();
        if (stalePrices.length > 0) {
          console.log(`[PriceValidation] Found ${stalePrices.length} stale prices, scheduling validation...`);
          await this.addBulkValidationJobs(stalePrices);
        }
      } catch (error) {
        console.error('[PriceValidation] Error checking stale prices:', error);
      }
      
      // Schedule next check
      setTimeout(checkAndValidate, intervalMinutes * 60 * 1000);
    };

    // Start the recurring check
    checkAndValidate();
  }
}
