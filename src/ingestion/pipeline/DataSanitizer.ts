/**
 * PHASE 3 - INGESTION: Data Sanitizer
 * 
 * Cleans and validates raw scraped data:
 * - Strip HTML tags
 * - Normalize unicode characters
 * - Clean price strings
 * - Validate required fields
 * - Standardize data formats
 */

import { ScrapedProduct } from '../scrapers/BaseScraper';

export interface SanitizationResult {
  success: boolean;
  product: ScrapedProduct | null;
  errors: string[];
  warnings: string[];
}

export class DataSanitizer {
  /**
   * Strip HTML tags from string
   */
  static stripHtml(text: string): string {
    if (!text) return '';
    return text.replace(/<[^>]*>/g, '').trim();
  }

  /**
   * Normalize unicode characters
   */
  static normalizeUnicode(text: string): string {
    if (!text) return '';
    return text
      .normalize('NFKD') // Normalize form
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^\x00-\x7F]/g, (char) => {
        // Keep common currency symbols
        if (['₦', '$', '€', '£'].includes(char)) return char;
        return ''; // Remove other non-ASCII
      });
  }

  /**
   * Parse price string to number
   * Handles formats like: "₦ 45,000.00", "$1,299.99", "45000"
   */
  static parsePrice(priceString: string | number): number {
    if (typeof priceString === 'number') return priceString;
    if (!priceString) return 0;

    // Remove currency symbols and whitespace
    let cleaned = priceString
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
   * Detect currency from string
   */
  static detectCurrency(priceString: string): string {
    if (priceString.includes('₦')) return '₦';
    if (priceString.includes('$')) return '$';
    if (priceString.includes('€')) return '€';
    if (priceString.includes('£')) return '£';
    return '₦'; // Default to NGN
  }

  /**
   * Sanitize a single product
   */
  static sanitizeProduct(raw: Partial<ScrapedProduct>): SanitizationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!raw.title || raw.title.trim() === '') {
      errors.push('Missing required field: title');
    }

    if (!raw.productUrl || raw.productUrl.trim() === '') {
      errors.push('Missing required field: productUrl');
    }

    if (raw.price === undefined || raw.price === null) {
      errors.push('Missing required field: price');
    }

    // If there are critical errors, return early
    if (errors.length > 0) {
      return { success: false, product: null, errors, warnings };
    }

    // Sanitize fields
    const sanitized: ScrapedProduct = {
      title: this.normalizeUnicode(this.stripHtml(raw.title || '')),
      brand: raw.brand ? this.normalizeUnicode(this.stripHtml(raw.brand)) : undefined,
      category: raw.category ? this.normalizeUnicode(this.stripHtml(raw.category)) : undefined,
      price: typeof raw.price === 'string' ? this.parsePrice(raw.price) : (raw.price || 0),
      originalPrice: raw.originalPrice 
        ? (typeof raw.originalPrice === 'string' ? this.parsePrice(raw.originalPrice) : raw.originalPrice)
        : undefined,
      currency: raw.currency || (typeof raw.price === 'string' ? this.detectCurrency(raw.price) : '₦'),
      inStock: raw.inStock !== undefined ? raw.inStock : true,
      stockLevel: raw.stockLevel || (raw.inStock === false ? 'out-of-stock' : 'in-stock'),
      shippingCost: raw.shippingCost 
        ? (typeof raw.shippingCost === 'string' ? this.parsePrice(raw.shippingCost) : raw.shippingCost)
        : undefined,
      deliveryDays: raw.deliveryDays ? this.stripHtml(raw.deliveryDays) : undefined,
      sellerName: raw.sellerName ? this.normalizeUnicode(this.stripHtml(raw.sellerName)) : undefined,
      sellerRating: raw.sellerRating,
      reviewCount: raw.reviewCount,
      imageUrl: raw.imageUrl,
      productUrl: raw.productUrl ? raw.productUrl.trim() : '',
      specifications: raw.specifications,
    };

    // Validate price
    if (sanitized.price <= 0) {
      errors.push('Invalid price: must be greater than 0');
    }

    // Validate original price if present
    if (sanitized.originalPrice !== undefined && sanitized.originalPrice < sanitized.price) {
      warnings.push('Original price is less than current price');
    }

    // Validate URL format
    try {
      new URL(sanitized.productUrl || '');
    } catch {
      errors.push('Invalid product URL format');
    }

    // Validate seller rating
    if (sanitized.sellerRating !== undefined) {
      if (sanitized.sellerRating < 0 || sanitized.sellerRating > 5) {
        warnings.push('Seller rating out of range (0-5)');
        sanitized.sellerRating = Math.max(0, Math.min(5, sanitized.sellerRating));
      }
    }

    return {
      success: errors.length === 0,
      product: errors.length === 0 ? sanitized : null,
      errors,
      warnings,
    };
  }

  /**
   * Sanitize multiple products
   */
  static sanitizeProducts(rawProducts: Partial<ScrapedProduct>[]): {
    valid: ScrapedProduct[];
    invalid: Array<{ product: Partial<ScrapedProduct>; errors: string[] }>;
    warnings: string[];
  } {
    const valid: ScrapedProduct[] = [];
    const invalid: Array<{ product: Partial<ScrapedProduct>; errors: string[] }> = [];
    const allWarnings: string[] = [];

    for (const raw of rawProducts) {
      const result = this.sanitizeProduct(raw);
      
      if (result.success && result.product) {
        valid.push(result.product);
      } else {
        invalid.push({ product: raw, errors: result.errors });
      }
      
      allWarnings.push(...result.warnings);
    }

    return { valid, invalid, warnings: allWarnings };
  }
}
