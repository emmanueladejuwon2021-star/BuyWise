/**
 * PHASE 3 - AUTOMATED DATA INGESTION & SCRAPING ENGINE
 * 
 * Main entry point for the ingestion module.
 * Exports all public APIs for queues, scrapers, pipeline, and monitoring.
 */

// Queues
export { Queue } from './queues/QueueManager';
export type { Job, JobStatus, QueueOptions, JobProcessor } from './queues/QueueManager';

export { ScrapeQueue } from './queues/ScrapeQueue';
export type { ScrapeJobData } from './queues/ScrapeQueue';

export { FeedIngestionQueue } from './queues/FeedIngestionQueue';
export type { FeedJobData } from './queues/FeedIngestionQueue';

export { PriceValidationQueue } from './queues/PriceValidationQueue';
export type { PriceValidationJobData } from './queues/PriceValidationQueue';

// Scrapers
export { BaseScraper } from './scrapers/BaseScraper';
export type { ScrapedProduct, ScrapeResult } from './scrapers/BaseScraper';

export { JumiaScraper } from './scrapers/JumiaScraper';

// Configuration
export {
  USER_AGENTS,
  RETAILER_CONFIGS,
  DEFAULT_SCRAPER_OPTIONS,
  getRandomUserAgent,
  getRetailerConfig,
  calculateDelayWithJitter,
  calculateBackoffDelay,
} from './config/scraperConfig';

export type { RetailerConfig, ScraperOptions } from './config/scraperConfig';

// Pipeline
export { DataSanitizer } from './pipeline/DataSanitizer';
export type { SanitizationResult } from './pipeline/DataSanitizer';

export { PriceHistoryTracker } from './pipeline/PriceHistoryTracker';
export type { PriceChange } from './pipeline/PriceHistoryTracker';

export { IngestionPipeline } from './pipeline/IngestionPipeline';
export type { IngestionResult } from './pipeline/IngestionPipeline';

// Monitoring
export { HealthMonitor } from './monitoring/HealthMonitor';
export type {
  HealthMetrics,
  ScraperHealth,
  QueueHealth,
  DataQualityMetrics,
  HealthAlert,
} from './monitoring/HealthMonitor';

// API
export { IngestionController, getIngestionController } from './api/IngestionController';
