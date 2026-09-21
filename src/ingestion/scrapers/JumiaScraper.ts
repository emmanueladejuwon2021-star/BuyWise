/**
 * PHASE 3 - INGESTION: Jumia Scraper
 * 
 * Simulated scraper for Jumia Nigeria with:
 * - JavaScript rendering simulation
 * - Product data extraction
 * - Price and stock parsing
 * - Anti-bot evasion techniques
 */

import { BaseScraper, ScrapedProduct, ScrapeResult } from './BaseScraper';
import { ScraperOptions } from '../config/scraperConfig';
import { products } from '../../data/products';

export class JumiaScraper extends BaseScraper {
  constructor() {
    super('jumia');
  }

  /**
   * Simulate scraping a Jumia product page
   * In production, this would use Puppeteer to render JavaScript and extract data
   */
  protected async scrapePage(url: string, options: ScraperOptions): Promise<ScrapedProduct[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Simulate occasional failures (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('429 Too Many Requests');
    }

    // Simulate CAPTCHA detection (2% chance)
    if (Math.random() < 0.02) {
      throw new Error('CAPTCHA detected - blocked by anti-bot system');
    }

    // Extract product ID from URL or use random product
    const productId = url.match(/product\/([^\/]+)/)?.[1];
    
    // Find matching product from our database
    let sourceProduct = products.find(p => p.id === productId);
    
    // If no specific product, return a random selection
    if (!sourceProduct) {
      sourceProduct = products[Math.floor(Math.random() * products.length)];
    }

    // Find Jumia listing for this product
    const jumiaListing = sourceProduct.listings.find(l => l.store.id === 'jumia');
    
    if (!jumiaListing) {
      // Simulate a new product not in our database
      return this.simulateNewProduct(url);
    }

    // Simulate price fluctuation (±5% from stored price)
    const priceVariation = 1 + (Math.random() * 0.1 - 0.05);
    const currentPrice = Math.round(jumiaListing.price * priceVariation);

    // Simulate stock status changes
    const stockRandom = Math.random();
    let stockLevel: 'in-stock' | 'low-stock' | 'out-of-stock' = 'in-stock';
    let inStock = true;
    
    if (stockRandom > 0.95) {
      stockLevel = 'out-of-stock';
      inStock = false;
    } else if (stockRandom > 0.85) {
      stockLevel = 'low-stock';
    }

    // Construct scraped product
    const scrapedProduct: ScrapedProduct = {
      title: sourceProduct.name,
      brand: sourceProduct.brand,
      category: sourceProduct.category,
      price: currentPrice,
      originalPrice: jumiaListing.originalPrice,
      currency: '₦',
      inStock,
      stockLevel,
      shippingCost: jumiaListing.shippingCost,
      deliveryDays: jumiaListing.deliveryDays,
      sellerName: jumiaListing.seller,
      sellerRating: jumiaListing.rating,
      reviewCount: jumiaListing.reviews,
      imageUrl: sourceProduct.images[0],
      productUrl: `https://www.jumia.com.ng/product/${sourceProduct.id}`,
      specifications: sourceProduct.specifications,
    };

    return [scrapedProduct];
  }

  /**
   * Simulate scraping a product not in our database
   */
  private simulateNewProduct(url: string): ScrapedProduct[] {
    const categories = ['phones', 'laptops', 'electronics', 'fashion'];
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    const brands: Record<string, string[]> = {
      phones: ['Samsung', 'Apple', 'Xiaomi', 'Tecno'],
      laptops: ['HP', 'Dell', 'Lenovo', 'Asus'],
      electronics: ['Sony', 'LG', 'Samsung', 'JBL'],
      fashion: ['Nike', 'Adidas', 'Puma', 'New Balance'],
    };

    const brand = brands[category][Math.floor(Math.random() * brands[category].length)];
    const basePrice = category === 'phones' ? 150000 : category === 'laptops' ? 400000 : 50000;
    const price = basePrice + Math.floor(Math.random() * basePrice);

    return [{
      title: `${brand} ${category === 'phones' ? 'Smartphone' : category === 'laptops' ? 'Laptop' : 'Product'} - New`,
      brand,
      category,
      price,
      originalPrice: Math.round(price * 1.2),
      currency: '₦',
      inStock: Math.random() > 0.1,
      stockLevel: Math.random() > 0.8 ? 'low-stock' : 'in-stock',
      shippingCost: Math.random() > 0.5 ? 0 : 2500,
      deliveryDays: '2-4',
      sellerName: 'Jumia Official Store',
      sellerRating: 4 + Math.random(),
      reviewCount: Math.floor(Math.random() * 500),
      imageUrl: 'https://via.placeholder.com/400x400',
      productUrl: url,
      specifications: {},
    }];
  }

  /**
   * Scrape category page (multiple products)
   */
  async scrapeCategory(category: string, maxProducts: number = 10): Promise<ScrapeResult> {
    const startTime = Date.now();
    const products: ScrapedProduct[] = [];

    try {
      // Simulate scraping multiple products from category
      for (let i = 0; i < maxProducts; i++) {
        await this.enforceRateLimit();
        
        const categoryProducts = this.simulateNewProduct(
          `https://www.jumia.com.ng/${category}/product-${i}`
        );
        
        products.push(...categoryProducts);
      }

      return {
        success: true,
        products,
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
