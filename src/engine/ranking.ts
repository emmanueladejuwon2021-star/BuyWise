/**
 * PHASE 2 - ENGINE: Ranking & Sorting Algorithms
 * 
 * Implements the 4 distinct sorting algorithms:
 * 1. Lowest Price First (Total Cost)
 * 2. Highest Seller Rating
 * 3. Fastest Delivery
 * 4. Best Value Score (Weighted Algorithm)
 * 
 * Also calculates summary tags: Cheapest, Fastest, Top Rated
 */

import { StoreListing } from '../types';
import { MasterProduct } from './matching';

export type SortMode = 'lowest_price' | 'rating' | 'fastest_delivery' | 'best_value';

export interface ScoredListing extends StoreListing {
  totalPrice: number; // Normalized to NGN
  totalPriceFormatted: string;
  deliveryHours: number;
  bestValueScore: number;
  isStale: boolean;
  summaryTags: string[];
}

/**
 * Normalize a listing's price to NGN for comparison
 */
export function normalizePrice(price: number, currency: string): number {
  return currency === '$' ? price * 1500 : price;
}

/**
 * Calculate total price (base + shipping) normalized to NGN
 */
export function calculateTotalPrice(listing: StoreListing): number {
  const base = normalizePrice(listing.price, listing.currency);
  const shipping = normalizePrice(listing.shippingCost, listing.currency);
  return base + shipping;
}

/**
 * Parse delivery days string to hours
 * e.g., "2-4" -> 48 (max), "1-2" -> 48, "Same Day" -> 12
 */
export function parseDeliveryHours(deliveryDays: string): number {
  if (deliveryDays.toLowerCase().includes('same')) return 12;
  if (deliveryDays.toLowerCase().includes('hour')) {
    const match = deliveryDays.match(/(\d+)/);
    return match ? parseInt(match[1]) : 24;
  }
  const match = deliveryDays.match(/(\d+)-?(\d+)?/);
  if (match) {
    const maxDays = match[2] ? parseInt(match[2]) : parseInt(match[1]);
    return maxDays * 24;
  }
  return 168; // Default 7 days
}

/**
 * Check if a listing's price is stale (not updated in 24+ hours)
 */
export function isPriceStale(listing: StoreListing): boolean {
  // Parse "X hours ago", "X min ago", etc.
  const lastUpdated = listing.lastUpdated.toLowerCase();
  
  if (lastUpdated.includes('min')) return false; // Updated within minutes
  if (lastUpdated.includes('hour')) {
    const match = lastUpdated.match(/(\d+)/);
    if (match) return parseInt(match[1]) >= 24;
  }
  if (lastUpdated.includes('day')) return true;
  
  return false;
}

/**
 * Calculate Best Value Score using weighted algorithm:
 * Score = (Normalized Price Weight * 50%) + (Normalized Rating Weight * 30%) + (Normalized Delivery Speed Weight * 20%)
 */
export function calculateBestValueScore(
  listing: StoreListing,
  allListings: StoreListing[]
): number {
  if (allListings.length === 0) return 0;
  
  // Normalize prices to NGN
  const prices = allListings.map(l => calculateTotalPrice(l));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;
  
  const currentPrice = calculateTotalPrice(listing);
  // Invert price: lower price = higher score
  const priceScore = 1 - ((currentPrice - minPrice) / priceRange);
  
  // Rating score (0-1, where 5 stars = 1)
  const ratingScore = listing.rating / 5;
  
  // Delivery speed score (faster = higher)
  const deliveryHours = allListings.map(l => parseDeliveryHours(l.deliveryDays));
  const minDelivery = Math.min(...deliveryHours);
  const maxDelivery = Math.max(...deliveryHours);
  const deliveryRange = maxDelivery - minDelivery || 1;
  
  const currentDelivery = parseDeliveryHours(listing.deliveryDays);
  // Invert: faster delivery = higher score
  const deliveryScore = 1 - ((currentDelivery - minDelivery) / deliveryRange);
  
  // Weighted composite
  const score = (priceScore * 0.5) + (ratingScore * 0.3) + (deliveryScore * 0.2);
  
  return Math.round(score * 100); // 0-100 scale
}

