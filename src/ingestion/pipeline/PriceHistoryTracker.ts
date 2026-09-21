/**
 * PHASE 3 - INGESTION: Price History Tracker
 * 
 * Tracks price changes over time:
 * - Logs all price updates with timestamps
 * - Detects price outliers (>50% change)
 * - Maintains price history per product/retailer
 * - Flags suspicious price changes for review
 */

import { PriceHistoryEntry } from '../../types';

export interface PriceChange {
  productId: string;
  retailerId: string;
  oldPrice: number;
  newPrice: number;
  currency: string;
  percentageChange: number;
  timestamp: number;
  isOutlier: boolean;
  requiresReview: boolean;
}

export class PriceHistoryTracker {
  private priceHistory: Map<string, PriceHistoryEntry[]> = new Map();
  private priceChanges: PriceChange[] = [];
  private outlierThreshold = 0.5; // 50% change threshold

  /**
   * Get history key for a product/retailer combination
   */
  private getHistoryKey(productId: string, retailerId: string): string {
    return `${productId}_${retailerId}`;
  }

  /**
   * Record a price update
   */
  recordPriceUpdate(
    productId: string,
    retailerId: string,
    newPrice: number,
    currency: string
  ): PriceChange | null {
    const key = this.getHistoryKey(productId, retailerId);
    const history = this.priceHistory.get(key) || [];

    // Get the most recent price
    const lastEntry = history[history.length - 1];
    const oldPrice = lastEntry?.price || newPrice;

    // Calculate percentage change
    const percentageChange = oldPrice > 0 
      ? ((newPrice - oldPrice) / oldPrice) * 100 
      : 0;

    // Detect outlier
    const isOutlier = Math.abs(percentageChange) > (this.outlierThreshold * 100);

    // Create price change record
    const change: PriceChange = {
      productId,
      retailerId,
      oldPrice,
      newPrice,
      currency,
      percentageChange,
      timestamp: Date.now(),
      isOutlier,
      requiresReview: isOutlier,
    };

    // Record the change
    this.priceChanges.push(change);

    // Add to history
    const newEntry: PriceHistoryEntry = {
      date: new Date().toISOString().split('T')[0],
      storeId: retailerId,
      price: newPrice,
      currency,
    };

    history.push(newEntry);
    this.priceHistory.set(key, history);

    // Log outlier
    if (isOutlier) {
      console.warn(
        `[PriceHistory] OUTLIER DETECTED: Product ${productId} at ${retailerId} ` +
        `changed from ${oldPrice} to ${newPrice} (${percentageChange.toFixed(2)}%)`
      );
    }

    return change;
  }

  /**
   * Get price history for a product/retailer
   */
  getPriceHistory(productId: string, retailerId: string): PriceHistoryEntry[] {
    const key = this.getHistoryKey(productId, retailerId);
    return this.priceHistory.get(key) || [];
  }

  /**
   * Get all price history for a product (all retailers)
   */
  getAllPriceHistory(productId: string): PriceHistoryEntry[] {
    const allHistory: PriceHistoryEntry[] = [];
    
    for (const [key, history] of this.priceHistory.entries()) {
      if (key.startsWith(`${productId}_`)) {
        allHistory.push(...history);
      }
    }

    return allHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Get recent price changes
   */
  getRecentPriceChanges(limit: number = 50): PriceChange[] {
    return this.priceChanges
      .slice(-limit)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get outlier price changes (requiring review)
   */
  getOutliers(): PriceChange[] {
    return this.priceChanges.filter(c => c.isOutlier);
  }

  /**
   * Get current price for a product/retailer
   */
  getCurrentPrice(productId: string, retailerId: string): number | null {
    const history = this.getPriceHistory(productId, retailerId);
    if (history.length === 0) return null;
    return history[history.length - 1].price;
  }

  /**
   * Check if a price is stale (older than 24 hours)
   */
  isPriceStale(productId: string, retailerId: string, maxAgeHours: number = 24): boolean {
    const history = this.getPriceHistory(productId, retailerId);
    if (history.length === 0) return true;

    const lastEntry = history[history.length - 1];
    const lastDate = new Date(lastEntry.date);
    const hoursSinceUpdate = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60);

    return hoursSinceUpdate > maxAgeHours;
  }

  /**
   * Get statistics
   */
  getStats() {
    const totalProducts = new Set(
      Array.from(this.priceHistory.keys()).map(k => k.split('_')[0])
    ).size;

    const totalRetailers = new Set(
      Array.from(this.priceHistory.keys()).map(k => k.split('_')[1])
    ).size;

    const totalChanges = this.priceChanges.length;
    const outliers = this.priceChanges.filter(c => c.isOutlier).length;

    return {
      totalProducts,
      totalRetailers,
      totalHistoryEntries: Array.from(this.priceHistory.values()).reduce(
        (sum, history) => sum + history.length, 0
      ),
      totalPriceChanges: totalChanges,
      outlierCount: outliers,
      outlierRate: totalChanges > 0 ? (outliers / totalChanges) * 100 : 0,
    };
  }

  /**
   * Clear history for a specific product/retailer
   */
  clearHistory(productId: string, retailerId: string): void {
    const key = this.getHistoryKey(productId, retailerId);
    this.priceHistory.delete(key);
  }

  /**
   * Clear all history
   */
  clearAll(): void {
    this.priceHistory.clear();
    this.priceChanges = [];
  }

  /**
   * Set outlier threshold
   */
  setOutlierThreshold(threshold: number): void {
    this.outlierThreshold = threshold;
  }
}
