/**
 * PHASE 3 - INGESTION: Scrape Queue
 * 
 * Handles web scraping jobs with:
 * - Domain-specific rate limiting
 * - Concurrent scraping limits per retailer
 * - Retry logic for failed scrapes
 * - Anti-blocking mechanisms
 */

import { Queue } from './QueueManager';

export interface ScrapeJobData {
  url: string;
  retailerId: string;
  productId?: string;
  category?: string;
  priority?: number;
  userAgent?: string;
  proxy?: string;
}

export class ScrapeQueue extends Queue<ScrapeJobData> {
  private domainQueues: Map<string, number> = new Map();
  
  constructor() {
    super('ScrapeQueue', {
      concurrency: 10, // Max 10 concurrent scrapes
      maxRetries: 3,
      retryDelay: 10000, // 10 seconds
      rateLimitPerMinute: 30, // Max 30 requests per minute
    });
  }

  /**
   * Add a scrape job with domain tracking
   */
  async addScrapeJob(data: ScrapeJobData): Promise<any> {
    // Track domain concurrency
    const currentCount = this.domainQueues.get(data.retailerId) || 0;
    
    // Max 2 concurrent scrapes per domain
    if (currentCount >= 2) {
      // Add to queue with delay
      return this.add(`scrape_${data.retailerId}`, data, {
        delay: 5000,
        priority: data.priority || 0,
      });
    }

    this.domainQueues.set(data.retailerId, currentCount + 1);

    const job = await this.add(`scrape_${data.retailerId}`, data, {
      priority: data.priority || 0,
    });

    // Decrement domain counter when job completes
    this.on('completed', (completedJob: any) => {
      if (completedJob.id === job.id) {
        const count = this.domainQueues.get(data.retailerId) || 0;
        this.domainQueues.set(data.retailerId, Math.max(0, count - 1));
      }
    });

    this.on('failed', (failedJob: any) => {
      if (failedJob.id === job.id) {
        const count = this.domainQueues.get(data.retailerId) || 0;
        this.domainQueues.set(data.retailerId, Math.max(0, count - 1));
      }
    });

    return job;
  }

  /**
   * Get domain-specific stats
   */
  getDomainStats() {
    return Object.fromEntries(this.domainQueues);
  }

  /**
   * Bulk add scrape jobs for a category
   */
  async addBulkScrapeJobs(urls: Array<{ url: string; productId: string }>, retailerId: string, category: string) {
    const jobs = [];
    for (let i = 0; i < urls.length; i++) {
      const job = await this.addScrapeJob({
        url: urls[i].url,
        retailerId,
        productId: urls[i].productId,
        category,
        priority: 1,
      });
      jobs.push(job);
      
      // Stagger jobs to avoid overwhelming the queue
      if (i % 5 === 0 && i > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    return jobs;
  }
}
