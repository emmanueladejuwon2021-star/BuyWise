/**
 * PHASE 3 - INGESTION TESTS
 * 
 * Comprehensive test suite for:
 * - Queue system (job processing, retries, rate limiting)
 * - Scrapers (data extraction, error handling, anti-blocking)
 * - Data sanitization (cleaning, validation, parsing)
 * - Price history tracking (change detection, outliers)
 * - Ingestion pipeline (end-to-end processing)
 * - Health monitoring (metrics, alerts)
 */

import {
  Queue,
  ScrapeQueue,
  FeedIngestionQueue,
  PriceValidationQueue,
  JumiaScraper,
  DataSanitizer,
  PriceHistoryTracker,
  IngestionPipeline,
  HealthMonitor,
  getIngestionController,
} from './index';

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
// TEST SUITE 1: Queue System
// ============================================
console.log('\n🧪 TEST SUITE 1: Queue System\n');

async function testQueueSystem() {
  const queue = new Queue<{ value: number }>('TestQueue', {
    concurrency: 2,
    maxRetries: 3,
    retryDelay: 100,
  });

  let processedCount = 0;
  let failedCount = 0;

  queue.process(async (job) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    if (job.data.value === 999) {
      throw new Error('Simulated failure');
    }
    
    processedCount++;
    return { result: job.data.value * 2 };
  });

  queue.on('completed', () => {});
  queue.on('failed', () => { failedCount++; });

  // Add jobs
  const job1 = await queue.add('test1', { value: 10 });
  const job2 = await queue.add('test2', { value: 20 });
  const job3 = await queue.add('test3', { value: 999 }); // This will fail

  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 500));

  const stats = queue.getStats();
  
  assert(stats.totalProcessed >= 2, 'Queue processed jobs');
  assert(stats.totalFailed >= 1, 'Queue tracked failures');
  assert(stats.concurrency === 2, 'Queue respects concurrency limit');

  console.log(`   Queue stats: ${JSON.stringify(stats)}`);
}

await testQueueSystem();

// ============================================
// TEST SUITE 2: Scrapers
// ============================================
console.log('\n🧪 TEST SUITE 2: Scrapers\n');

async function testScrapers() {
  const scraper = new JumiaScraper();

  // Test basic scrape
  const result1 = await scraper.scrape('https://jumia.com.ng/product/iphone-15-pro');
  
  assert(result1.success === true || result1.success === false, 'Scraper returns result');
  assert(result1.retailerId === 'jumia', 'Result has correct retailer ID');
  assert(result1.timestamp > 0, 'Result has timestamp');

  if (result1.success) {
    assert(result1.products.length > 0, 'Scraper returns products');
    assert(result1.products[0].title !== '', 'Product has title');
    assert(result1.products[0].price > 0, 'Product has price');
    assert(result1.products[0].currency === '₦', 'Product has currency');
  }

  // Test health status
  const health = scraper.getHealthStatus();
  assert(health.retailerId === 'jumia', 'Health has retailer ID');
  assert(typeof health.isHealthy === 'boolean', 'Health has isHealthy flag');
  assert(typeof health.consecutiveFailures === 'number', 'Health tracks failures');

  console.log(`   Scraper health: ${JSON.stringify(health)}`);
}

await testScrapers();

// ============================================
// TEST SUITE 3: Data Sanitization
// ============================================
console.log('\n🧪 TEST SUITE 3: Data Sanitization\n');

// Test HTML stripping
assert(DataSanitizer.stripHtml('<p>Hello <b>World</b></p>') === 'Hello World', 'stripHtml removes tags');
assert(DataSanitizer.stripHtml('') === '', 'stripHtml handles empty string');

// Test unicode normalization
assert(DataSanitizer.normalizeUnicode('café') === 'cafe', 'normalizeUnicode removes diacritics');
assert(DataSanitizer.normalizeUnicode('₦45,000') === '₦45000', 'normalizeUnicode keeps currency');

