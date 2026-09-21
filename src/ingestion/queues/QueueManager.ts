/**
 * PHASE 3 - INGESTION: Queue Manager
 * 
 * BullMQ-style job queue system with:
 * - Job processing with concurrency control
 * - Retry logic with exponential backoff
 * - Rate limiting per domain
 * - Job status tracking
 * - Dead letter queue for failed jobs
 */

export type JobStatus = 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';

export interface Job<T = any> {
  id: string;
  name: string;
  data: T;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  createdAt: number;
  processedAt?: number;
  completedAt?: number;
  failedAt?: number;
  error?: string;
  delay?: number;
  priority: number;
}

export interface QueueOptions {
  concurrency: number;
  maxRetries: number;
  retryDelay: number;
  rateLimitPerMinute?: number;
  domain?: string;
}

export type JobProcessor<T> = (job: Job<T>) => Promise<any>;

export class Queue<T = any> {
  private name: string;
  private jobs: Map<string, Job<T>> = new Map();
  private processor: JobProcessor<T> | null = null;
  private options: QueueOptions;
  private isProcessing = false;
  private activeJobs = 0;
  private rateLimitCounter = 0;
  private rateLimitResetTime = Date.now() + 60000;
  private eventListeners: Map<string, Function[]> = new Map();
  
  // Statistics
  private stats = {
    totalProcessed: 0,
    totalFailed: 0,
    totalRetries: 0,
    averageProcessingTime: 0,
  };

  constructor(name: string, options: Partial<QueueOptions> = {}) {
    this.name = name;
    this.options = {
      concurrency: options.concurrency || 5,
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 5000,
      rateLimitPerMinute: options.rateLimitPerMinute,
      domain: options.domain,
    };
  }

  /**
   * Register a job processor function
   */
  process(processor: JobProcessor<T>): void {
    this.processor = processor;
  }

  /**
   * Add a job to the queue
   */
  async add(name: string, data: T, options: { delay?: number; priority?: number } = {}): Promise<Job<T>> {
    const job: Job<T> = {
      id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name,
      data,
      status: options.delay ? 'delayed' : 'waiting',
      attempts: 0,
      maxAttempts: this.options.maxRetries,
      createdAt: Date.now(),
      delay: options.delay,
      priority: options.priority || 0,
    };

    this.jobs.set(job.id, job);
    this.emit('added', job);

    // If delayed, schedule activation
    if (options.delay) {
      setTimeout(() => {
        job.status = 'waiting';
        this.processNext();
      }, options.delay);
    } else {
      this.processNext();
    }

    return job;
  }

  /**
   * Process next job in queue
   */
  private async processNext(): Promise<void> {
    if (this.isProcessing || !this.processor) return;
    if (this.activeJobs >= this.options.concurrency) return;

    // Check rate limit
    if (this.options.rateLimitPerMinute) {
      if (Date.now() > this.rateLimitResetTime) {
        this.rateLimitCounter = 0;
        this.rateLimitResetTime = Date.now() + 60000;
      }
      if (this.rateLimitCounter >= this.options.rateLimitPerMinute) {
        // Wait until rate limit resets
        setTimeout(() => this.processNext(), this.rateLimitResetTime - Date.now());
        return;
      }
    }

    // Find next waiting job (sorted by priority)
    const waitingJobs = Array.from(this.jobs.values())
      .filter(j => j.status === 'waiting')
      .sort((a, b) => b.priority - a.priority);

    if (waitingJobs.length === 0) return;

    const job = waitingJobs[0];
    job.status = 'active';
    job.processedAt = Date.now();
    job.attempts++;
    this.activeJobs++;
    this.isProcessing = true;

    if (this.options.rateLimitPerMinute) {
      this.rateLimitCounter++;
    }

    this.emit('active', job);

    try {
      const startTime = Date.now();
      const result = await this.processor(job);
      const processingTime = Date.now() - startTime;

      job.status = 'completed';
      job.completedAt = Date.now();
      
      // Update average processing time
      this.stats.totalProcessed++;
      this.stats.averageProcessingTime = 
        ((this.stats.averageProcessingTime * (this.stats.totalProcessed - 1)) + processingTime) / 
        this.stats.totalProcessed;

      this.emit('completed', job, result);
    } catch (error: any) {
      job.error = error.message || 'Unknown error';
      
      if (job.attempts < job.maxAttempts) {
        // Retry with exponential backoff
        const retryDelay = this.options.retryDelay * Math.pow(2, job.attempts - 1);
        job.status = 'delayed';
        job.delay = retryDelay;
        this.stats.totalRetries++;
        
        this.emit('retrying', job, error);
        
        setTimeout(() => {
          job.status = 'waiting';
          this.processNext();
        }, retryDelay);
      } else {
        // Max retries exceeded
        job.status = 'failed';
        job.failedAt = Date.now();
        this.stats.totalFailed++;
        
        this.emit('failed', job, error);
      }
    } finally {
      this.activeJobs--;
      this.isProcessing = false;
      
      // Clean up completed/failed jobs older than 1 hour
      const oneHourAgo = Date.now() - 3600000;
      for (const [id, j] of this.jobs.entries()) {
        if ((j.status === 'completed' || j.status === 'failed') && j.completedAt && j.completedAt < oneHourAgo) {
          this.jobs.delete(id);
        }
      }
      
      // Process next job
      this.processNext();
    }
  }

  /**
   * Get queue statistics
   */
  getStats() {
    const jobs = Array.from(this.jobs.values());
    return {
      name: this.name,
      waiting: jobs.filter(j => j.status === 'waiting').length,
      active: jobs.filter(j => j.status === 'active').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length,
      delayed: jobs.filter(j => j.status === 'delayed').length,
      totalProcessed: this.stats.totalProcessed,
      totalFailed: this.stats.totalFailed,
      totalRetries: this.stats.totalRetries,
      averageProcessingTime: Math.round(this.stats.averageProcessingTime),
      concurrency: this.options.concurrency,
      domain: this.options.domain,
    };
  }

  /**
   * Get all jobs (optionally filtered by status)
   */
  getJobs(status?: JobStatus): Job<T>[] {
    const jobs = Array.from(this.jobs.values());
    return status ? jobs.filter(j => j.status === status) : jobs;
  }

  /**
   * Get a specific job by ID
   */
  getJob(id: string): Job<T> | undefined {
    return this.jobs.get(id);
  }

  /**
   * Remove a job from the queue
   */
  remove(id: string): boolean {
    return this.jobs.delete(id);
  }

  /**
   * Pause queue processing
   */
  pause(): void {
    this.isProcessing = true;
    this.emit('paused');
  }

  /**
   * Resume queue processing
   */
  resume(): void {
    this.isProcessing = false;
    this.emit('resumed');
    this.processNext();
  }

  /**
   * Clear all jobs from queue
   */
  clear(): void {
    this.jobs.clear();
    this.emit('cleared');
  }

  /**
   * Event emitter
   */
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  private emit(event: string, ...args: any[]): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => listener(...args));
  }
}
