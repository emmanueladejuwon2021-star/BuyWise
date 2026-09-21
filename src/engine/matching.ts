/**
 * PHASE 2 - ENGINE: Product Matching & Entity Resolution
 * 
 * Handles product deduplication - identifying identical products sold across
 * different stores under slightly different names, and merging them into
 * a single Master Product record with confidence scoring.
 */

import { Product, StoreListing } from '../types';
import {
  normalizeString,
  tokenize,
  extractAttributes,
  stringSimilarity,
  tokenOverlap,
  areSynonyms,
} from './normalization';

export interface MatchCandidate {
  productA: Product;
  productB: Product;
  confidenceScore: number; // 0 to 100
  matchReasons: string[];
  requiresManualReview: boolean;
}

export interface MasterProduct {
  id: string;
  canonicalTitle: string;
  brand: string;
  category: string;
  subcategory: string;
  images: string[];
  description: string;
  specifications: Record<string, string>;
  tags: string[];
  sourceProducts: Product[]; // All products merged into this master
  allListings: StoreListing[]; // Combined listings from all sources
  avgRating: number;
  totalReviews: number;
  priceRange: { min: number; max: number; currency: string };
  lastVerified: string;
  totalClicks: number;
}

/**
 * Calculate match confidence between two products (0-100)
 */
export function calculateMatchConfidence(a: Product, b: Product): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;
  
  // 1. Brand match (25 points)
  const attrA = extractAttributes(a.name);
  const attrB = extractAttributes(b.name);
  
  if (attrA.brand && attrB.brand && attrA.brand === attrB.brand) {
    score += 25;
    reasons.push(`Brand match: ${attrA.brand}`);
  } else if (attrA.brand && attrB.brand && stringSimilarity(attrA.brand, attrB.brand) > 0.8) {
    score += 20;
    reasons.push(`Similar brand: ${attrA.brand} ≈ ${attrB.brand}`);
  }
  
  // 2. Title similarity (30 points)
  const titleSim = stringSimilarity(a.name, b.name);
  const tokenSim = tokenOverlap(a.name, b.name);
  const combinedSim = (titleSim * 0.6 + tokenSim * 0.4);
  
  if (combinedSim > 0.85) {
    score += 30;
    reasons.push(`High title similarity: ${(combinedSim * 100).toFixed(0)}%`);
  } else if (combinedSim > 0.6) {
    score += Math.round(combinedSim * 25);
    reasons.push(`Moderate title similarity: ${(combinedSim * 100).toFixed(0)}%`);
  }
  
  // 3. Category match (15 points)
  if (a.category === b.category) {
    score += 15;
    reasons.push(`Same category: ${a.category}`);
  } else if (areSynonyms(a.category, b.category)) {
    score += 10;
    reasons.push(`Related categories`);
  }
  
  // 4. Specification overlap (20 points)
  const specKeysA = Object.keys(a.specifications);
  const specKeysB = Object.keys(b.specifications);
  const commonKeys = specKeysA.filter(k => specKeysB.includes(k));
  
  let specMatches = 0;
  for (const key of commonKeys) {
    const valA = normalizeString(a.specifications[key]);
    const valB = normalizeString(b.specifications[key]);
    if (valA === valB || stringSimilarity(valA, valB) > 0.8) {
      specMatches++;
    }
  }
  
  if (commonKeys.length > 0) {
    const specScore = (specMatches / commonKeys.length) * 20;
    score += specScore;
    if (specMatches > 0) reasons.push(`${specMatches}/${commonKeys.length} specs match`);
  }
  
  // 5. Storage/Size/Version match (10 points)
  if (attrA.storage && attrB.storage && attrA.storage === attrB.storage) {
    score += 5;
    reasons.push(`Storage match: ${attrA.storage}`);
  }
  if (attrA.version && attrB.version && attrA.version === attrB.version) {
    score += 5;
    reasons.push(`Version match: ${attrA.version}`);
  }
  
  return { score: Math.min(100, Math.round(score)), reasons };
}

