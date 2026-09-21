import { Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import { BaseScraper, ScrapedProduct } from './BaseScraper';
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

/**
 * Konga Nigeria Scraper
 * Real implementation using Puppeteer + Cheerio
 */
export class KongaScraper extends BaseScraper {
  constructor() {
    super('konga', 'https://www.konga.com');
  }

  /**
   * Extract products from Konga page
   */
  protected async extractProducts(page: Page, url: string): Promise<ScrapedProduct[]> {
    const html = await page.content();
    const $ = cheerio.load(html);

    const products: ScrapedProduct[] = [];

    // Konga product cards selector
    const productCards = $('div.product, div.product-card, article.product');

    logger.info(`[${this.retailerId}] Found ${productCards.length} product cards`);

    productCards.each((index, element) => {
      try {
        const $el = $(element);

        // Extract title
        const title = $el.find('h3.product-title, a.product-title, span.product-title').text().trim();
        if (!title) return;

        // Extract price
        const priceText = $el.find('span.price, span.product-price, div.price span').text().trim();
        const price = this.parsePrice(priceText);
        if (!price || price <= 0) return;

        // Extract original price
        const originalPriceText = $el.find('span.old-price, span.was-price').text().trim();
        const originalPrice = originalPriceText ? this.parsePrice(originalPriceText) : undefined;

        // Extract product URL
        let productUrl = $el.find('a.product-title, a.product-link').attr('href') || '';
        if (productUrl && !productUrl.startsWith('http')) {
          productUrl = `${this.baseUrl}${productUrl}`;
        }

        // Extract image
        const imageUrl = $el.find('img.product-image, img').attr('src') || $el.find('img').attr('data-src');

        // Extract brand
        const brand = $el.find('span.brand, div.brand').text().trim() || undefined;

        // Check stock
        const stockText = $el.find('span.stock-status, div.stock').text().toLowerCase();
        const inStock = !stockText.includes('out of stock');
        const stockLevel = stockText.includes('low') ? 'low-stock' : 
                          stockText.includes('out') ? 'out-of-stock' : 'in-stock';

        // Extract rating
        const ratingText = $el.find('span.rating, div.rating').attr('data-rating');
        const sellerRating = ratingText ? parseFloat(ratingText) : undefined;

        products.push({
          title,
          brand,
          category: 'general',
          price,
          originalPrice,
          currency: '₦',
          inStock,
          stockLevel,
          shippingCost: 0,
          deliveryDays: '3-5',
          sellerName: 'Konga',
          sellerRating,
          imageUrl,
          productUrl,
          specifications: {},
        });

      } catch (error: any) {
        logger.error(`[${this.retailerId}] Error extracting product ${index}:`, error.message);
      }
    });

    logger.info(`[${this.retailerId}] Successfully extracted ${products.length} products`);
    return products;
  }

  /**
   * Parse price string to number
   */
  private parsePrice(priceString: string): number {
    if (!priceString) return 0;
    
    const cleaned = priceString
      .replace(/[₦$€£]/g, '')
      .replace(/\s/g, '')
      .replace(/,/g, '');

    const match = cleaned.match(/[\d.]+/);
    if (!match) return 0;

    const parsed = parseFloat(match[0]);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Scrape category page
   */
  async scrapeCategory(category: string, maxPages: number = 3): Promise<ScrapedProduct[]> {
    const allProducts: ScrapedProduct[] = [];
    const categoryUrls: Record<string, string> = {
      phones: '/search?search=phones',
      laptops: '/search?search=laptops',
      electronics: '/search?search=electronics',
      fashion: '/search?search=fashion',
    };

    const categoryPath = categoryUrls[category] || '/search';
    
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const url = `${this.baseUrl}${categoryPath}&page=${pageNum}`;
      logger.info(`[${this.retailerId}] Scraping ${category} page ${pageNum}`);

      const result = await this.scrape(url);
      
      if (result.success) {
        allProducts.push(...result.products);
        await this.randomDelay(3000, 6000);
      } else {
        logger.error(`[${this.retailerId}] Failed to scrape page ${pageNum}:`, result.error);
        break;
      }
    }

    return allProducts;
  }
}
