import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { connectDatabase } from './config/database';
import { initializeQueues, scrapeQueue } from './config/redis';
import { JumiaScraper } from './scrapers/JumiaScraper';
import { Product } from './models/Product';
import { PriceHistory } from './models/PriceHistory';
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

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize scraper
const jumiaScraper = new JumiaScraper();

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Admin API - Trigger scrape
app.post('/api/v1/admin/ingestion/trigger', async (req, res) => {
  try {
    const { url, retailerId = 'jumia', priority = 1 } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Add job to queue
    const job = await scrapeQueue.add('scrape', {
      url,
      retailerId,
    }, {
      priority,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });

    logger.info(`Scrape job queued: ${job.id}`);

    res.json({
      success: true,
      jobId: job.id,
      status: 'queued',
      message: 'Scrape job added to queue',
    });
  } catch (error: any) {
    logger.error('Error triggering scrape:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin API - Scrape category
app.post('/api/v1/admin/ingestion/category', async (req, res) => {
  try {
    const { category, retailerId = 'jumia', maxProducts = 10 } = req.body;

    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    logger.info(`Scraping category: ${category}`);

    // Scrape category
    const products = await jumiaScraper.scrapeCategory(category, 2);

    // Process each product
    let processed = 0;
    for (const product of products.slice(0, maxProducts)) {
      try {
        // Add to queue for processing
        await scrapeQueue.add('process-product', {
          product,
          retailerId,
        });
        processed++;
      } catch (error: any) {
        logger.error(`Error queueing product:`, error.message);
      }
    }

    res.json({
      success: true,
      productsScraped: products.length,
      productsQueued: processed,
      message: `Scraped ${products.length} products, ${processed} queued for processing`,
    });
  } catch (error: any) {
    logger.error('Error scraping category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin API - Get health status
app.get('/api/v1/admin/ingestion/health', async (req, res) => {
  try {
    const scraperHealth = jumiaScraper.getHealthStatus();
    
    // Get queue stats
    const queueStats = await scrapeQueue.getJobCounts();

    // Get recent price changes
    const recentChanges = await PriceHistory.find()
      .sort({ timestamp: -1 })
      .limit(20);

    // Get outliers
    const outliers = await PriceHistory.find({ isOutlier: true })
      .sort({ timestamp: -1 })
      .limit(10);

    res.json({
      success: true,
      scraper: scraperHealth,
      queues: queueStats,
      recentChanges: recentChanges.length,
      outliers: outliers.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Error getting health status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Public API - Get products
app.get('/api/v1/products', async (req, res) => {
  try {
    const { category, brand, limit = 20, offset = 0 } = req.query;

    const query: any = {};
    if (category) query.category = category;
    if (brand) query.brand = brand;

    const products = await Product.find(query)
      .limit(Number(limit))
      .skip(Number(offset))
      .sort({ lastVerified: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      total,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error: any) {
    logger.error('Error getting products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Public API - Get product by ID
app.get('/api/v1/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error: any) {
    logger.error('Error getting product:', error);
    res.status(500).json({ error: error.message });
  }
});

// Public API - Get price history
app.get('/api/v1/products/:id/price-history', async (req, res) => {
  try {
    const { retailerId } = req.query;

    const query: any = { productId: req.params.id };
    if (retailerId) query.retailerId = retailerId;

    const history = await PriceHistory.find(query)
      .sort({ timestamp: -1 })
      .limit(100);

    res.json({
      success: true,
      history,
    });
  } catch (error: any) {
    logger.error('Error getting price history:', error);
    res.status(500).json({ error: error.message });
  }
});

// Public API - Get recent price changes
app.get('/api/v1/admin/ingestion/price-changes', async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const changes = await PriceHistory.find()
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      changes,
    });
  } catch (error: any) {
    logger.error('Error getting price changes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Public API - Get outliers
app.get('/api/v1/admin/ingestion/outliers', async (req, res) => {
  try {
    const outliers = await PriceHistory.find({ isOutlier: true })
      .sort({ timestamp: -1 })
      .limit(50);

    res.json({
      success: true,
      outliers,
    });
  } catch (error: any) {
    logger.error('Error getting outliers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();

    // Initialize queues
    await initializeQueues();

    // Start server
    app.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port}`);
      logger.info(`📊 Environment: ${config.env}`);
      logger.info(`🔗 Frontend URL: ${config.frontendUrl}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await jumiaScraper.close();
  process.exit(0);
});

startServer();
