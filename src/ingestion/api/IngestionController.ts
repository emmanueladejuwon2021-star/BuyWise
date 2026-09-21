/**
 * PHASE 3 - INGESTION: Main Controller
 * 
 * Provides the main API for the ingestion system:
 * - Trigger scraping jobs
 * - Process feed uploads
 * - Get health status
 * - Admin monitoring endpoints
 */

import { ScrapeQueue } from '../queues/ScrapeQueue';
import { FeedIngestionQueue } from '../queues/FeedIngestionQueue';
import { PriceValidationQueue } from '../queues/PriceValidationQueue';
import { JumiaScraper } from '../scrapers/JumiaScraper';
import { IngestionPipeline } from '../pipeline/IngestionPipeline';
import { HealthMonitor } from '../monitoring/HealthMonitor';
import { Product } from '../../types';
import { products as initialProducts } from '../../data/products';

export class IngestionController {
  private scrapeQueue: ScrapeQueue;
  private feedQueue: FeedIngestionQueue;
  private validationQueue: PriceValidationQueue;
  private scraper: JumiaScraper;
  private pipeline: IngestionPipeline;
  private healthMonitor: HealthMonitor;
  private currentProducts: Product[];

  constructor() {
    // Initialize queues
    this.scrapeQueue = new ScrapeQueue();
    this.feedQueue = new FeedIngestionQueue();
    this.validationQueue = new PriceValidationQueue();

    // Initialize scraper
    this.scraper = new JumiaScraper();

    // Initialize pipeline with current products
    this.currentProducts = [...initialProducts];
    this.pipeline = new IngestionPipeline(this.currentProducts);

    // Initialize health monitor
    this.healthMonitor = new HealthMonitor();
    this.healthMonitor.registerScraper(this.scraper);
    this.healthMonitor.registerQueue(this.scrapeQueue, 'ScrapeQueue');
    this.healthMonitor.registerQueue(this.feedQueue, 'FeedIngestionQueue');
    this.healthMonitor.registerQueue(this.validationQueue, 'PriceValidationQueue');
    this.healthMonitor.setPriceTracker(this.pipeline.getPriceTracker());

    // Setup queue processors
    this.setupQueueProcessors();

    console.log('[IngestionController] Initialized successfully');
  }

  /**
   * Setup queue processors
   */
  private setupQueueProcessors(): void {
    // Scrape queue processor
    this.scrapeQueue.process(async (job) => {
      console.log(`[ScrapeQueue] Processing job: ${job.data.url}`);
      const result = await this.scraper.scrapeWithRetry(job.data.url);
      
      if (result.success) {
        // Process through pipeline
        const pipelineResult = await this.pipeline.processScrapedProducts(
          result.products,
          job.data.retailerId
        );
        
        return { scrapeResult: result, pipelineResult };
      }
      
      throw new Error(result.error);
    });

    // Feed queue processor
    this.feedQueue.process(async (job) => {
      console.log(`[FeedQueue] Processing feed from ${job.data.retailerId}`);
      // In production, this would fetch and parse the feed
      // For now, simulate feed processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, productsProcessed: 0 };
    });

    // Validation queue processor
    this.validationQueue.process(async (job) => {
      console.log(`[ValidationQueue] Validating price for ${job.data.productId}`);
      const result = await this.scraper.scrape(job.data.url);
      
      if (result.success && result.products.length > 0) {
        const product = result.products[0];
        const pipelineResult = await this.pipeline.processScrapedProducts(
          [product],
          job.data.retailerId
        );
        return { result, pipelineResult };
      }
      
      throw new Error('Validation failed');
    });
  }

  /**
   * Trigger a scrape job for a specific URL
   */
  async triggerScrape(url: string, retailerId: string = 'jumia', priority: number = 1) {
    const job = await this.scrapeQueue.addScrapeJob({
      url,
      retailerId,
      priority,
    });

    return {
      jobId: job.id,
      status: job.status,
      message: 'Scrape job queued successfully',
    };
  }

