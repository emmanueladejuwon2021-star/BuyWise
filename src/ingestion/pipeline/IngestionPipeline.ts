/**
 * PHASE 3 - INGESTION: Main Pipeline
 * 
 * Orchestrates the complete data ingestion flow:
 * 1. Receive raw data (from scrapers, feeds, or API)
 * 2. Sanitize and validate data
 * 3. Track price changes and detect outliers
 * 4. Map categories to standard format
 * 5. Match products to existing master products
 * 6. Update database with new/updated products
 */

import { ScrapedProduct } from '../scrapers/BaseScraper';
import { DataSanitizer } from './DataSanitizer';
import { PriceHistoryTracker, PriceChange } from './PriceHistoryTracker';
import { Product, StoreListing } from '../../types';
import { stores } from '../../data/products';
import { buildMasterProducts, MasterProduct } from '../../engine/matching';

export interface IngestionResult {
  success: boolean;
  productsProcessed: number;
  productsAdded: number;
  productsUpdated: number;
  productsSkipped: number;
  outliersDetected: number;
  errors: string[];
  warnings: string[];
  priceChanges: PriceChange[];
  duration: number;
}

export class IngestionPipeline {
  private priceTracker: PriceHistoryTracker;
  private existingProducts: Product[];
  private masterProducts: MasterProduct[];

  constructor(existingProducts: Product[]) {
    this.priceTracker = new PriceHistoryTracker();
    this.existingProducts = existingProducts;
    this.masterProducts = buildMasterProducts(existingProducts);
  }

