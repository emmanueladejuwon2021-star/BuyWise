/**
 * PHASE 2 - ENGINE: Search Engine
 * 
 * Core search functionality that combines:
 * - Intent parsing
 * - Fuzzy matching
 * - Multi-facet filtering
 * - Ranking algorithms
 * - Caching
 * 
 * Returns structured API-style responses with execution timing.
 */

import { Product, StoreListing } from '../types';
import { products, stores, categories } from '../data/products';
import { mongoAtlas } from '../services/mongodbAtlas';
import { parseSearchIntent, normalizeString, stringSimilarity, tokenOverlap } from './normalization';
import { buildMasterProducts, MasterProduct, findMasterForProduct } from './matching';
import {
  sortListings, sortMasterProducts, computeSummaryTags,
  calculateTotalPrice, parseDeliveryHours, isPriceStale, SortMode
} from './ranking';
import { cache, CacheKeys } from './cache';
import { RealLiveScraper } from '../services/realLiveScraper';

export function getMasterProducts(): MasterProduct[] {
  const stored = mongoAtlas.getProductsSync();
  const allMap = new Map<string, Product>();

  products.forEach(p => allMap.set(p.id, p));
  stored.forEach(p => allMap.set(p.id, p));

  return buildMasterProducts(Array.from(allMap.values()));
}

/**
 * Search API Response
 */
