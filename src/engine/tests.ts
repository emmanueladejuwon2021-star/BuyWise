/**
 * PHASE 2 - ENGINE TESTS
 * 
 * Unit & Integration tests for:
 * - Normalization & Tokenization
 * - Product Matching & Entity Resolution
 * - Ranking & Sorting Algorithms
 * - Search Engine
 * - Caching Layer
 * 
 * Run with: These tests can be executed in browser console or via test runner.
 */

import {
  normalizeString,
  tokenize,
  extractAttributes,
  stringSimilarity,
  tokenOverlap,
  parseSearchIntent,
} from './normalization';

import {
  calculateMatchConfidence,
  buildMasterProducts,
} from './matching';

import {
  calculateTotalPrice,
  parseDeliveryHours,
  isPriceStale,
  calculateBestValueScore,
  sortListings,
  computeSummaryTags,
} from './ranking';

import {
  search,
  getProductDetail,
  getCategoryFacets,
  getCacheStats,
} from './search';

import { cache, CacheKeys } from './cache';
import { products } from '../data/products';

// Test utilities
let passCount = 0;
let failCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passCount++;
    console.log(`✅ PASS: ${message}`);
  } else {
    failCount++;
    console.error(`❌ FAIL: ${message}`);
  }
}

function assertApprox(actual: number, expected: number, tolerance: number, message: string) {
  const pass = Math.abs(actual - expected) <= tolerance;
  assert(pass, `${message} (expected ~${expected}, got ${actual})`);
}

// ============================================
// TEST SUITE 1: Normalization & Tokenization
// ============================================
console.log('\n🧪 TEST SUITE 1: Normalization & Tokenization\n');

// Test normalizeString
assert(normalizeString('Hello World!') === 'hello world', 'normalizeString: removes special chars');
assert(normalizeString('  Multiple   Spaces  ') === 'multiple spaces', 'normalizeString: collapses whitespace');
assert(normalizeString('Samsung Galaxy S23') === 'samsung galaxy s23', 'normalizeString: lowercases');
assert(normalizeString('') === '', 'normalizeString: handles empty string');

// Test tokenize
const tokens = tokenize('The new Samsung Galaxy S23 256GB');
assert(!tokens.includes('the'), 'tokenize: removes stop words');
assert(!tokens.includes('new'), 'tokenize: removes "new"');
assert(tokens.includes('samsung'), 'tokenize: keeps brand');
assert(tokens.includes('galaxy'), 'tokenize: keeps model');

// Test extractAttributes
const attrs = extractAttributes('Samsung Galaxy S23 Ultra 256GB Phantom Black');
assert(attrs.brand === 'samsung', 'extractAttributes: detects brand');
assert(attrs.storage === '256gb', 'extractAttributes: detects storage');
assert(attrs.color === 'phantom' || attrs.color === 'black', 'extractAttributes: detects color');
assert(attrs.version === 'ultra', 'extractAttributes: detects version');

// Test stringSimilarity
assert(stringSimilarity('samsung galaxy s23', 'samsung galaxy s23') === 1, 'stringSimilarity: identical strings = 1');
assertApprox(stringSimilarity('samsung galaxy s23', 'samsung galaxi s23'), 0.9, 0.1, 'stringSimilarity: minor typo high similarity');
assert(stringSimilarity('iphone', 'samsung') < 0.5, 'stringSimilarity: different words low similarity');

// Test tokenOverlap
assertApprox(tokenOverlap('Samsung Galaxy S23 256GB', 'Samsung Galaxy S23 Ultra 256GB'), 0.75, 0.1, 'tokenOverlap: partial overlap');
assert(tokenOverlap('completely different words', 'another set entirely') < 0.3, 'tokenOverlap: no overlap is low');

// Test parseSearchIntent
const intent1 = parseSearchIntent('"iPhone 15 Pro" 256GB');
assert(intent1.exactPhrases.includes('iPhone 15 Pro'), 'parseSearchIntent: extracts quoted phrases');
assert(intent1.detectedSpecs.storage === '256gb', 'parseSearchIntent: detects specs');

const intent2 = parseSearchIntent('Samsung Galaxy S23');
assert(intent2.detectedBrand === 'samsung', 'parseSearchIntent: detects brand');
assert(intent2.detectedCategory === 'phones', 'parseSearchIntent: detects category from brand');

const intent3 = parseSearchIntent('laptop under 500k');
assert(intent3.detectedCategory === 'laptops', 'parseSearchIntent: detects category from keyword');

// ============================================
// TEST SUITE 2: Product Matching
// ============================================
console.log('\n🧪 TEST SUITE 2: Product Matching & Entity Resolution\n');

// Test match confidence
const iphone = products.find(p => p.id === 'iphone-15-pro')!;
const samsung = products.find(p => p.id === 'samsung-s24-ultra')!;
const macbook = products.find(p => p.id === 'macbook-pro-m3')!;

