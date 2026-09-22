/**
 * PHASE 3 - INGESTION: Direct Registered Seller Stores Scraper
 * 
 * Ingests products listed by direct verified merchants on the PriceWise platform.
 */

import { BaseScraper, ScrapedProduct, ScrapeResult } from './BaseScraper';
import { ScraperOptions } from '../config/scraperConfig';
import { RealLiveScraper } from '../../services/realLiveScraper';

export class SellerStoreScraper extends BaseScraper {
  constructor() {
    super('apex_electronics');
  }

  protected async scrapePage(url: string, options: ScraperOptions): Promise<ScrapedProduct[]> {
    console.log(`[SellerStoreScraper] Ingesting registered merchant inventory for: ${url}`);
    return await RealLiveScraper.scrapeRegisteredSellerStores(url);
  }

  async scrapeCategory(category: string, maxProducts: number = 10): Promise<ScrapeResult> {
    const startTime = Date.now();
    try {
      const products = await RealLiveScraper.scrapeRegisteredSellerStores(category);
      return {
        success: products.length > 0,
        products: products.slice(0, maxProducts),
        duration: Date.now() - startTime,
        retailerId: this.retailerId,
        timestamp: Date.now(),
      };
    } catch (error: any) {
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
}