export interface SearchResponse {
  success: boolean;
  query: string;
  results: MasterProduct[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  executionTimeMs: number;
  cacheHit: boolean;
  activeFilters: Record<string, unknown>;
  facets: SearchFacets;
  sortBy: SortMode;
}

export interface SearchFacets {
  categories: { id: string; name: string; count: number }[];
  brands: { name: string; count: number }[];
  priceRange: { min: number; max: number };
  retailers: { id: string; name: string; count: number }[];
  ratings: { value: number; count: number }[];
  deliveryOptions: { label: string; days: number; count: number }[];
}

export interface SearchParams {
  q?: string;
  category?: string;
  subCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  retailers?: string[];
  inStockOnly?: boolean;
  minRating?: number;
  maxDeliveryDays?: number;
  sortBy?: SortMode;
  page?: number;
  limit?: number;
}

/**
 * Score a master product against search intent
 */
function scoreProduct(product: MasterProduct, query: string, tokens: string[], exactPhrases: string[]): number {
  let score = 0;
  
  // Exact phrase matching (highest priority)
  for (const phrase of exactPhrases) {
    if (normalizeString(product.canonicalTitle).includes(normalizeString(phrase))) {
      score += 100;
    }
  }
  
  // Title similarity
  const titleSim = stringSimilarity(product.canonicalTitle, query);
  score += titleSim * 50;
  
  // Token overlap
  const overlap = tokenOverlap(product.canonicalTitle, query);
  score += overlap * 30;
  
  // Brand match
  if (product.brand.toLowerCase().includes(query.toLowerCase()) ||
      query.toLowerCase().includes(product.brand.toLowerCase())) {
    score += 25;
  }
  
  // Tag matches
  for (const tag of product.tags) {
    if (tokens.includes(tag)) score += 10;
  }
  
  // Description match
  const descSim = tokenOverlap(product.description, query);
  score += descSim * 15;
  
  return score;
}

/**
 * Apply filters to master products
 */
function applyFilters(
  products: MasterProduct[],
  params: SearchParams
): MasterProduct[] {
  let filtered = [...products];
  
  // Category filter
  if (params.category) {
    filtered = filtered.filter(p => p.category === params.category);
  }
  
  // Subcategory filter
  if (params.subCategory) {
    filtered = filtered.filter(p => p.subcategory === params.subCategory);
  }
  
  // Price range filter (on total cost, normalized to NGN)
  if (params.minPrice !== undefined) {
    filtered = filtered.filter(p => {
      const minListingPrice = Math.min(...p.allListings.map(l => calculateTotalPrice(l)));
      return minListingPrice >= params.minPrice!;
    });
  }
  
  if (params.maxPrice !== undefined) {
    filtered = filtered.filter(p => {
      const minListingPrice = Math.min(...p.allListings.map(l => calculateTotalPrice(l)));
      return minListingPrice <= params.maxPrice!;
    });
  }
  
  // Retailer filter
  if (params.retailers && params.retailers.length > 0) {
    filtered = filtered.filter(p =>
      p.allListings.some(l => params.retailers!.includes(l.store.id))
    );
  }
  
  // In-stock only filter
  if (params.inStockOnly) {
    filtered = filtered.filter(p =>
      p.allListings.some(l => l.inStock)
    );
  }
  
  // Min rating filter
  if (params.minRating && params.minRating > 0) {
    filtered = filtered.filter(p => {
      const maxStoreRating = Math.max(...p.allListings.map(l => l.rating));
      return maxStoreRating >= params.minRating!;
    });
  }
  
  // Max delivery days filter
  if (params.maxDeliveryDays && params.maxDeliveryDays < 30) {
    filtered = filtered.filter(p =>
      p.allListings.some(l => {
        const days = parseDeliveryHours(l.deliveryDays) / 24;
        return days <= params.maxDeliveryDays!;
      })
    );
  }
  
  return filtered;
}

/**
 * Build facets from filtered results
 */
function buildFacets(filteredProducts: MasterProduct[], allProducts: MasterProduct[]): SearchFacets {
  // Categories
  const categoryCounts = new Map<string, number>();
  filteredProducts.forEach(p => {
    categoryCounts.set(p.category, (categoryCounts.get(p.category) || 0) + 1);
  });
  
  // Brands
  const brandCounts = new Map<string, number>();
  filteredProducts.forEach(p => {
    brandCounts.set(p.brand, (brandCounts.get(p.brand) || 0) + 1);
  });
  
  // Retailers
  const retailerCounts = new Map<string, number>();
  filteredProducts.forEach(p => {
    p.allListings.forEach(l => {
      retailerCounts.set(l.store.id, (retailerCounts.get(l.store.id) || 0) + 1);
    });
  });
  
  // Price range
  const allPrices = filteredProducts.flatMap(p => p.allListings.map(l => calculateTotalPrice(l)));
  
  // Ratings
  const ratingCounts = [3, 3.5, 4, 4.5].map(r => ({
    value: r,
    count: filteredProducts.filter(p => 
      p.allListings.some(l => l.rating >= r)
    ).length,
  }));
  
  // Delivery options
  const deliveryBuckets = [
    { label: 'Same Day', days: 1 },
    { label: '1-3 Days', days: 3 },
    { label: '3-7 Days', days: 7 },
    { label: '7+ Days', days: 30 },
  ];
  
  return {
    categories: Array.from(categoryCounts.entries()).map(([id, count]) => {
      const cat = categories.find(c => c.id === id);
      return { id, name: cat?.name || id, count };
    }),
    brands: Array.from(brandCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    priceRange: {
      min: allPrices.length > 0 ? Math.min(...allPrices) : 0,
      max: allPrices.length > 0 ? Math.max(...allPrices) : 0,
    },
    retailers: Array.from(retailerCounts.entries()).map(([id, count]) => {
      const store = stores.find(s => s.id === id);
      return { id, name: store?.name || id, count };
    }),
    ratings: ratingCounts,
    deliveryOptions: deliveryBuckets.map(bucket => ({
      ...bucket,
      count: filteredProducts.filter(p =>
        p.allListings.some(l => parseDeliveryHours(l.deliveryDays) / 24 <= bucket.days)
      ).length,
    })),
  };
}

/**
 * Main search function - GET /api/v1/search
 */
export function search(params: SearchParams): SearchResponse {
  const startTime = performance.now();
  
  // Generate cache key
  const cacheKey = CacheKeys.search(JSON.stringify(params));
  
  // Check cache
  const cached = cache.get<SearchResponse>(cacheKey);
  if (cached) {
    return { ...cached, executionTimeMs: parseFloat((performance.now() - startTime).toFixed(2)), cacheHit: true };
  }
  
  const masterProducts = getMasterProducts();
  let results: MasterProduct[];
  
  // If there's a query, score and filter by relevance
  if (params.q && params.q.trim()) {
    const intent = parseSearchIntent(params.q);
    
    // Score all products
    const scored = masterProducts.map(p => ({
      product: p,
      score: scoreProduct(p, params.q!, intent.tokens, intent.exactPhrases),
    }));
    
    // Filter by minimum relevance
    results = scored
      .filter(s => s.score > 10)
      .sort((a, b) => b.score - a.score)
      .map(s => s.product);
    
    // Apply category from intent if no explicit category filter
    if (!params.category && intent.detectedCategory) {
      // Boost products in detected category but don't filter
    }
  } else {
    results = [...masterProducts];
  }
  
  // Apply filters
  results = applyFilters(results, params);
  
  // Sort
  const sortMode = params.sortBy || 'lowest_price';
  results = sortMasterProducts(results, sortMode);
  
  // Build facets
  const facets = buildFacets(results, masterProducts);
  
  // Paginate
  const page = params.page || 1;
  const limit = params.limit || 12;
  const totalCount = results.length;
  const totalPages = Math.ceil(totalCount / limit);
  const paginatedResults = results.slice((page - 1) * limit, page * limit);
  
  const executionTimeMs = parseFloat((performance.now() - startTime).toFixed(2));
  
  const response: SearchResponse = {
    success: true,
    query: params.q || '',
    results: paginatedResults,
    totalCount,
    page,
    limit,
    totalPages,
    executionTimeMs,
    cacheHit: false,
    activeFilters: {
      category: params.category,
      subCategory: params.subCategory,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      retailers: params.retailers,
      inStockOnly: params.inStockOnly,
      minRating: params.minRating,
      maxDeliveryDays: params.maxDeliveryDays,
    },
    facets,
    sortBy: sortMode,
  };
  
  // Cache the result
  cache.set(cacheKey, response, cache.constructor as unknown as number || 10 * 60 * 1000);
  
  return response;
}

/**
 * Product Detail API Response
 */
export interface ProductDetailResponse {
  success: boolean;
  product: MasterProduct;
  listings: ReturnType<typeof computeSummaryTags>;
  summaryTags: {
    cheapest?: string;
    fastest?: string;
    topRated?: string;
  };
  executionTimeMs: number;
  cacheHit: boolean;
}

/**
 * Get product detail - GET /api/v1/products/:masterProductId
 */
export function getProductDetail(masterProductId: string, _userLocation?: string): ProductDetailResponse {
  const startTime = performance.now();
  
  const cacheKey = CacheKeys.product(masterProductId);
  const cached = cache.get<ProductDetailResponse>(cacheKey);
  if (cached) {
    return { ...cached, executionTimeMs: parseFloat((performance.now() - startTime).toFixed(2)), cacheHit: true };
  }
  
  const masterProducts = getMasterProducts();
  
  // Find the master product (try direct ID, master_ prefix, or slug matching)
  let product = masterProducts.find(mp => 
    mp.id === masterProductId || 
    mp.id === `master_${masterProductId}` ||
    mp.sourceProducts.some(p => p.id === masterProductId || p.slug === masterProductId)
  );
  
  if (!product) {
    // Try finding by single product in mongoAtlas or products
    const stored = mongoAtlas.getProductsSync();
    const allProducts = [...stored, ...products];
    const match = allProducts.find(p => 
      p.id === masterProductId || 
      p.slug === masterProductId || 
      p.id.includes(masterProductId) ||
      masterProductId.includes(p.id)
    );

    if (match) {
      const built = buildMasterProducts([match]);
      if (built.length > 0) {
        product = built[0];
      }
    }
  }

  if (!product) {
    return null as any;
  }
  
  // Score and sort listings
  const sortedListings = sortListings(product.allListings, 'lowest_price');
  const taggedListings = computeSummaryTags(sortedListings);
  
  // Extract summary tags
  const summaryTags = {
    cheapest: taggedListings.find(l => l.summaryTags.includes('Cheapest Option'))?.store.name,
    fastest: taggedListings.find(l => l.summaryTags.includes('Fastest Delivery'))?.store.name,
    topRated: taggedListings.find(l => l.summaryTags.includes('Top Rated Seller'))?.store.name,
  };
  
  const executionTimeMs = parseFloat((performance.now() - startTime).toFixed(2));
  
  const response: ProductDetailResponse = {
    success: true,
    product,
    listings: taggedListings,
    summaryTags,
    executionTimeMs,
    cacheHit: false,
  };
  
  // Cache
  cache.set(cacheKey, response, 10 * 60 * 1000);
  
  return response;
}

/**
 * Category Facets API Response
 */
export interface CategoryFacetsResponse {
  success: boolean;
  category: string;
  facets: SearchFacets;
  executionTimeMs: number;
  cacheHit: boolean;
}

/**
 * Get category facets - GET /api/v1/categories/facets
 */
export function getCategoryFacets(categoryId?: string): CategoryFacetsResponse {
  const startTime = performance.now();
  
  const cacheKey = CacheKeys.facets(categoryId || 'all');
  const cached = cache.get<CategoryFacetsResponse>(cacheKey);
  if (cached) {
    return { ...cached, executionTimeMs: parseFloat((performance.now() - startTime).toFixed(2)), cacheHit: true };
  }
  
  const masterProducts = getMasterProducts();
  const filtered = categoryId 
    ? masterProducts.filter(p => p.category === categoryId)
    : masterProducts;
  
  const facets = buildFacets(filtered, masterProducts);
  const executionTimeMs = parseFloat((performance.now() - startTime).toFixed(2));
  
  const response: CategoryFacetsResponse = {
    success: true,
    category: categoryId || 'all',
    facets,
    executionTimeMs,
    cacheHit: false,
  };
  
  cache.set(cacheKey, response, 60 * 60 * 1000); // 1 hour TTL for facets
  
  return response;
}

/**
 * Invalidate cache when prices are updated
 */
export function invalidatePriceCache(): void {
  cache.invalidatePattern('search:*');
  cache.invalidatePattern('product:*');
}

/**
 * Get cache stats for monitoring
 */
export function getCacheStats() {
  return cache.getStats();
}