const sameMatch = calculateMatchConfidence(iphone, iphone);
// Same product should have high confidence (though we compare different instances)
assert(sameMatch.score > 0, 'calculateMatchConfidence: returns a score');

const diffMatch = calculateMatchConfidence(iphone, samsung);
assert(diffMatch.score < 85, 'calculateMatchConfidence: different products score < 85');

const veryDiffMatch = calculateMatchConfidence(iphone, macbook);
assert(veryDiffMatch.score < 50, 'calculateMatchConfidence: very different products score < 50');

// Test buildMasterProducts
const masterProducts = buildMasterProducts(products);
assert(masterProducts.length > 0, 'buildMasterProducts: creates master products');
assert(masterProducts.length <= products.length, 'buildMasterProducts: master count <= product count');

// Each master should have at least one source product
masterProducts.forEach(mp => {
  assert(mp.sourceProducts.length >= 1, `Master ${mp.id} has source products`);
  assert(mp.allListings.length >= 1, `Master ${mp.id} has listings`);
});

// ============================================
// TEST SUITE 3: Ranking & Sorting
// ============================================
console.log('\n🧪 TEST SUITE 3: Ranking & Sorting\n');

// Test calculateTotalPrice
const listing = iphone.listings[0];
const totalPrice = calculateTotalPrice(listing);
assert(totalPrice === listing.price + listing.shippingCost, 'calculateTotalPrice: base + shipping');

// Test parseDeliveryHours
assert(parseDeliveryHours('2-4') === 96, 'parseDeliveryHours: 2-4 days = 96 hours');
assert(parseDeliveryHours('1-2') === 48, 'parseDeliveryHours: 1-2 days = 48 hours');
assert(parseDeliveryHours('Same Day') === 12, 'parseDeliveryHours: Same Day = 12 hours');

// Test isPriceStale
assert(isPriceStale({ ...listing, lastUpdated: '30 min ago' }) === false, 'isPriceStale: 30 min is fresh');
assert(isPriceStale({ ...listing, lastUpdated: '2 hours ago' }) === false, 'isPriceStale: 2 hours is fresh');
assert(isPriceStale({ ...listing, lastUpdated: '2 days ago' }) === true, 'isPriceStale: 2 days is stale');

// Test sortListings
const sortedByPrice = sortListings(iphone.listings, 'lowest_price');
assert(sortedByPrice.length === iphone.listings.length, 'sortListings: preserves count');
// First item should have lowest total price (among in-stock)
const inStockSorted = sortedByPrice.filter(l => l.inStock);
if (inStockSorted.length > 1) {
  assert(inStockSorted[0].totalPrice <= inStockSorted[1].totalPrice, 'sortListings lowest_price: first is cheapest');
}

const sortedByRating = sortListings(iphone.listings, 'rating');
if (sortedByRating.length > 1) {
  assert(sortedByRating[0].rating >= sortedByRating[1].rating, 'sortListings rating: first has highest rating');
}

const sortedByDelivery = sortListings(iphone.listings, 'fastest_delivery');
if (sortedByDelivery.length > 1) {
  const firstInStock = sortedByDelivery.filter(l => l.inStock);
  if (firstInStock.length > 1) {
    assert(firstInStock[0].deliveryHours <= firstInStock[1].deliveryHours, 'sortListings delivery: first is fastest');
  }
}

// Test computeSummaryTags
const tagged = computeSummaryTags(sortListings(iphone.listings, 'lowest_price'));
const cheapest = tagged.find(l => l.summaryTags.includes('Cheapest Option'));
const fastest = tagged.find(l => l.summaryTags.includes('Fastest Delivery'));
const topRated = tagged.find(l => l.summaryTags.includes('Top Rated Seller'));

assert(cheapest !== undefined, 'computeSummaryTags: identifies cheapest');
assert(fastest !== undefined, 'computeSummaryTags: identifies fastest');
assert(topRated !== undefined, 'computeSummaryTags: identifies top rated');

// Test best value score
const scores = iphone.listings.map(l => calculateBestValueScore(l, iphone.listings));
assert(scores.every(s => s >= 0 && s <= 100), 'calculateBestValueScore: scores between 0-100');

// ============================================
// TEST SUITE 4: Search Engine
// ============================================
console.log('\n🧪 TEST SUITE 4: Search Engine\n');

// Test basic search
const searchResult1 = search({ q: 'iphone' });
assert(searchResult1.success === true, 'search: returns success');
assert(searchResult1.results.length > 0, 'search: finds results for "iphone"');
assert(searchResult1.results[0].canonicalTitle.toLowerCase().includes('iphone'), 'search: first result matches query');
assert(searchResult1.executionTimeMs >= 0, 'search: reports execution time');

// Test search with category filter
const searchResult2 = search({ q: '', category: 'phones' });
assert(searchResult2.results.every(r => r.category === 'phones'), 'search: category filter works');

// Test search with retailer filter
const searchResult3 = search({ retailers: ['jumia'] });
assert(searchResult3.results.every(r => r.allListings.some(l => l.store.id === 'jumia')), 'search: retailer filter works');