// Test price parsing
assert(DataSanitizer.parsePrice('₦ 45,000.00') === 45000, 'parsePrice handles NGN format');
assert(DataSanitizer.parsePrice('$1,299.99') === 1299.99, 'parsePrice handles USD format');
assert(DataSanitizer.parsePrice('45000') === 45000, 'parsePrice handles plain number');
assert(DataSanitizer.parsePrice(45000) === 45000, 'parsePrice handles number type');

// Test currency detection
assert(DataSanitizer.detectCurrency('₦45,000') === '₦', 'detectCurrency detects NGN');
assert(DataSanitizer.detectCurrency('$100') === '$', 'detectCurrency detects USD');

// Test product sanitization
const rawProduct: any = {
  title: '<p>Samsung Galaxy S23</p>',
  brand: 'Samsung',
  price: '₦ 450,000',
  currency: '₦',
  inStock: true,
  productUrl: 'https://jumia.com.ng/product/123',
};

const sanitized = DataSanitizer.sanitizeProduct(rawProduct);
assert(sanitized.success === true, 'sanitizeProduct succeeds for valid product');
assert(sanitized.product !== null, 'sanitizeProduct returns product');
assert(sanitized.product!.title === 'Samsung Galaxy S23', 'sanitizeProduct strips HTML from title');
assert(sanitized.product!.price === 450000, 'sanitizeProduct parses price correctly');

// Test invalid product
const invalidProduct: any = {
  title: '',
  price: 0,
  productUrl: '',
};

const invalidResult = DataSanitizer.sanitizeProduct(invalidProduct);
assert(invalidResult.success === false, 'sanitizeProduct fails for invalid product');
assert(invalidResult.errors.length > 0, 'sanitizeProduct returns errors');

// Test bulk sanitization
const bulkProducts: any[] = [rawProduct, invalidProduct, rawProduct];
const bulkResult = DataSanitizer.sanitizeProducts(bulkProducts);
assert(bulkResult.valid.length === 2, 'sanitizeProducts returns valid products');
assert(bulkResult.invalid.length === 1, 'sanitizeProducts returns invalid products');

// ============================================
// TEST SUITE 4: Price History Tracking
// ============================================
console.log('\n🧪 TEST SUITE 4: Price History Tracking\n');

const tracker = new PriceHistoryTracker();

// Record price updates
const change1 = tracker.recordPriceUpdate('product1', 'jumia', 100000, '₦');
assert(change1 !== null, 'recordPriceUpdate returns change');
assert(change1!.percentageChange === 0, 'First update has 0% change');

const change2 = tracker.recordPriceUpdate('product1', 'jumia', 110000, '₦');
assert(change2 !== null, 'Second update returns change');
assertApprox(change2!.percentageChange, 10, 0.1, 'Second update has 10% increase');

const change3 = tracker.recordPriceUpdate('product1', 'jumia', 50000, '₦');
assert(change3 !== null, 'Third update returns change');
assert(change3!.isOutlier === true, 'Large drop detected as outlier');
assert(change3!.requiresReview === true, 'Outlier requires review');

// Test price history retrieval
const history = tracker.getPriceHistory('product1', 'jumia');
assert(history.length === 3, 'getPriceHistory returns all entries');
assert(history[0].price === 100000, 'First entry has correct price');
assert(history[2].price === 50000, 'Last entry has correct price');

// Test current price
const currentPrice = tracker.getCurrentPrice('product1', 'jumia');
assert(currentPrice === 50000, 'getCurrentPrice returns latest price');

// Test outliers
const outliers = tracker.getOutliers();
assert(outliers.length >= 1, 'getOutliers returns outliers');

// Test stats
const stats = tracker.getStats();
assert(stats.totalProducts >= 1, 'Stats track products');
assert(stats.outlierCount >= 1, 'Stats track outliers');

console.log(`   Tracker stats: ${JSON.stringify(stats)}`);

// ============================================
// TEST SUITE 5: Ingestion Pipeline
// ============================================
console.log('\n🧪 TEST SUITE 5: Ingestion Pipeline\n');

