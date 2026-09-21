import puppeteer, { Browser, Page } from 'puppeteer';
import winston from 'winston';
import { config } from '../config';

const logger = winston.createLogger({
  level: config.logLevel,
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

// User agents for rotation
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
];

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

/**
 * Abstract base class for all scrapers
 * Uses Puppeteer for real browser-based scraping
 */
export abstract class BaseScraper {
  protected retailerId: string;
  protected baseUrl: string;
  protected browser: Browser | null = null;
  protected requestCount: number = 0;
  protected consecutiveFailures: number = 0;
  protected isBlocked: boolean = false;
  
  constructor(retailerId: string, baseUrl: string) {
    this.retailerId = retailerId;
    this.baseUrl = baseUrl;
  }

  /**
   * Launch browser instance
   */
  protected async launchBrowser(): Promise<Browser> {
    if (this.browser && this.browser.connected) {
      return this.browser;
    }

    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--single-process',
      ],
    });

    return this.browser;
  }

  /**
   * Create a new page with anti-detection measures
   */
  protected async createPage(): Promise<Page> {
    const browser = await this.launchBrowser();
    const page = await browser.newPage();

    // Set random user agent
    const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    await page.setUserAgent(userAgent);

    // Set viewport
    await page.setViewport({
      width: 1920 + Math.floor(Math.random() * 100),
      height: 1080 + Math.floor(Math.random() * 100),
      deviceScaleFactor: 1,
      hasTouch: false,
      isLandscape: true,
    });

    // Set extra headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
    });

    // Block images and CSS for faster scraping (optional)
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    return page;
  }

  /**
   * Add random delay to avoid detection
   */
  protected async randomDelay(min: number = 2000, max: number = 5000): Promise<void> {
    const delay = min + Math.random() * (max - min);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Wait for page to fully load
   */
  protected async waitForPageLoad(page: Page): Promise<void> {
    await page.waitForFunction(() => {
      return document.readyState === 'complete';
    }, { timeout: 30000 });
    
    // Additional wait for dynamic content
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  /**
   * Abstract method - implement in subclass to extract product data
   */
  protected abstract extractProducts(page: Page, url: string): Promise<ScrapedProduct[]>;

  /**
   * Main scrape method
   */
  async scrape(url: string): Promise<ScrapeResult> {
    const startTime = Date.now();
    let page: Page | null = null;

    try {
      if (this.isBlocked) {
        throw new Error('Scraper is blocked. Please wait before retrying.');
      }

      // Create page
      page = await this.createPage();

      // Navigate to URL
      logger.info(`[${this.retailerId}] Navigating to ${url}`);
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // Wait for page to load
      await this.waitForPageLoad(page);

      // Check for CAPTCHA or blocks
      const pageContent = await page.content();
      if (this.detectBlock(pageContent)) {
        this.isBlocked = true;
        this.consecutiveFailures++;
        throw new Error('CAPTCHA or block detected');
      }

      // Extract products
      const products = await this.extractProducts(page, url);

      // Success
      this.consecutiveFailures = 0;
      this.requestCount++;

      return {
        success: true,
        products,
        duration: Date.now() - startTime,
        retailerId: this.retailerId,
        timestamp: Date.now(),
      };
    } catch (error: any) {
      this.consecutiveFailures++;
      logger.error(`[${this.retailerId}] Scrape failed:`, error.message);

      // Check for blocking
      if (error.message.includes('429') || error.message.includes('blocked')) {
        this.isBlocked = true;
        logger.warn(`[${this.retailerId}] Scraper blocked. Cooling down for 5 minutes...`);
        
        setTimeout(() => {
          this.isBlocked = false;
          this.consecutiveFailures = 0;
        }, 5 * 60 * 1000);
      }

      return {
        success: false,
        products: [],
        error: error.message,
        duration: Date.now() - startTime,
        retailerId: this.retailerId,
        timestamp: Date.now(),
      };
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  /**
   * Detect if page shows CAPTCHA or block
   */
  protected detectBlock(pageContent: string): boolean {
    const blockIndicators = [
      'captcha',
      'robot',
      'blocked',
      'access denied',
      'please verify',
      'unusual traffic',
    ];

    const lowerContent = pageContent.toLowerCase();
    return blockIndicators.some(indicator => lowerContent.includes(indicator));
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
      isHealthy: this.consecutiveFailures < 5 && !this.isBlocked,
    };
  }

  /**
   * Close browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