/**
 * Score and enhance a listing with all computed fields
 */
export function scoreListing(
  listing: StoreListing,
  allListings: StoreListing[]
): ScoredListing {
  return {
    ...listing,
    totalPrice: calculateTotalPrice(listing),
    totalPriceFormatted: listing.currency === '₦'
      ? `₦${calculateTotalPrice(listing).toLocaleString()}`
      : `$${(listing.price + listing.shippingCost).toLocaleString()}`,
    deliveryHours: parseDeliveryHours(listing.deliveryDays),
    bestValueScore: calculateBestValueScore(listing, allListings),
    isStale: isPriceStale(listing),
    summaryTags: [], // Will be filled by tag computation
  };
}

/**
 * Sort listings by the specified mode
 */
export function sortListings(listings: StoreListing[], mode: SortMode): ScoredListing[] {
  const scored = listings.map(l => scoreListing(l, listings));
  
  switch (mode) {
    case 'lowest_price':
      // Out of stock items go to bottom
      return scored.sort((a, b) => {
        if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;
        return a.totalPrice - b.totalPrice;
      });
      
    case 'rating':
      return scored.sort((a, b) => {
        if (a.rating !== b.rating) return b.rating - a.rating;
        return a.totalPrice - b.totalPrice; // Tie-break by price
      });
      
    case 'fastest_delivery':
      return scored.sort((a, b) => {
        if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;
        return a.deliveryHours - b.deliveryHours;
      });
      
    case 'best_value':
      return scored.sort((a, b) => {
        if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;
        return b.bestValueScore - a.bestValueScore;
      });
      
    default:
      return scored;
  }
}

/**
 * Compute summary tags for a sorted listing array
 * Tags: "Cheapest Option", "Fastest Delivery Option", "Top Rated Seller Option"
 */
export function computeSummaryTags(scored: ScoredListing[]): ScoredListing[] {
  if (scored.length === 0) return scored;
  
  const inStock = scored.filter(l => l.inStock);
  if (inStock.length === 0) return scored;
  
  // Cheapest
  const cheapest = inStock.reduce((min, curr) => 
    curr.totalPrice < min.totalPrice ? curr : min
  );
  cheapest.summaryTags.push('Cheapest Option');
  
  // Fastest Delivery
  const fastest = inStock.reduce((min, curr) => 
    curr.deliveryHours < min.deliveryHours ? curr : min
  );
  fastest.summaryTags.push('Fastest Delivery');
  
  // Top Rated
  const topRated = inStock.reduce((max, curr) => 
    curr.rating > max.rating ? curr : max
  );
  topRated.summaryTags.push('Top Rated Seller');
  
  return scored;
}

/**
 * Sort master products by a given mode (for search results)
 */
export function sortMasterProducts(
  products: MasterProduct[],
  mode: SortMode
): MasterProduct[] {
  return [...products].sort((a, b) => {
    switch (mode) {
      case 'lowest_price':
        return a.priceRange.min - b.priceRange.min;
      case 'rating':
        return b.avgRating - a.avgRating;
      case 'fastest_delivery': {
        const aMinDelivery = Math.min(...a.allListings.map(l => parseDeliveryHours(l.deliveryDays)));
        const bMinDelivery = Math.min(...b.allListings.map(l => parseDeliveryHours(l.deliveryDays)));
        return aMinDelivery - bMinDelivery;
      }
      case 'best_value': {
        // Average best value score across listings
        const aScore = a.allListings.reduce((sum, l) => 
          sum + calculateBestValueScore(l, a.allListings), 0) / a.allListings.length;
        const bScore = b.allListings.reduce((sum, l) => 
          sum + calculateBestValueScore(l, b.allListings), 0) / b.allListings.length;
        return bScore - aScore;
      }
      default:
        return 0;
    }
  });
}
