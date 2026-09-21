import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config';
import { JumiaScraper } from '../scrapers/JumiaScraper';
import { Product } from '../models/Product';
import { PriceHistory } from '../models/PriceHistory';
import { alertEvaluationEngine } from '../services/AlertEvaluationEngine';
import winston from 'winston';

const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Redis connection
const connection = new IORedis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  maxRetriesPerRequest: null,
});

// Initialize scrapers
const jumiaScraper = new JumiaScraper();

/**
 * Scrape Queue Worker
 * Processes real scraping jobs
 */
const scrapeWorker = new Worker(
  'scrape-queue',
  async (job: Job) => {
    const { url, retailerId, productId } = job.data;
    
    logger.info(`[Worker] Processing scrape job: ${url}`);

    try {
      let result;

      // Route to appropriate scraper
      if (retailerId === 'jumia') {
        if (productId) {
          // Scrape specific product
          result = await jumiaScraper.scrapeProductPage(url);
          if (result) {
            await updateProduct(result, retailerId);
          }
        } else {
          // Scrape category/listing page
          result = await jumiaScraper.scrape(url);
          if (result.success) {
            for (const product of result.products) {
              await updateProduct(product, retailerId);
            }
          }
        }
      } else {
        throw new Error(`Scraper for ${retailerId} not implemented`);
      }

      logger.info(`[Worker] Job completed successfully`);
      return { success: true };
    } catch (error: any) {
      logger.error(`[Worker] Job failed:`, error.message);
      throw error;
    }
  },
  {
    connection,
    concurrency: config.scraper.maxConcurrent,
    limiter: {
      max: 10,
      duration: 60000, // 10 jobs per minute
    },
  }
);

/**
 * Update product in database with scraped data
 */
async function updateProduct(scrapedData: any, retailerId: string): Promise<void> {
  try {
    // Find existing product by URL or create new one
    let product = await Product.findOne({
      'listings.affiliateUrl': scrapedData.productUrl,
    });

    if (!product) {
      // Try to find by title similarity
      product = await Product.findOne({
        name: { $regex: new RegExp(scrapedData.title, 'i') },
      });
    }

    if (product) {
      // Update existing product
      const listingIndex = product.listings.findIndex(
        l => l.store.id === retailerId
      );

      const listingData = {
        store: {
          id: retailerId,
          name: retailerId.charAt(0).toUpperCase() + retailerId.slice(1),
          logo: '🛒',
          color: '#6366f1',
        },
        price: scrapedData.price,
        originalPrice: scrapedData.originalPrice || scrapedData.price,
        currency: scrapedData.currency,
        shippingCost: scrapedData.shippingCost || 0,
        totalCost: scrapedData.price + (scrapedData.shippingCost || 0),
        deliveryDays: scrapedData.deliveryDays || '3-5',
        deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        inStock: scrapedData.inStock,
        stockLevel: scrapedData.stockLevel || 'in-stock',
        rating: scrapedData.sellerRating || 4.0,
        reviews: scrapedData.reviewCount || 0,
        affiliateUrl: scrapedData.productUrl,
        affiliateTag: `pricewise_${retailerId}`,
        discount: scrapedData.originalPrice && scrapedData.originalPrice > scrapedData.price
          ? Math.round(((scrapedData.originalPrice - scrapedData.price) / scrapedData.originalPrice) * 100)
          : 0,
        lastUpdated: new Date(),
        lastVerified: new Date(),
        seller: scrapedData.sellerName || retailerId,
        sellerId: `seller_${retailerId}_${Date.now()}`,
        condition: 'new',
        warranty: '1 year manufacturer warranty',
        freshnessHours: 0,
      };

      if (listingIndex >= 0) {
        // Check for price change
        const oldPrice = product.listings[listingIndex].price;
        const newPrice = scrapedData.price;
        const percentageChange = ((newPrice - oldPrice) / oldPrice) * 100;

        // Log price history
        await PriceHistory.create({
          productId: product._id,
          retailerId,
          price: newPrice,
          originalPrice: scrapedData.originalPrice,
          currency: scrapedData.currency,
          percentageChange,
          isOutlier: Math.abs(percentageChange) > 50,
        });

        // Trigger alert evaluation if price dropped
        if (newPrice < oldPrice) {
          await alertEvaluationEngine.queuePriceUpdate(
            product._id.toString(),
            retailerId,
            oldPrice,
            newPrice
          );
          logger.info(`[Worker] Queued alert evaluation for price drop: ₦${oldPrice} → ₦${newPrice}`);
        }

        // Update listing
        product.listings[listingIndex] = listingData as any;
      } else {
        // Add new listing
        product.listings.push(listingData as any);
      }

      product.lastVerified = new Date();
      await product.save();

      logger.info(`[Worker] Updated product: ${product.name}`);
    } else {
      // Create new product
      const newProduct = new Product({
        name: scrapedData.title,
        slug: scrapedData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        description: '',
        category: scrapedData.category || 'general',
        subcategory: '',
        images: scrapedData.imageUrl ? [scrapedData.imageUrl] : [],
        brand: scrapedData.brand || 'Unknown',
        specifications: scrapedData.specifications || {},
        tags: [],
        listings: [{
          store: {
            id: retailerId,
            name: retailerId.charAt(0).toUpperCase() + retailerId.slice(1),
            logo: '🛒',
            color: '#6366f1',
          },
          price: scrapedData.price,
          originalPrice: scrapedData.originalPrice || scrapedData.price,
          currency: scrapedData.currency,
          shippingCost: scrapedData.shippingCost || 0,
          totalCost: scrapedData.price + (scrapedData.shippingCost || 0),
          deliveryDays: scrapedData.deliveryDays || '3-5',
          deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          inStock: scrapedData.inStock,
          stockLevel: scrapedData.stockLevel || 'in-stock',
          rating: scrapedData.sellerRating || 4.0,
          reviews: scrapedData.reviewCount || 0,
          affiliateUrl: scrapedData.productUrl,
          affiliateTag: `pricewise_${retailerId}`,
          discount: 0,
          lastUpdated: new Date(),
          lastVerified: new Date(),
          seller: scrapedData.sellerName || retailerId,
          sellerId: `seller_${retailerId}_${Date.now()}`,
          condition: 'new',
          warranty: '1 year manufacturer warranty',
          freshnessHours: 0,
        }],
        lastVerified: new Date(),
        totalClicks: 0,
      });

      await newProduct.save();

      // Log initial price
      await PriceHistory.create({
        productId: newProduct._id,
        retailerId,
        price: scrapedData.price,
        originalPrice: scrapedData.originalPrice,
        currency: scrapedData.currency,
        percentageChange: 0,
        isOutlier: false,
      });

      logger.info(`[Worker] Created new product: ${newProduct.name}`);
    }
  } catch (error: any) {
    logger.error(`[Worker] Error updating product:`, error.message);
    throw error;
  }
}

// Worker event handlers
scrapeWorker.on('completed', (job) => {
  logger.info(`[Worker] Job ${job.id} completed`);
});

scrapeWorker.on('failed', (job, err) => {
  logger.error(`[Worker] Job ${job?.id} failed:`, err.message);
});

scrapeWorker.on('error', (err) => {
  logger.error(`[Worker] Worker error:`, err.message);
});

logger.info('✅ Scrape worker started');

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down worker...');
  await scrapeWorker.close();
  await connection.quit();
  await jumiaScraper.close();
  process.exit(0);
});