  /**
   * Process scraped products through the pipeline
   */
  async processScrapedProducts(
    rawProducts: ScrapedProduct[],
    retailerId: string
  ): Promise<IngestionResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];
    const priceChanges: PriceChange[] = [];
    let productsAdded = 0;
    let productsUpdated = 0;
    let productsSkipped = 0;
    let outliersDetected = 0;

    console.log(`[Pipeline] Processing ${rawProducts.length} products from ${retailerId}...`);

    // Step 1: Sanitize data
    const { valid, invalid } = DataSanitizer.sanitizeProducts(rawProducts);
    
    if (invalid.length > 0) {
      warnings.push(`${invalid.length} products failed validation`);
      invalid.forEach(item => {
        errors.push(`Product validation failed: ${item.errors.join(', ')}`);
      });
    }

    console.log(`[Pipeline] ${valid.length} products passed validation`);

    // Step 2: Process each valid product
    for (const product of valid) {
      try {
        const result = await this.processSingleProduct(product, retailerId);
        
        if (result.action === 'added') {
          productsAdded++;
        } else if (result.action === 'updated') {
          productsUpdated++;
        } else {
          productsSkipped++;
        }

        if (result.priceChange) {
          priceChanges.push(result.priceChange);
          if (result.priceChange.isOutlier) {
            outliersDetected++;
          }
        }

        if (result.warnings.length > 0) {
          warnings.push(...result.warnings);
        }
      } catch (error: any) {
        errors.push(`Error processing product ${product.title}: ${error.message}`);
      }
    }

    const duration = Date.now() - startTime;

    console.log(`[Pipeline] Completed in ${duration}ms: ${productsAdded} added, ${productsUpdated} updated, ${productsSkipped} skipped`);

    return {
      success: errors.length === 0,
      productsProcessed: rawProducts.length,
      productsAdded,
      productsUpdated,
      productsSkipped,
      outliersDetected,
      errors,
      warnings,
      priceChanges,
      duration,
    };
  }

  /**
   * Process a single product
   */
  private async processSingleProduct(
    product: ScrapedProduct,
    retailerId: string
  ): Promise<{
    action: 'added' | 'updated' | 'skipped';
    priceChange: PriceChange | null;
    warnings: string[];
  }> {
    const warnings: string[] = [];

    // Find matching store
    const store = stores.find(s => s.id === retailerId);
    if (!store) {
      return {
        action: 'skipped',
        priceChange: null,
        warnings: [`Unknown retailer: ${retailerId}`],
      };
    }

    // Try to find existing product by URL or title similarity
    const existingProduct = this.findExistingProduct(product);

    if (existingProduct) {
      // Product exists - check for price update
      const existingListing = existingProduct.listings.find(l => l.store.id === retailerId);

      if (existingListing) {
        // Track price change
        const priceChange = this.priceTracker.recordPriceUpdate(
          existingProduct.id,
          retailerId,
          product.price,
          product.currency
        );

        // Check if price actually changed
        if (priceChange && Math.abs(priceChange.percentageChange) > 0.01) {
          // Update the listing
          existingListing.price = product.price;
          existingListing.originalPrice = product.originalPrice || product.price;
          existingListing.inStock = product.inStock;
          existingListing.stockLevel = product.stockLevel || 'in-stock';
          existingListing.shippingCost = product.shippingCost || 0;
          existingListing.deliveryDays = product.deliveryDays || existingListing.deliveryDays;
          existingListing.lastUpdated = new Date().toISOString();
          existingListing.lastVerified = new Date().toISOString();

          // Rebuild master products
          this.masterProducts = buildMasterProducts(this.existingProducts);

          return {
            action: 'updated',
            priceChange,
            warnings,
          };
        } else {
          // No significant price change
          return {
            action: 'skipped',
            priceChange: null,
            warnings,
          };
        }
      } else {
        // Product exists but not from this retailer - add new listing
        const newListing = this.createListing(product, store);
        existingProduct.listings.push(newListing);

        // Record initial price
        this.priceTracker.recordPriceUpdate(
          existingProduct.id,
          retailerId,
          product.price,
          product.currency
        );

        // Rebuild master products
        this.masterProducts = buildMasterProducts(this.existingProducts);

        return {
          action: 'updated',
          priceChange: null,
          warnings,
        };
      }
    } else {
      // New product - create it
      const newProduct = this.createProduct(product, store);
      this.existingProducts.push(newProduct);

      // Record initial price
      this.priceTracker.recordPriceUpdate(
        newProduct.id,
        retailerId,
        product.price,
        product.currency
      );

      // Rebuild master products
      this.masterProducts = buildMasterProducts(this.existingProducts);

      return {
        action: 'added',
        priceChange: null,
        warnings,
      };
    }
  }

  /**
   * Find existing product by URL or title similarity
   */
  private findExistingProduct(product: ScrapedProduct): Product | null {
    // Try exact URL match
    const urlMatch = this.existingProducts.find(p => 
      p.listings.some(l => l.affiliateUrl === product.productUrl)
    );
    if (urlMatch) return urlMatch;

    // Try title similarity (simple approach)
    const normalizedTitle = product.title.toLowerCase().trim();
    const titleMatch = this.existingProducts.find(p => {
      const existingTitle = p.name.toLowerCase().trim();
      // Check if titles are very similar (>80% match)
      return this.calculateSimilarity(normalizedTitle, existingTitle) > 0.8;
    });

    return titleMatch || null;
  }

  /**
   * Calculate string similarity (simple Jaccard)
   */
  private calculateSimilarity(a: string, b: string): number {
    const wordsA = new Set(a.split(/\s+/));
    const wordsB = new Set(b.split(/\s+/));
    
    let intersection = 0;
    wordsA.forEach(word => {
      if (wordsB.has(word)) intersection++;
    });

    const union = wordsA.size + wordsB.size - intersection;
    return union === 0 ? 0 : intersection / union;
  }

  /**
   * Create a new product from scraped data
   */
  private createProduct(product: ScrapedProduct, store: any): Product {
    const listing = this.createListing(product, store);

    return {
      id: `product_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name: product.title,
      slug: product.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      description: `${product.title} from ${store.name}`,
      category: product.category || 'electronics',
      subcategory: product.category || 'general',
      images: product.imageUrl ? [product.imageUrl] : [],
      brand: product.brand || 'Unknown',
      ratings: [],
      listings: [listing],
      specifications: product.specifications || {},
      tags: [],
      priceHistory: [],
      lastVerified: new Date().toISOString(),
      totalClicks: 0,
    };
  }

  /**
   * Create a store listing from scraped data
   */
  private createListing(product: ScrapedProduct, store: any): StoreListing {
    const discount = product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

    return {
      store,
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      currency: product.currency,
      shippingCost: product.shippingCost || 0,
      shippingMethod: product.shippingCost === 0 ? 'Free Standard' : 'Standard Delivery',
      totalCost: product.price + (product.shippingCost || 0),
      deliveryDays: product.deliveryDays || '3-5',
      deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      inStock: product.inStock,
      stockLevel: product.stockLevel || 'in-stock',
      rating: product.sellerRating || store.rating,
      reviews: product.reviewCount || 0,
      affiliateUrl: product.productUrl,
      affiliateTag: `pricewise_${store.id}`,
      discount,
      lastUpdated: new Date().toISOString(),
      lastVerified: new Date().toISOString(),
      seller: product.sellerName || store.name,
      sellerId: `seller_${store.id}_${Math.random().toString(36).slice(2, 6)}`,
      condition: 'new',
      warranty: '1 year manufacturer warranty',
      returnPolicy: '30-day return policy',
      freshnessHours: 0,
    };
  }

  /**
   * Get price history tracker
   */
  getPriceTracker(): PriceHistoryTracker {
    return this.priceTracker;
  }

  /**
   * Get updated products
   */
  getUpdatedProducts(): Product[] {
    return this.existingProducts;
  }

  /**
   * Get updated master products
   */
  getUpdatedMasterProducts(): MasterProduct[] {
    return this.masterProducts;
  }
}
