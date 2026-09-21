/**
 * PHASE 3 - INGESTION: Feed Ingestion Queue
 * 
 * Handles bulk feed processing (JSON/XML/CSV) with:
 * - Large file processing
 * - Delta updates (only update changed fields)
 * - Batch processing for efficiency
 */

import { Queue } from './QueueManager';

export interface FeedJobData {
  retailerId: string;
  feedType: 'json' | 'xml' | 'csv';
  feedUrl?: string;
  feedData?: string; // Raw feed content for uploaded feeds
  category?: string;
  isDeltaUpdate?: boolean;
}

export class FeedIngestionQueue extends Queue<FeedJobData> {
  constructor() {
    super('FeedIngestionQueue', {
      concurrency: 3, // Lower concurrency for heavy feed processing
      maxRetries: 2,
      retryDelay: 30000, // 30 seconds for feed retries
      rateLimitPerMinute: 10, // Max 10 feeds per minute
    });
  }

  /**
   * Add a feed ingestion job
   */
  async addFeedJob(data: FeedJobData): Promise<any> {
    return this.add(`feed_${data.retailerId}_${data.feedType}`, data, {
      priority: 2, // Higher priority for feeds
    });
  }

  /**
   * Schedule recurring feed ingestion
   */
  scheduleRecurringFeed(retailerId: string, feedType: 'json' | 'xml' | 'csv', feedUrl: string, intervalMinutes: number) {
    const addJob = async () => {
      await this.addFeedJob({
        retailerId,
        feedType,
        feedUrl,
        isDeltaUpdate: true,
      });
      
      // Schedule next run
      setTimeout(addJob, intervalMinutes * 60 * 1000);
    };

    // Start the recurring job
    addJob();
  }
}
