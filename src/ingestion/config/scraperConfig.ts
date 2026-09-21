/**
 * PHASE 3 - INGESTION: Scraper Configuration
 * 
 * Centralized configuration for:
 * - User-Agent rotation
 * - Rate limiting per domain
 * - Retry policies
 * - Proxy settings
 * - Robots.txt compliance
 */

export const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
];

export interface RetailerConfig {
  id: string;
  name: string;
  baseUrl: string;
  requestDelay: number; // ms between requests
  maxConcurrent: number;
  maxRequestsPerMinute: number;
  requiresJavaScript: boolean;
  hasAntiBot: boolean;
  robotsTxtRespect: boolean;
  categoryUrls: Record<string, string>;
}

export const RETAILER_CONFIGS: Record<string, RetailerConfig> = {
  jumia: {
    id: 'jumia',
    name: 'Jumia',
    baseUrl: 'https://www.jumia.com.ng',
    requestDelay: 5000, // 5 seconds
    maxConcurrent: 2,
    maxRequestsPerMinute: 12,
    requiresJavaScript: true,
    hasAntiBot: true,
    robotsTxtRespect: true,
    categoryUrls: {
      phones: '/catalog/?q=phones',
      laptops: '/catalog/?q=laptops',
      electronics: '/catalog/?q=electronics',
      fashion: '/catalog/?q=fashion',
    },
  },
  konga: {
    id: 'konga',
    name: 'Konga',
    baseUrl: 'https://www.konga.com',
    requestDelay: 6000,
    maxConcurrent: 2,
    maxRequestsPerMinute: 10,
    requiresJavaScript: true,
    hasAntiBot: true,
    robotsTxtRespect: true,
    categoryUrls: {
      phones: '/search?search=phones',
      laptops: '/search?search=laptops',
      electronics: '/search?search=electronics',
      fashion: '/search?search=fashion',
    },
  },
  amazon: {
    id: 'amazon',
    name: 'Amazon',
    baseUrl: 'https://www.amazon.com',
    requestDelay: 8000,
    maxConcurrent: 1,
    maxRequestsPerMinute: 8,
    requiresJavaScript: false,
    hasAntiBot: true,
    robotsTxtRespect: true,
    categoryUrls: {
      phones: '/s?k=phones',
      laptops: '/s?k=laptops',
      electronics: '/s?k=electronics',
    },
  },
  aliexpress: {
    id: 'aliexpress',
    name: 'AliExpress',
    baseUrl: 'https://www.aliexpress.com',
    requestDelay: 7000,
    maxConcurrent: 2,
    maxRequestsPerMinute: 9,
    requiresJavaScript: true,
    hasAntiBot: true,
    robotsTxtRespect: true,
    categoryUrls: {
      phones: '/w/wholesale-phones.html',
      electronics: '/w/wholesale-electronics.html',
    },
  },
};

export interface ScraperOptions {
  userAgent?: string;
  proxy?: string;
  timeout?: number;
  waitForSelector?: string;
  headers?: Record<string, string>;
}

export const DEFAULT_SCRAPER_OPTIONS: ScraperOptions = {
  timeout: 30000, // 30 seconds
  headers: {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  },
};

/**
 * Get a random user agent
 */
export function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Get retailer configuration
 */
export function getRetailerConfig(retailerId: string): RetailerConfig | undefined {
  return RETAILER_CONFIGS[retailerId];
}

/**
 * Calculate delay with jitter to avoid detection
 */
export function calculateDelayWithJitter(baseDelay: number): number {
  const jitter = Math.random() * 2000; // 0-2 seconds jitter
  return baseDelay + jitter;
}

/**
 * Exponential backoff for retries
 */
export function calculateBackoffDelay(attempt: number, baseDelay: number = 5000): number {
  return baseDelay * Math.pow(2, attempt - 1);
}