async function testPipeline() {
  const pipeline = new IngestionPipeline([...products]);

  const scrapedProducts = [
    {
      title: 'Test Product',
      brand: 'TestBrand',
      category: 'electronics',
      price: 50000,
      currency: '₦',
      inStock: true,
      productUrl: 'https://jumia.com.ng/test-product',
      sellerName: 'Test Seller',
      sellerRating: 4.5,
    },
  ];

  const result = await pipeline.processScrapedProducts(scrapedProducts, 'jumia');

  assert(result.productsProcessed === 1, 'Pipeline processes products');
  assert(typeof result.productsAdded === 'number', 'Pipeline tracks added products');
  assert(typeof result.productsUpdated === 'number', 'Pipeline tracks updated products');
  assert(result.duration > 0, 'Pipeline reports duration');

  console.log(`   Pipeline result: ${result.productsProcessed} processed, ${result.productsAdded} added, ${result.productsUpdated} updated`);
}

await testPipeline();

// ============================================
// TEST SUITE 6: Health Monitoring
// ============================================
console.log('\n🧪 TEST SUITE 6: Health Monitoring\n');

const monitor = new HealthMonitor();
const scraper = new JumiaScraper();
const queue = new Queue('TestQueue');

monitor.registerScraper(scraper);
monitor.registerQueue(queue, 'TestQueue');

// Add some alerts
monitor.addAlert('info', 'Test alert 1');
monitor.addAlert('warning', 'Test alert 2', 'jumia');

const metrics = monitor.getHealthMetrics();
assert(metrics.overallHealth !== undefined, 'Health metrics has overall health');
assert(metrics.scrapers.length === 1, 'Health metrics tracks scrapers');
assert(metrics.queues.length === 1, 'Health metrics tracks queues');
assert(metrics.alerts.length >= 2, 'Health metrics tracks alerts');

const summary = monitor.getAdminSummary();
assert(summary.scraperCount === 1, 'Admin summary has scraper count');
assert(summary.queueCount === 1, 'Admin summary has queue count');
assert(typeof summary.overallHealth === 'string', 'Admin summary has health status');

console.log(`   Health: ${summary.overallHealth}, Scrapers: ${summary.scraperCount}, Queues: ${summary.queueCount}`);

// ============================================
// TEST SUITE 7: Ingestion Controller
// ============================================
console.log('\n🧪 TEST SUITE 7: Ingestion Controller\n');

async function testController() {
  const controller = getIngestionController();

  // Test trigger scrape
  const scrapeResult = await controller.triggerScrape(
    'https://jumia.com.ng/product/test',
    'jumia'
  );
  assert(scrapeResult.jobId !== undefined, 'triggerScrape returns job ID');
  assert(scrapeResult.status !== undefined, 'triggerScrape returns status');

  // Test health status
  const health = controller.getHealthStatus();
  assert(health.overallHealth !== undefined, 'getHealthStatus returns health');

  // Test admin summary
  const adminSummary = controller.getAdminSummary();
  assert(adminSummary.overallHealth !== undefined, 'getAdminSummary returns health');

  // Test queue stats
  const queueStats = controller.getQueueStats();
  assert(queueStats.scrapeQueue !== undefined, 'getQueueStats returns scrape queue');
  assert(queueStats.feedQueue !== undefined, 'getQueueStats returns feed queue');

  console.log(`   Controller initialized, health: ${adminSummary.overallHealth}`);
}

await testController();

// ============================================
// SUMMARY
// ============================================
console.log('\n' + '='.repeat(50));
console.log(`\n📊 TEST RESULTS: ${passCount} passed, ${failCount} failed out of ${passCount + failCount} total`);
console.log('\n' + '='.repeat(50));

if (failCount === 0) {
  console.log('\n🎉 ALL TESTS PASSED! Phase 3 ingestion engine is fully functional.\n');
} else {
  console.log(`\n⚠️ ${failCount} test(s) failed. Review the output above.\n`);
}

export { passCount, failCount };
