import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { alertEvaluationEngine, AlertEvaluationJob } from '../services/AlertEvaluationEngine';

// Redis connection for BullMQ
const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null
});

/**
 * Alert Queue Worker
 * Processes price update events and evaluates user alerts
 */
const alertWorker = new Worker<AlertEvaluationJob>(
  'alert-evaluation',
  async (job: Job<AlertEvaluationJob>) => {
    const { productId, retailerId, oldPrice, newPrice } = job.data;

    console.log(`[AlertWorker] Processing job ${job.id} for product ${productId}`);
    console.log(`[AlertWorker] Price change: ₦${oldPrice.toLocaleString()} → ₦${newPrice.toLocaleString()}`);

    try {
      // Evaluate alerts for this price update
      await alertEvaluationEngine.evaluateAlerts(job.data);

      console.log(`[AlertWorker] Job ${job.id} completed successfully`);
      return { success: true };
    } catch (error) {
      console.error(`[AlertWorker] Job ${job.id} failed:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5, // Process 5 jobs concurrently
    limiter: {
      max: 100, // Max 100 jobs
      duration: 1000 // Per second
    }
  }
);

// Worker event handlers
alertWorker.on('completed', (job) => {
  console.log(`[AlertWorker] Job ${job.id} completed`);
});

alertWorker.on('failed', (job, err) => {
  console.error(`[AlertWorker] Job ${job?.id} failed:`, err.message);
});

alertWorker.on('error', (err) => {
  console.error('[AlertWorker] Worker error:', err);
});

console.log('[AlertWorker] Alert evaluation worker started');

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[AlertWorker] SIGTERM received, shutting down gracefully...');
  await alertWorker.close();
  await redisConnection.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[AlertWorker] SIGINT received, shutting down gracefully...');
  await alertWorker.close();
  await redisConnection.quit();
  process.exit(0);
});
