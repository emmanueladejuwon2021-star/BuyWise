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
 * Jumia Nigeria Scraper
 * Real implementation using Puppeteer + Cheerio
 */
export class JumiaScraper extends BaseScraper {
  constructor() {
    super('jumia', 'https://www.jumia.com.ng');
  }

  /**
   * Extract products from Jumia page
   */
  protected async extractProducts(page: Page, url: string): Promise<ScrapedProduct[]> {
    // Get page HTML
    const html = await page.content();
    const $ = cheerio.load(html);

    const products: ScrapedProduct[] = [];

    // Jumia product cards selector
    const productCards = $('article.product-item, div.product-card, article.prd');

    logger.info(`[${this.retailerId}] Found ${productCards.length} product cards`);

    productCards.each((index, element) => {
      try {
        const $el = $(element);

        // Extract title
        const title = $el.find('h2.name, h3.name, a.core').text().trim();
        if (!title) return;

        // Extract price
        const priceText = $el.find('span.price, div.price span, span[data-price]').text().trim();
        const price = this.parsePrice(priceText);
        if (!price || price <= 0) return;

        // Extract original price (if discounted)
        const originalPriceText = $el.find('span.old-price, span.orig-price').text().trim();
        const originalPrice = originalPriceText ? this.parsePrice(originalPriceText) : undefined;

        // Extract product URL
        let productUrl = $el.find('a.core, a.link').attr('href') || '';
        if (productUrl && !productUrl.startsWith('http')) {
          productUrl = `${this.baseUrl}${productUrl}`;
        }

        // Extract image
        const imageUrl = $el.find('img.img, img').attr('data-src') || $el.find('img').attr('src');

        // Extract brand (if available)
        const brand = $el.find('span.brand, div.brand').text().trim() || undefined;

        // Check stock status
        const stockText = $el.find('span.stock, div.stock').text().toLowerCase();
        const inStock = !stockText.includes('out of stock');
        const stockLevel = stockText.includes('low') ? 'low-stock' : 
                          stockText.includes('out') ? 'out-of-stock' : 'in-stock';

        // Extract seller rating
        const ratingText = $el.find('span.stars, div.rating').attr('data-rating') || 
                          $el.find('span.stars').text().trim();
        const sellerRating = ratingText ? parseFloat(ratingText) : undefined;

        // Extract review count
        const reviewText = $el.find('span.reviews, div.reviews').text().trim();
        const reviewCount = reviewText ? parseInt(reviewText.replace(/\D/g, '')) : undefined;

        // Calculate discount
        const discount = originalPrice && originalPrice > price
          ? Math.round(((originalPrice - price) / originalPrice) * 100)
          : 0;

        products.push({
          title,
          brand,
          category: 'general', // Will be mapped later
          price,
          originalPrice,
          currency: '₦',
          inStock,
          stockLevel,
          shippingCost: 0, // Jumia often has free shipping
          deliveryDays: '2-4',
          sellerName: 'Jumia',
          sellerRating,
          reviewCount,
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
    
    // Remove currency symbols and whitespace
    const cleaned = priceString
      .replace(/[₦$€£]/g, '')
      .replace(/\s/g, '')
      .replace(/,/g, '');

    // Extract numeric value
    const match = cleaned.match(/[\d.]+/);
    if (!match) return 0;

    const parsed = parseFloat(match[0]);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Scrape a specific product page
   */
  async scrapeProductPage(url: string): Promise<ScrapedProduct | null> {
    let page: Page | null = null;

    try {
      page = await this.createPage();
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      await this.waitForPageLoad(page);

      const html = await page.content();
      const $ = cheerio.load(html);

      // Extract product details from product page
      const title = $('h1.name, h1.title, span.name').text().trim();
      const priceText = $('span.price, span.product-price').text().trim();
      const price = this.parsePrice(priceText);

      if (!title || !price) {
        return null;
      }

      const originalPriceText = $('span.old-price, span.orig-price').text().trim();
      const originalPrice = originalPriceText ? this.parsePrice(originalPriceText) : undefined;

      const brand = $('a.brand, span.brand').text().trim() || undefined;
      const imageUrl = $('div.gallery img, img.product-image').attr('src') || undefined;

      // Extract specifications
      const specifications: Record<string, string> = {};
      $('div.specifications li, table.specs tr').each((_, el) => {
        const $el = $(el);
        const key = $el.find('strong, th, td:first-child').text().trim();
        const value = $el.find('span, td:last-child').text().trim();
        if (key && value) {
          specifications[key] = value;
        }
      });

      // Extract description
      const description = $('div.description, div.product-description').text().trim();

      // Check stock
      const stockText = $('span.stock, div.stock-status').text().toLowerCase();
      const inStock = !stockText.includes('out of stock');

      return {
        title,
        brand,
        category: 'general',
        price,
        originalPrice,
        currency: '₦',
        inStock,
        stockLevel: inStock ? 'in-stock' : 'out-of-stock',
        shippingCost: 0,
        deliveryDays: '2-4',
        sellerName: 'Jumia',
        sellerRating: undefined,
        reviewCount: undefined,
        imageUrl,
        productUrl: url,
        specifications,
      };

    } catch (error: any) {
      logger.error(`[${this.retailerId}] Error scraping product page:`, error.message);
      return null;
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  /**
   * Scrape category page
   */
  async scrapeCategory(category: string, maxPages: number = 3): Promise<ScrapedProduct[]> {
    const allProducts: ScrapedProduct[] = [];
    const categoryUrls: Record<string, string> = {
      phones: '/smartphones/',
      laptops: '/laptops/',
      electronics: '/electronics/',
      fashion: '/fashion/',
      appliances: '/home-appliances/',
    };

    const categoryPath = categoryUrls[category] || '/';
    
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const url = `${this.baseUrl}${categoryPath}?page=${pageNum}`;
      logger.info(`[${this.retailerId}] Scraping ${category} page ${pageNum}`);

      const result = await this.scrape(url);
      
      if (result.success) {
        allProducts.push(...result.products);
        
        // Add delay between pages
        await this.randomDelay(3000, 6000);
      } else {
        logger.error(`[${this.retailerId}] Failed to scrape page ${pageNum}:`, result.error);
        break;
      }
    }

    return allProducts;
  }
}
