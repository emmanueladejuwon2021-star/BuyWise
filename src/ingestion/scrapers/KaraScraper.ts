/**
 * PHASE 3 - INGESTION: Real Kara Nigeria Scraper
 */

import { BaseScraper, ScrapedProduct, ScrapeResult } from './BaseScraper';
import { ScraperOptions } from '../config/scraperConfig';
import { RealLiveScraper } from '../../services/realLiveScraper';

export class KaraScraper extends BaseScraper {
  constructor() {
    super('kara');
  }

  protected async scrapePage(url: string, options: ScraperOptions): Promise<ScrapedProduct[]> {
    console.log(`[KaraScraper] Initiating real live scrape for: ${url}`);
    const query = url.includes('?') ? new URL(url).searchParams.get('q') || 'electronics' : url.split('/').pop() || 'electronics';
    const results = await RealLiveScraper.scrapeSlotOrKara('kara', query);
    if (results.length === 0 && url.startsWith('http')) {
      const single = await RealLiveScraper.scrapeArbitraryUrl(url);
      return [single];
    }
    return results;
  }

  async scrapeCategory(category: string, maxProducts: number = 10): Promise<ScrapeResult> {
    const startTime = Date.now();
    try {
      const products = await RealLiveScraper.scrapeSlotOrKara('kara', category);
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
