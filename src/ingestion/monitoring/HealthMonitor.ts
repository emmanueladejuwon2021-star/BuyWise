/**
 * PHASE 3 - INGESTION: Health Monitor
 * 
 * Monitors the health of scrapers, queues, and data pipeline:
 * - Tracks scraper success/failure rates
 * - Monitors queue depths and processing times
 * - Detects stale data
 * - Provides health metrics for admin dashboard
 */

import { Queue } from '../queues/QueueManager';
import { BaseScraper } from '../scrapers/BaseScraper';
import { PriceHistoryTracker } from '../pipeline/PriceHistoryTracker';

export interface HealthMetrics {
  timestamp: number;
  overallHealth: 'healthy' | 'degraded' | 'critical';
  scrapers: ScraperHealth[];
  queues: QueueHealth[];
  dataQuality: DataQualityMetrics;
  alerts: HealthAlert[];
}

export interface ScraperHealth {
  retailerId: string;
  isHealthy: boolean;
  isBlocked: boolean;
  consecutiveFailures: number;
  totalRequests: number;
  successRate: number;
  lastRequestTime: number;
  averageResponseTime: number;
}

export interface QueueHealth {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  totalProcessed: number;
  totalFailed: number;
  averageProcessingTime: number;
  failureRate: number;
}

export interface DataQualityMetrics {
  totalProducts: number;
  staleProducts: number;
  stalePercentage: number;
  outliersDetected: number;
  lastFullSync: number | null;
}

export interface HealthAlert {
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: number;
  retailerId?: string;
  resolved: boolean;
}

export class HealthMonitor {
  private scrapers: Map<string, BaseScraper> = new Map();
  private queues: Map<string, Queue> = new Map();
  private priceTracker: PriceHistoryTracker | null = null;
  private alerts: HealthAlert[] = [];
  private lastFullSync: number | null = null;

  /**
   * Register a scraper for monitoring
   */
  registerScraper(scraper: BaseScraper): void {
    this.scrapers.set(scraper['retailerId'], scraper);
  }

  /**
   * Register a queue for monitoring
   */
  registerQueue(queue: Queue, name: string): void {
    this.queues.set(name, queue);
  }

  /**
   * Set price tracker for data quality monitoring
   */
  setPriceTracker(tracker: PriceHistoryTracker): void {
    this.priceTracker = tracker;
  }

  /**
   * Record a full sync completion
   */
  recordFullSync(): void {
    this.lastFullSync = Date.now();
  }

  /**
   * Add an alert
   */
  addAlert(severity: HealthAlert['severity'], message: string, retailerId?: string): void {
    this.alerts.push({
      severity,
      message,
      timestamp: Date.now(),
      retailerId,
      resolved: false,
    });

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }

  /**
   * Get comprehensive health metrics
   */
  getHealthMetrics(): HealthMetrics {
    const scraperHealth = this.getScraperHealth();
    const queueHealth = this.getQueueHealth();
    const dataQuality = this.getDataQualityMetrics();

    // Determine overall health
    let overallHealth: 'healthy' | 'degraded' | 'critical' = 'healthy';

    // Check for critical issues
    const criticalScrapers = scraperHealth.filter(s => !s.isHealthy).length;
    const highFailureQueues = queueHealth.filter(q => q.failureRate > 0.2).length;

    if (criticalScrapers > scraperHealth.length / 2 || highFailureQueues > 0) {
      overallHealth = 'critical';
    } else if (criticalScrapers > 0 || dataQuality.stalePercentage > 20) {
      overallHealth = 'degraded';
    }

    // Generate alerts based on current state
    this.generateAlerts(scraperHealth, queueHealth, dataQuality);

    return {
      timestamp: Date.now(),
      overallHealth,
      scrapers: scraperHealth,
      queues: queueHealth,
      dataQuality,
      alerts: this.alerts.filter(a => !a.resolved),
    };
  }

  /**
   * Get scraper health metrics
   */
  private getScraperHealth(): ScraperHealth[] {
    const health: ScraperHealth[] = [];

    for (const [retailerId, scraper] of this.scrapers.entries()) {
      const status = scraper.getHealthStatus();
      
      health.push({
        retailerId,
        isHealthy: status.isHealthy,
        isBlocked: status.isBlocked,
        consecutiveFailures: status.consecutiveFailures,
        totalRequests: status.totalRequests,
        successRate: status.totalRequests > 0 
          ? ((status.totalRequests - status.consecutiveFailures) / status.totalRequests) * 100 
          : 100,
        lastRequestTime: status.lastRequestTime,
        averageResponseTime: 0, // Would be tracked separately
      });
    }

    return health;
  }