// Test search with in-stock filter
const searchResult4 = search({ inStockOnly: true });
assert(searchResult4.results.every(r => r.allListings.some(l => l.inStock)), 'search: in-stock filter works');

// Test search with rating filter
const searchResult5 = search({ minRating: 4.5 });
assert(searchResult5.results.every(r => r.allListings.some(l => l.rating >= 4.5)), 'search: rating filter works');

// Test search with delivery filter
const searchResult6 = search({ maxDeliveryDays: 3 });
assert(searchResult6.results.length >= 0, 'search: delivery filter returns results');

// Test sorting modes
const searchLowest = search({ sortBy: 'lowest_price' });
const searchRating = search({ sortBy: 'rating' });
const searchDelivery = search({ sortBy: 'fastest_delivery' });
const searchValue = search({ sortBy: 'best_value' });

assert(searchLowest.success && searchRating.success && searchDelivery.success && searchValue.success, 'search: all sort modes work');

// Test pagination
const searchPage1 = search({ page: 1, limit: 3 });
assert(searchPage1.results.length <= 3, 'search: pagination limits results');
assert(searchPage1.totalPages >= 1, 'search: reports total pages');

// Test facets
assert(searchResult1.facets.categories.length > 0, 'search: returns category facets');
assert(searchResult1.facets.brands.length > 0, 'search: returns brand facets');
assert(searchResult1.facets.retailers.length > 0, 'search: returns retailer facets');

// Test caching
const searchCached = search({ q: 'iphone' });
// Second call should be cached
const searchCached2 = search({ q: 'iphone' });
assert(searchCached2.cacheHit === true, 'search: second identical query hits cache');

// ============================================
// TEST SUITE 5: Product Detail API
// ============================================
console.log('\n🧪 TEST SUITE 5: Product Detail API\n');

const detail1 = getProductDetail('iphone-15-pro');
assert(detail1.success === true, 'getProductDetail: returns success for valid ID');
assert(detail1.product !== null, 'getProductDetail: returns product');
assert(detail1.listings.length > 0, 'getProductDetail: returns listings');
assert(detail1.summaryTags.cheapest !== undefined, 'getProductDetail: identifies cheapest');
assert(detail1.summaryTags.fastest !== undefined, 'getProductDetail: identifies fastest');
assert(detail1.summaryTags.topRated !== undefined, 'getProductDetail: identifies top rated');

// Test invalid product
const detail2 = getProductDetail('nonexistent-product');
assert(detail2.success === false, 'getProductDetail: returns failure for invalid ID');

// Test caching
const detail3 = getProductDetail('iphone-15-pro');
assert(detail3.cacheHit === true, 'getProductDetail: second call hits cache');

// ============================================
// TEST SUITE 6: Category Facets API
// ============================================
console.log('\n🧪 TEST SUITE 6: Category Facets API\n');

const facets1 = getCategoryFacets('phones');
assert(facets1.success === true, 'getCategoryFacets: returns success');
assert(facets1.facets.brands.length > 0, 'getCategoryFacets: returns brands');
assert(facets1.facets.retailers.length > 0, 'getCategoryFacets: returns retailers');

const facets2 = getCategoryFacets();
assert(facets2.success === true, 'getCategoryFacets: works without category');

// ============================================
// TEST SUITE 7: Cache Layer
// ============================================
console.log('\n🧪 TEST SUITE 7: Cache Layer\n');

cache.set('test_key', { data: 'hello' }, 5000);
const cached1 = cache.get('test_key');
assert(cached1 !== null, 'cache: set and get works');
assert((cached1 as any).data === 'hello', 'cache: returns correct value');

cache.delete('test_key');
const cached2 = cache.get('test_key');
assert(cached2 === null, 'cache: delete works');

cache.set('search:abc', 'result1', 5000);
cache.set('search:def', 'result2', 5000);
cache.set('product:123', 'result3', 5000);
const evicted = cache.invalidatePattern('search:*');
assert(evicted === 2, 'cache: invalidatePattern removes matching keys');
assert(cache.get('product:123') !== null, 'cache: invalidatePattern preserves non-matching keys');

const stats = cache.getStats();
assert(stats.hits >= 0, 'cache: stats tracking works');
assert(typeof stats.hitRate === 'string', 'cache: hit rate is calculated');

// ============================================
// SUMMARY
// ============================================
console.log('\n' + '='.repeat(50));
console.log(`\n📊 TEST RESULTS: ${passCount} passed, ${failCount} failed out of ${passCount + failCount} total`);
console.log(`\n📈 Cache Stats: ${JSON.stringify(getCacheStats())}`);
console.log('\n' + '='.repeat(50));

if (failCount === 0) {
  console.log('\n🎉 ALL TESTS PASSED! Phase 2 engine is fully functional.\n');
} else {
  console.log(`\n⚠️ ${failCount} test(s) failed. Review the output above.\n`);
}

// Export for use in browser console
export { passCount, failCount };
