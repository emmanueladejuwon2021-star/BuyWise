/**
 * API Service - Connects Frontend to Real Backend
 * 
 * This service handles all API calls to the backend server
 * which performs real web scraping.
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api/v1';

export interface Product {
  _id: string;
  name: string;
  slug: string;
  category: string;
  brand: string;
  images: string[];
  specifications: Record<string, string>;
  listings: StoreListing[];
  lastVerified: string;
}

export interface StoreListing {
  store: {
    id: string;
    name: string;
    logo: string;
  };
  price: number;
  originalPrice: number;
  currency: string;
  shippingCost: number;
  totalCost: number;
  inStock: boolean;
  affiliateUrl: string;
  lastVerified: string;
}

export interface PriceHistoryEntry {
  _id: string;
  productId: string;
  retailerId: string;
  price: number;
  timestamp: string;
  percentageChange?: number;
  isOutlier: boolean;
}

export interface SearchResponse {
  success: boolean;
  products: Product[];
  total: number;
  limit: number;
  offset: number;
}

export interface HealthResponse {
  success: boolean;
  scraper: {
    retailerId: string;
    isHealthy: boolean;
    isBlocked: boolean;
    consecutiveFailures: number;
    totalRequests: number;
  };
  queues: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  };
  recentChanges: number;
  outliers: number;
}

class ApiService {
  /**
   * Get products with optional filters
   */
  async getProducts(params?: {
    category?: string;
    brand?: string;
    limit?: number;
    offset?: number;
  }): Promise<SearchResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.category) searchParams.append('category', params.category);
    if (params?.brand) searchParams.append('brand', params.brand);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    const response = await fetch(`${API_BASE_URL}/products?${searchParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    return response.json();
  }

  /**
   * Get product by ID
   */
  async getProduct(id: string): Promise<{ success: boolean; product: Product }> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }

    return response.json();
  }

  /**
   * Get price history for a product
   */
  async getPriceHistory(productId: string, retailerId?: string): Promise<{
    success: boolean;
    history: PriceHistoryEntry[];
  }> {
    const params = new URLSearchParams();
    if (retailerId) params.append('retailerId', retailerId);

    const response = await fetch(
      `${API_BASE_URL}/products/${productId}/price-history?${params}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch price history');
    }

    return response.json();
  }

  /**
   * Trigger a scrape job (Admin)
   */
  async triggerScrape(url: string, retailerId: string = 'jumia'): Promise<{
    success: boolean;
    jobId: string;
    status: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/admin/ingestion/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, retailerId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to trigger scrape');
    }

    return response.json();
  }

  /**
   * Scrape a category (Admin)
   */
  async scrapeCategory(category: string, maxProducts: number = 10): Promise<{
    success: boolean;
    productsScraped: number;
    productsQueued: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/admin/ingestion/category`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ category, maxProducts }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to scrape category');
    }

    return response.json();
  }

  /**
   * Get system health status (Admin)
   */
  async getHealthStatus(): Promise<HealthResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/ingestion/health`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch health status');
    }

    return response.json();
  }

  /**
   * Get recent price changes (Admin)
   */
  async getRecentPriceChanges(limit: number = 50): Promise<{
    success: boolean;
    changes: PriceHistoryEntry[];
  }> {
    const response = await fetch(
      `${API_BASE_URL}/admin/ingestion/price-changes?limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch price changes');
    }

    return response.json();
  }

  /**
   * Get outliers (Admin)
   */
  async getOutliers(): Promise<{
    success: boolean;
    outliers: PriceHistoryEntry[];
  }> {
    const response = await fetch(`${API_BASE_URL}/admin/ingestion/outliers`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch outliers');
    }

    return response.json();
  }
}

export const api = new ApiService();
