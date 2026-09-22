/**
 * PHASE 3 - INGESTION: Scraper Configuration
 * 
 * Centralized configuration for:
 * - Multi-Store platform configs (Jumia, Konga, Slot, Kara, Jiji, Amazon, AliExpress, and Direct Registered Stores)
 * - User-Agent rotation
 * - Rate limiting per domain
 * - Retry policies
 * - Proxy settings
 * - Robots.txt compliance
 */

export const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
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
    name: 'Jumia Nigeria',
    baseUrl: 'https://www.jumia.com.ng',
    requestDelay: 3000,
    maxConcurrent: 3,
    maxRequestsPerMinute: 20,
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
    name: 'Konga Online',
    baseUrl: 'https://www.konga.com',
    requestDelay: 2500,
    maxConcurrent: 4,
    maxRequestsPerMinute: 25,
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
  slot: {
    id: 'slot',
    name: 'Slot Systems',
    baseUrl: 'https://slot.ng',
    requestDelay: 3000,
    maxConcurrent: 2,
    maxRequestsPerMinute: 15,
    requiresJavaScript: true,
    hasAntiBot: true,
    robotsTxtRespect: true,
    categoryUrls: {
      phones: '/catalogsearch/result/?q=phones',
      laptops: '/catalogsearch/result/?q=laptops',
      electronics: '/catalogsearch/result/?q=electronics',
    },
  },
  kara: {
    id: 'kara',
    name: 'Kara Nigeria',
    baseUrl: 'https://kara.com.ng',
    requestDelay: 3000,
    maxConcurrent: 2,
    maxRequestsPerMinute: 15,
    requiresJavaScript: true,
    hasAntiBot: true,
    robotsTxtRespect: true,
    categoryUrls: {
      phones: '/catalogsearch/result/?q=phones',
      electronics: '/catalogsearch/result/?q=electronics',
    },
  },
  jiji: {
    id: 'jiji',
    name: 'Jiji Classifieds',
    baseUrl: 'https://jiji.ng',
    requestDelay: 4000,
    maxConcurrent: 2,
    maxRequestsPerMinute: 12,
    requiresJavaScript: true,
    hasAntiBot: true,
    robotsTxtRespect: true,
    categoryUrls: {
      phones: '/mobile-phones',
      laptops: '/laptops-and-computers',
    },
  },
  amazon: {
    id: 'amazon',
    name: 'Amazon Global',
    baseUrl: 'https://www.amazon.com',
    requestDelay: 5000,
    maxConcurrent: 1,
    maxRequestsPerMinute: 10,
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
    requestDelay: 4000,
    maxConcurrent: 2,
    maxRequestsPerMinute: 12,
    requiresJavaScript: true,
    hasAntiBot: true,
    robotsTxtRespect: true,
    categoryUrls: {
      phones: '/w/wholesale-phones.html',
      electronics: '/w/wholesale-electronics.html',
    },
  },
  apex_electronics: {
    id: 'apex_electronics',
    name: 'Apex Electronics Hub',
    baseUrl: 'https://apexelectronics.ng',
    requestDelay: 1000,
    maxConcurrent: 5,
    maxRequestsPerMinute: 60,
    requiresJavaScript: false,
    hasAntiBot: false,
    robotsTxtRespect: false,
    categoryUrls: {
      phones: '/catalog?category=phones',
      electronics: '/catalog?category=electronics',
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
  timeout: 30000,
  headers: {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Connection': 'keep-alive',
  },
};

export function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export function getRetailerConfig(retailerId: string): RetailerConfig {
  if (RETAILER_CONFIGS[retailerId]) {
    return RETAILER_CONFIGS[retailerId];
  }
  // Generic fallback for any newly registered merchant store
  return {
    id: retailerId,
    name: retailerId.replace(/_/g, ' ').toUpperCase(),
    baseUrl: 'https://pricewise.market',
    requestDelay: 1000,
    maxConcurrent: 4,
    maxRequestsPerMinute: 50,
    requiresJavaScript: false,
    hasAntiBot: false,
    robotsTxtRespect: false,
    categoryUrls: {},
  };
}

export function calculateDelayWithJitter(baseDelay: number): number {
  const jitter = Math.random() * 500;
  return baseDelay + jitter;
}

export function calculateBackoffDelay(attempt: number, baseDelay: number = 3000): number {
  return baseDelay * Math.pow(1.5, attempt - 1);
}