  /**
   * Get queue health metrics
   */
  private getQueueHealth(): QueueHealth[] {
    const health: QueueHealth[] = [];

    for (const [name, queue] of this.queues.entries()) {
      const stats = queue.getStats();
      const totalProcessed = stats.totalProcessed + stats.totalFailed;
      const failureRate = totalProcessed > 0 ? stats.totalFailed / totalProcessed : 0;

      health.push({
        name,
        waiting: stats.waiting,
        active: stats.active,
        completed: stats.completed,
        failed: stats.failed,
        delayed: stats.delayed,
        totalProcessed: stats.totalProcessed,
        totalFailed: stats.totalFailed,
        averageProcessingTime: stats.averageProcessingTime,
        failureRate,
      });
    }

    return health;
  }

  /**
   * Get data quality metrics
   */
  private getDataQualityMetrics(): DataQualityMetrics {
    if (!this.priceTracker) {
      return {
        totalProducts: 0,
        staleProducts: 0,
        stalePercentage: 0,
        outliersDetected: 0,
        lastFullSync: this.lastFullSync,
      };
    }

    const stats = this.priceTracker.getStats();

    return {
      totalProducts: stats.totalProducts,
      staleProducts: 0, // Would need to calculate from actual product data
      stalePercentage: 0,
      outliersDetected: stats.outlierCount,
      lastFullSync: this.lastFullSync,
    };
  }

  /**
   * Generate alerts based on current state
   */
  private generateAlerts(
    scraperHealth: ScraperHealth[],
    queueHealth: QueueHealth[],
    dataQuality: DataQualityMetrics
  ): void {
    // Check for blocked scrapers
    for (const scraper of scraperHealth) {
      if (scraper.isBlocked) {
        this.addAlert('critical', `Scraper for ${scraper.retailerId} is blocked`, scraper.retailerId);
      } else if (scraper.consecutiveFailures >= 3) {
        this.addAlert('warning', `Scraper for ${scraper.retailerId} has ${scraper.consecutiveFailures} consecutive failures`, scraper.retailerId);
      }
    }

    // Check for queue issues
    for (const queue of queueHealth) {
      if (queue.failureRate > 0.2) {
        this.addAlert('error', `Queue ${queue.name} has high failure rate: ${(queue.failureRate * 100).toFixed(1)}%`);
      }
      if (queue.waiting > 100) {
        this.addAlert('warning', `Queue ${queue.name} has ${queue.waiting} waiting jobs`);
      }
    }

    // Check data quality
    if (dataQuality.stalePercentage > 30) {
      this.addAlert('warning', `${dataQuality.stalePercentage.toFixed(1)}% of products have stale prices`);
    }

    if (dataQuality.outliersDetected > 10) {
      this.addAlert('info', `${dataQuality.outliersDetected} price outliers detected and flagged for review`);
    }
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(limit: number = 20): HealthAlert[] {
    return this.alerts
      .slice(-limit)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Resolve an alert
   */
  resolveAlert(index: number): void {
    if (index >= 0 && index < this.alerts.length) {
      this.alerts[index].resolved = true;
    }
  }

  /**
   * Clear all alerts
   */
  clearAlerts(): void {
    this.alerts = [];
  }

  /**
   * Get a summary for admin dashboard
   */
  getAdminSummary() {
    const metrics = this.getHealthMetrics();
    
    return {
      overallHealth: metrics.overallHealth,
      scraperCount: metrics.scrapers.length,
      healthyScrapers: metrics.scrapers.filter(s => s.isHealthy).length,
      blockedScrapers: metrics.scrapers.filter(s => s.isBlocked).length,
      queueCount: metrics.queues.length,
      totalJobsWaiting: metrics.queues.reduce((sum, q) => sum + q.waiting, 0),
      totalJobsFailed: metrics.queues.reduce((sum, q) => sum + q.failed, 0),
      dataQuality: metrics.dataQuality,
      unresolvedAlerts: metrics.alerts.length,
      criticalAlerts: metrics.alerts.filter(a => a.severity === 'critical').length,
      lastUpdated: metrics.timestamp,
    };
  }
}
