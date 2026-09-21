/**
 * PHASE 2 - ENGINE: Caching Layer
 * 
 * Simulates Redis-style server-side caching with TTL support.
 * In production, this would be replaced with actual Redis client.
 * 
 * Features:
 * - TTL-based expiration (default 5-15 minutes)
 * - Cache invalidation by key pattern
 * - Cache hit/miss statistics
 * - Automatic cleanup of expired entries
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
  hits: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
}

class CacheLayer {
  private store: Map<string, CacheEntry<unknown>> = new Map();
  private stats: CacheStats = { hits: 0, misses: 0, evictions: 0, size: 0 };
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;
  
  // Default TTLs in milliseconds
  static readonly TTL_SHORT = 5 * 60 * 1000;   // 5 minutes - volatile data
  static readonly TTL_MEDIUM = 10 * 60 * 1000; // 10 minutes - search results
  static readonly TTL_LONG = 15 * 60 * 1000;   // 15 minutes - product details
  static readonly TTL_HOURLY = 60 * 60 * 1000; // 1 hour - categories/facets
  
  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }
  
  /**
   * Get a value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.stats.misses++;
      this.stats.evictions++;
      this.stats.size = this.store.size;
      return null;
    }
    
    // Update hit count
    entry.hits++;
    this.stats.hits++;
    return entry.value;
  }
  
  /**
   * Set a value in cache with TTL
   */
  set<T>(key: string, value: T, ttl: number = CacheLayer.TTL_MEDIUM): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now(),
      hits: 0,
    });
    this.stats.size = this.store.size;
  }
  
  /**
   * Delete a specific key
   */
  delete(key: string): boolean {
    const deleted = this.store.delete(key);
    if (deleted) this.stats.size = this.store.size;
    return deleted;
  }
  
  /**
   * Invalidate all keys matching a pattern
   * e.g., "search:*" invalidates all search cache entries
   */
  invalidatePattern(pattern: string): number {
    const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
    let count = 0;
    
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
        count++;
      }
    }
    
    this.stats.size = this.store.size;
    this.stats.evictions += count;
    return count;
  }
  
  /**
   * Clear all cache entries
   */
  clear(): void {
    this.store.clear();
    this.stats.size = 0;
  }
  
  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { hitRate: string } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? ((this.stats.hits / total) * 100).toFixed(1) : '0.0';
    return { ...this.stats, hitRate: `${hitRate}%` };
  }
  
  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let evicted = 0;
    
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        evicted++;
      }
    }
    
    if (evicted > 0) {
      this.stats.evictions += evicted;
      this.stats.size = this.store.size;
    }
  }
  
  /**
   * Destroy the cache (cleanup intervals)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }
}

// Singleton cache instance
export const cache = new CacheLayer();

/**
 * Cache key generators
 */
export const CacheKeys = {
  search: (params: string) => `search:${params}`,
  product: (id: string) => `product:${id}`,
  facets: (category: string) => `facets:${category}`,
  masterProducts: () => 'master_products:all',
};
