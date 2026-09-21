import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { config } from './index';
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

// Scrape Queue
export const scrapeQueue = new Queue('scrape-queue', { connection });

// Feed Queue
export const feedQueue = new Queue('feed-queue', { connection });

// Validation Queue
export const validationQueue = new Queue('validation-queue', { connection });

export async function initializeQueues(): Promise<void> {
  logger.info('✅ Queues initialized');
}

export async function closeQueues(): Promise<void> {
  await scrapeQueue.close();
  await feedQueue.close();
  await validationQueue.close();
  await connection.quit();
  logger.info('Queues closed');
}

export { Queue, Worker, Job };
