/**
 * PHASE 3 - INGESTION: Base Scraper
 * 
 * Abstract base class for all scrapers with:
 * - User-Agent rotation
 * - Rate limiting
 * - Retry logic with exponential backoff
 * - Error handling
 * - robots.txt compliance checking
 */

import { 
  getRandomUserAgent, 
  getRetailerConfig, 
  calculateDelayWithJitter,
  calculateBackoffDelay,
  ScraperOptions,
  DEFAULT_SCRAPER_OPTIONS,
  RetailerConfig
} from '../config/scraperConfig';

export interface ScrapedProduct {
  title: string;
  brand?: string;
  category?: string;
  price: number;
  originalPrice?: number;
  currency: string;
  inStock: boolean;
  stockLevel?: 'in-stock' | 'low-stock' | 'out-of-stock';
  shippingCost?: number;
  deliveryDays?: string;
  sellerName?: string;
  sellerRating?: number;
  reviewCount?: number;
  imageUrl?: string;
  productUrl: string;
  specifications?: Record<string, string>;
}

export interface ScrapeResult {
  success: boolean;
  products: ScrapedProduct[];
  error?: string;
  duration: number;
  retailerId: string;
  timestamp: number;
}

export abstract class BaseScraper {
  protected retailerId: string;
  protected config: RetailerConfig;
  protected lastRequestTime: number = 0;
  protected requestCount: number = 0;
  protected consecutiveFailures: number = 0;
  protected isBlocked: boolean = false;
  
  constructor(retailerId: string) {
    this.retailerId = retailerId;
    const config = getRetailerConfig(retailerId);
    if (!config) {
      throw new Error(`No configuration found for retailer: ${retailerId}`);
    }
    this.config = config;
  }

  /**
   * Abstract method to be implemented by specific scrapers
   */
  protected abstract scrapePage(url: string, options: ScraperOptions): Promise<ScrapedProduct[]>;

  /**
   * Check if we need to wait before making next request
   */
  protected async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const requiredDelay = calculateDelayWithJitter(this.config.requestDelay);

    if (timeSinceLastRequest < requiredDelay) {
      const waitTime = requiredDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  /**
   * Check robots.txt compliance (simulated)
   */
  protected async checkRobotsTxt(url: string): Promise<boolean> {
    if (!this.config.robotsTxtRespect) return true;
    
    // In production, this would fetch and parse robots.txt
    // For now, we simulate compliance checking
    const blockedPaths = ['/admin', '/api', '/checkout', '/cart'];
    const urlPath = new URL(url).pathname;
    
    return !blockedPaths.some(path => urlPath.startsWith(path));
  }

  /**
   * Main scrape method with error handling and retries
   */
  async scrape(url: string, options: Partial<ScraperOptions> = {}): Promise<ScrapeResult> {
    const startTime = Date.now();
    const mergedOptions = { ...DEFAULT_SCRAPER_OPTIONS, ...options };

    try {
      // Check if blocked
      if (this.isBlocked) {
        throw new Error('Scraper is currently blocked. Please wait before retrying.');
      }

      // Check robots.txt
      const allowed = await this.checkRobotsTxt(url);
      if (!allowed) {
        throw new Error('URL is blocked by robots.txt');
      }

      // Enforce rate limiting
      await this.enforceRateLimit();

      // Add random user agent if not specified
      if (!mergedOptions.userAgent) {
        mergedOptions.userAgent = getRandomUserAgent();
      }

      // Perform the scrape
      const products = await this.scrapePage(url, mergedOptions);

      // Reset failure counter on success
      this.consecutiveFailures = 0;

      return {
        success: true,
        products,
        duration: Date.now() - startTime,
        retailerId: this.retailerId,
        timestamp: Date.now(),
      };
    } catch (error: any) {
      this.consecutiveFailures++;

      // Check for blocking indicators
      if (error.message?.includes('429') || error.message?.includes('blocked')) {
        this.isBlocked = true;
        console.error(`[${this.retailerId}] Scraper blocked. Cooling down...`);
        
        // Unblock after 5 minutes
        setTimeout(() => {
          this.isBlocked = false;
          this.consecutiveFailures = 0;
        }, 5 * 60 * 1000);
      }

      // Check for schema changes (5 consecutive failures)
      if (this.consecutiveFailures >= 5) {
        console.error(`[${this.retailerId}] Schema change detected! 5 consecutive failures.`);
        // In production, this would trigger an admin alert
      }

      return {
        success: false,
        products: [],
        error: error.message,
        duration: Date.now() - startTime,
        retailerId: this.retailerId,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Scrape with automatic retry and exponential backoff
   */
  async scrapeWithRetry(url: string, maxRetries: number = 3, options: Partial<ScraperOptions> = {}): Promise<ScrapeResult> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const result = await this.scrape(url, options);

      if (result.success) {
        return result;
      }

      lastError = new Error(result.error);

      // Don't retry if blocked
      if (this.isBlocked) {
        break;
      }

      // Wait with exponential backoff before retry
      if (attempt < maxRetries) {
        const delay = calculateBackoffDelay(attempt);
        console.log(`[${this.retailerId}] Retry ${attempt}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return {
      success: false,
      products: [],
      error: `Failed after ${maxRetries} attempts: ${lastError?.message}`,
      duration: 0,
      retailerId: this.retailerId,
      timestamp: Date.now(),
    };
  }

  /**
   * Get scraper health status
   */
  getHealthStatus() {
    return {
      retailerId: this.retailerId,
      isBlocked: this.isBlocked,
      consecutiveFailures: this.consecutiveFailures,
      totalRequests: this.requestCount,
      lastRequestTime: this.lastRequestTime,
      isHealthy: this.consecutiveFailures < 5 && !this.isBlocked,
    };
  }

  /**
   * Reset scraper state
   */
  reset(): void {
    this.consecutiveFailures = 0;
    this.isBlocked = false;
    this.requestCount = 0;
    this.lastRequestTime = 0;
  }
}