/**
 * Find all matching products for a given product
 */
export function findMatches(product: Product, allProducts: Product[], threshold: number = 85): MatchCandidate[] {
  const candidates: MatchCandidate[] = [];
  
  for (const other of allProducts) {
    if (other.id === product.id) continue;
    
    const { score, reasons } = calculateMatchConfidence(product, other);
    
    if (score >= 50) { // Keep candidates above 50% for review
      candidates.push({
        productA: product,
        productB: other,
        confidenceScore: score,
        matchReasons: reasons,
        requiresManualReview: score < threshold,
      });
    }
  }
  
  return candidates.sort((a, b) => b.confidenceScore - a.confidenceScore);
}

/**
 * Build Master Products by grouping matching products
 */
export function buildMasterProducts(products: Product[]): MasterProduct[] {
  const processed = new Set<string>();
  const masterProducts: MasterProduct[] = [];
  
  for (const product of products) {
    if (processed.has(product.id)) continue;
    
    // Find all matches above threshold
    const matches = findMatches(product, products, 85)
      .filter(m => m.confidenceScore >= 85);
    
    const group = [product, ...matches.map(m => m.productB)];
    group.forEach(p => processed.add(p.id));
    
    // Build master product from group
    const master = createMasterProduct(group);
    masterProducts.push(master);
  }
  
  return masterProducts;
}

/**
 * Create a Master Product from a group of matching products
 */
function createMasterProduct(group: Product[]): MasterProduct {
  // Use the first product as the canonical source (longest title usually best)
  const canonical = group.reduce((best, curr) => 
    curr.name.length > best.name.length ? curr : best
  , group[0]);
  
  // Combine all listings
  const allListings = group.flatMap(p => p.listings);
  
  // Calculate price range (normalized to NGN)
  const normalizedPrices = allListings.map(l => 
    l.currency === '$' ? l.totalCost * 1500 : l.totalCost
  );
  
  // Aggregate ratings
  const allRatings = group.flatMap(p => p.ratings);
  const avgRating = allRatings.length > 0
    ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
    : 0;
  
  // Merge specifications (prefer non-empty values)
  const mergedSpecs: Record<string, string> = {};
  for (const product of group) {
    for (const [key, value] of Object.entries(product.specifications)) {
      if (!mergedSpecs[key] || value.length > mergedSpecs[key].length) {
        mergedSpecs[key] = value;
      }
    }
  }
  
  // Combine images (deduplicate by URL)
  const allImages = [...new Set(group.flatMap(p => p.images))];
  
  // Combine tags
  const allTags = [...new Set(group.flatMap(p => p.tags))];
  
  return {
    id: `master_${canonical.id}`,
    canonicalTitle: canonical.name,
    brand: canonical.brand,
    category: canonical.category,
    subcategory: canonical.subcategory,
    images: allImages,
    description: canonical.description,
    specifications: mergedSpecs,
    tags: allTags,
    sourceProducts: group,
    allListings,
    avgRating,
    totalReviews: allRatings.length,
    priceRange: {
      min: Math.min(...normalizedPrices),
      max: Math.max(...normalizedPrices),
      currency: '₦',
    },
    lastVerified: canonical.lastVerified,
    totalClicks: group.reduce((sum, p) => sum + p.totalClicks, 0),
  };
}

/**
 * Get a master product by ID (either master_ prefixed or original product ID)
 */
export function getMasterProduct(masterId: string, masterProducts: MasterProduct[]): MasterProduct | undefined {
  return masterProducts.find(mp => mp.id === masterId);
}

/**
 * Find which master product contains a given product ID
 */
export function findMasterForProduct(productId: string, masterProducts: MasterProduct[]): MasterProduct | undefined {
  return masterProducts.find(mp => 
    mp.id === productId || 
    mp.id === `master_${productId}` ||
    mp.sourceProducts.some(p => p.id === productId)
  );
}
