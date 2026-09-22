/**
 * PHASE 3 - INGESTION: Real Slot Systems Scraper
 * 
 * Production-ready scraper for Slot Nigeria.
 */

import { BaseScraper, ScrapedProduct, ScrapeResult } from './BaseScraper';
import { ScraperOptions } from '../config/scraperConfig';
import { RealLiveScraper } from '../../services/realLiveScraper';

export class SlotScraper extends BaseScraper {
  constructor() {
    super('slot');
  }

  protected async scrapePage(url: string, options: ScraperOptions): Promise<ScrapedProduct[]> {
    console.log(`[SlotScraper] Initiating real live scrape for: ${url}`);
    const query = url.includes('?') ? new URL(url).searchParams.get('q') || 'phones' : url.split('/').pop() || 'phones';
    const results = await RealLiveScraper.scrapeSlotOrKara('slot', query);
    if (results.length === 0 && url.startsWith('http')) {
      const single = await RealLiveScraper.scrapeArbitraryUrl(url);
      return [single];
    }
    return results;
  }

  async scrapeCategory(category: string, maxProducts: number = 10): Promise<ScrapeResult> {
    const startTime = Date.now();
    try {
      const products = await RealLiveScraper.scrapeSlotOrKara('slot', category);
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
