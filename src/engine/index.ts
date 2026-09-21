/**
 * PHASE 2 - SEARCH, FILTERING & COMPARISON CORE ENGINE
 * 
 * Main entry point for the engine module.
 * Exports all public APIs for the search, matching, ranking, and caching systems.
 */

// Normalization & Tokenization
export {
  normalizeString,
  tokenize,
  extractAttributes,
  levenshteinDistance,
  stringSimilarity,
  tokenOverlap,
  areSynonyms,
  parseSearchIntent,
} from './normalization';

export type { ExtractedAttributes, SearchIntent } from './normalization';

// Product Matching & Entity Resolution
export {
  calculateMatchConfidence,
  findMatches,
  buildMasterProducts,
  getMasterProduct,
  findMasterForProduct,
} from './matching';

export type { MatchCandidate, MasterProduct } from './matching';

// Ranking & Sorting
export {
  normalizePrice,
  calculateTotalPrice,
  parseDeliveryHours,
  isPriceStale,
  calculateBestValueScore,
  scoreListing,
  sortListings,
  computeSummaryTags,
  sortMasterProducts,
} from './ranking';

export type { SortMode, ScoredListing } from './ranking';

// Caching
export { cache, CacheKeys } from './cache';

// Search API
export {
  search,
  getProductDetail,
  getCategoryFacets,
  invalidatePriceCache,
  getCacheStats,
} from './search';

export type {
  SearchResponse,
  SearchFacets,
  SearchParams,
  ProductDetailResponse,
  CategoryFacetsResponse,
} from './search';