  /**
   * Trigger scraping for an entire category
   */
  async triggerCategoryScrape(category: string, retailerId: string = 'jumia', maxProducts: number = 10) {
    const config = this.scraper['config'];
    const categoryUrl = config.categoryUrls[category];
    
    if (!categoryUrl) {
      throw new Error(`Category ${category} not supported for ${retailerId}`);
    }

    const fullUrl = `${config.baseUrl}${categoryUrl}`;
    
    // Scrape category
    const result = await this.scraper.scrapeCategory(category, maxProducts);
    
    if (result.success) {
      // Process through pipeline
      const pipelineResult = await this.pipeline.processScrapedProducts(
        result.products,
        retailerId
      );

      return {
        success: true,
        productsScraped: result.products.length,
        pipelineResult,
      };
    }

    throw new Error(result.error);
  }

  /**
   * Submit a merchant feed (Tier 3)
   */
  async submitMerchantFeed(
    retailerId: string,
    feedType: 'json' | 'xml' | 'csv',
    feedData: string
  ) {
    const job = await this.feedQueue.addFeedJob({
      retailerId,
      feedType,
      feedData,
    });

    return {
      jobId: job.id,
      status: job.status,
      message: 'Feed ingestion job queued successfully',
    };
  }

  /**
   * Trigger price validation for stale prices
   */
  async triggerPriceValidation(productId: string, retailerId: string) {
    const product = this.currentProducts.find(p => p.id === productId);
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    const listing = product.listings.find(l => l.store.id === retailerId);
    if (!listing) {
      throw new Error(`No listing found for ${productId} at ${retailerId}`);
    }

    const job = await this.validationQueue.addValidationJob({
      productId,
      retailerId,
      currentPrice: listing.price,
      currency: listing.currency,
      lastVerified: new Date(listing.lastVerified).getTime(),
      url: listing.affiliateUrl,
    });

    return {
      jobId: job.id,
      status: job.status,
      message: 'Price validation job queued',
    };
  }

  /**
   * Get health status
   */
  getHealthStatus() {
    return this.healthMonitor.getHealthMetrics();
  }

  /**
   * Get admin summary
   */
  getAdminSummary() {
    return this.healthMonitor.getAdminSummary();
  }

  /**
   * Get queue statistics
   */
  getQueueStats() {
    return {
      scrapeQueue: this.scrapeQueue.getStats(),
      feedQueue: this.feedQueue.getStats(),
      validationQueue: this.validationQueue.getStats(),
    };
  }

  /**
   * Get price history for a product
   */
  getPriceHistory(productId: string, retailerId?: string) {
    const tracker = this.pipeline.getPriceTracker();
    
    if (retailerId) {
      return tracker.getPriceHistory(productId, retailerId);
    }
    
    return tracker.getAllPriceHistory(productId);
  }

  /**
   * Get recent price changes
   */
  getRecentPriceChanges(limit: number = 50) {
    return this.pipeline.getPriceTracker().getRecentPriceChanges(limit);
  }

  /**
   * Get outliers requiring review
   */
  getOutliers() {
    return this.pipeline.getPriceTracker().getOutliers();
  }

  /**
   * Get updated products after ingestion
   */
  getUpdatedProducts() {
    return this.pipeline.getUpdatedProducts();
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(limit: number = 20) {
    return this.healthMonitor.getRecentAlerts(limit);
  }

  /**
   * Manually trigger a full sync for a retailer
   */
  async triggerFullSync(retailerId: string = 'jumia') {
    console.log(`[IngestionController] Triggering full sync for ${retailerId}`);
    
    // In production, this would scrape all categories
    const categories = ['phones', 'laptops', 'electronics', 'fashion'];
    const results = [];

    for (const category of categories) {
      try {
        const result = await this.triggerCategoryScrape(category, retailerId, 5);
        results.push({ category, ...result, success: true });
      } catch (error: any) {
        results.push({ category, success: false, error: error.message });
      }
    }

    this.healthMonitor.recordFullSync();

    return {
      success: true,
      retailerId,
      categories: results,
      timestamp: Date.now(),
    };
  }
}

// Singleton instance
let controllerInstance: IngestionController | null = null;

export function getIngestionController(): IngestionController {
  if (!controllerInstance) {
    controllerInstance = new IngestionController();
  }
  return controllerInstance;
}
