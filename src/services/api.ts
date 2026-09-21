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

  /**
   * Get user's watchlist
   */
  async getWatchlist(page: number = 1, limit: number = 20): Promise<{
    success: boolean;
    data: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const response = await fetch(`${API_BASE_URL}/watchlist?page=${page}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch watchlist');
    }

    return response.json();
  }

  /**
   * Add product to watchlist
   */
  async addToWatchlist(data: {
    masterProductId: string;
    productName: string;
    productImage?: string;
    targetPrice?: number;
    targetPercentageDrop?: number;
    alertType?: 'absolute' | 'percentage' | 'any';
    channels?: ('email' | 'sms' | 'push')[];
  }): Promise<{
    success: boolean;
    data: any;
    message: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/watchlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add to watchlist');
    }

    return response.json();
  }

  /**
   * Update watchlist item
   */
  async updateWatchlistItem(watchlistId: string, data: {
    targetPrice?: number;
    targetPercentageDrop?: number;
    alertType?: 'absolute' | 'percentage' | 'any';
    channels?: ('email' | 'sms' | 'push')[];
    isActive?: boolean;
  }): Promise<{
    success: boolean;
    data: any;
    message: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/watchlist/${watchlistId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update watchlist item');
    }

    return response.json();
  }

  /**
   * Remove product from watchlist
   */
  async removeFromWatchlist(watchlistId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/watchlist/${watchlistId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove from watchlist');
    }

    return response.json();
  }

  /**
   * Get watchlist statistics
   */
  async getWatchlistStats(): Promise<{
    success: boolean;
    data: {
      totalItems: number;
      activeItems: number;
      totalSavings: number;
      averageSavingsPercentage: number;
      itemsAtAllTimeLow: number;
      itemsWithAlerts: number;
    };
  }> {
    const response = await fetch(`${API_BASE_URL}/watchlist/stats`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch watchlist stats');
    }

    return response.json();
  }

  /**
   * Get price analytics for a product
   */
  async getPriceAnalytics(productId: string, range: '30d' | '90d' | '180d' | 'all' = '90d'): Promise<{
    success: boolean;
    data: any;
  }> {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/price-history?range=${range}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch price analytics');
    }

    return response.json();
  }

  /**
   * Register a new store (Demo mode - uses localStorage)
   */
  async registerStore(data: {
    businessName: string;
    logoUrl?: string;
    description?: string;
    address?: string;
    city?: string;
    state?: string;
    deliveryAreas?: string[];
    contactEmail: string;
    contactPhone?: string;
    website?: string;
  }): Promise<{
    success: boolean;
    data: any;
    message: string;
  }> {
    // Demo mode: Use localStorage instead of backend API
    const storeData = {
      _id: `store_${Date.now()}`,
      userId: 'demo_user',
      businessName: data.businessName,
      logoUrl: data.logoUrl || '',
      description: data.description || '',
      address: data.address || '',
      city: data.city || '',
      state: data.state || '',
      deliveryAreas: data.deliveryAreas || [],
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone || '',
      website: data.website || '',
      membershipLevel: 'free',
      membershipStatus: 'active',
      membershipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      adCreditsBalance: 100, // Give 100 free credits for demo
      totalAdCreditsPurchased: 100,
      isVerified: false,
      rating: 0,
      totalProducts: 0,
      totalClicks: 0,
      totalSales: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem('pricewise_store', JSON.stringify(storeData));

    return {
      success: true,
      data: storeData,
      message: 'Store registered successfully! You have 100 free ad credits to start.',
    };
  }

  /**
   * Get store profile (Demo mode - uses localStorage)
   */
  async getStoreProfile(): Promise<{
    success: boolean;
    data: any;
  }> {
    const storeData = localStorage.getItem('pricewise_store');
    
    if (!storeData) {
      throw new Error('No store found. Please register your store first.');
    }

    return {
      success: true,
      data: JSON.parse(storeData),
    };
  }

  /**
   * Update store profile (Demo mode - uses localStorage)
   */
  async updateStoreProfile(data: any): Promise<{
    success: boolean;
    data: any;
    message: string;
  }> {
    const storeData = localStorage.getItem('pricewise_store');
    
    if (!storeData) {
      throw new Error('No store found. Please register your store first.');
    }

    const updatedStore = {
      ...JSON.parse(storeData),
      ...data,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem('pricewise_store', JSON.stringify(updatedStore));

    return {
      success: true,
      data: updatedStore,
      message: 'Store profile updated successfully!',
    };
  }

  /**
   * Get campaign statistics (Demo mode - uses localStorage)
   */
  async getCampaignStats(): Promise<{
    success: boolean;
    data: any;
  }> {
    const campaigns = JSON.parse(localStorage.getItem('pricewise_campaigns') || '[]');
    
    const stats = {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter((c: any) => c.status === 'active').length,
      totalBudget: campaigns.reduce((sum: number, c: any) => sum + c.totalBudget, 0),
      totalSpent: campaigns.reduce((sum: number, c: any) => sum + c.spentAmount, 0),
      totalClicks: campaigns.reduce((sum: number, c: any) => sum + c.totalClicks, 0),
      totalImpressions: campaigns.reduce((sum: number, c: any) => sum + c.totalImpressions, 0),
      averageCTR: campaigns.length > 0 
        ? campaigns.reduce((sum: number, c: any) => sum + c.clickThroughRate, 0) / campaigns.length 
        : 0,
    };

    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Get store campaigns (Demo mode - uses localStorage)
   */
  async getStoreCampaigns(status?: string): Promise<{
    success: boolean;
    data: any[];
  }> {
    let campaigns = JSON.parse(localStorage.getItem('pricewise_campaigns') || '[]');
    
    if (status && status !== 'all') {
      campaigns = campaigns.filter((c: any) => c.status === status);
    }

    return {
      success: true,
      data: campaigns,
    };
  }

  /**
   * Create a new campaign (Demo mode - uses localStorage)
   */
  async createCampaign(data: {
    campaignName: string;
    productId?: string;
    targetCategory?: string;
    totalBudget: number;
    costPerClick: number;
    placementLocation: 'search_top' | 'comparison_top' | 'homepage_banner';
    startDate: string;
    endDate?: string;
  }): Promise<{
    success: boolean;
    data: any;
    message: string;
  }> {
    // Check if store has enough credits
    const storeData = localStorage.getItem('pricewise_store');
    if (!storeData) {
      throw new Error('No store found. Please register your store first.');
    }

    const store = JSON.parse(storeData);
    if (store.adCreditsBalance < data.totalBudget) {
      throw new Error(`Insufficient ad credits. You need ${data.totalBudget} credits but only have ${store.adCreditsBalance}.`);
    }

    // Deduct credits
    store.adCreditsBalance -= data.totalBudget;
    localStorage.setItem('pricewise_store', JSON.stringify(store));

    // Create campaign
    const campaign = {
      _id: `campaign_${Date.now()}`,
      storeId: store._id,
      campaignName: data.campaignName,
      productId: data.productId,
      targetCategory: data.targetCategory,
      totalBudget: data.totalBudget,
      spentAmount: 0,
      costPerClick: data.costPerClick,
      placementLocation: data.placementLocation,
      status: 'active',
      startDate: data.startDate,
      endDate: data.endDate,
      totalImpressions: Math.floor(Math.random() * 1000), // Demo data
      totalClicks: Math.floor(Math.random() * 100), // Demo data
      clickThroughRate: Math.random() * 10, // Demo data
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save campaign
    const campaigns = JSON.parse(localStorage.getItem('pricewise_campaigns') || '[]');
    campaigns.push(campaign);
    localStorage.setItem('pricewise_campaigns', JSON.stringify(campaigns));

    return {
      success: true,
      data: campaign,
      message: 'Campaign created successfully!',
    };
  }

  /**
   * Get membership plans (Demo mode - returns hardcoded plans)
   */
  async getMembershipPlans(): Promise<{
    success: boolean;
    data: any;
  }> {
    const plans = {
      free: {
        level: 'free',
        name: 'Free Store',
        price: 0,
        duration: 365,
        features: [
          'Basic store profile',
          'Regular product listing',
          'Standard search ranking',
        ],
        adCreditsIncluded: 0,
      },
      premium: {
        level: 'premium',
        name: 'Premium Store',
        price: 25000,
        duration: 30,
        features: [
          'Verified Store badge',
          'Faster price updates',
          'Higher search priority',
          'Shopper search reports',
          'Market demand trends',
          '500 free ad credits/month',
        ],
        adCreditsIncluded: 500,
      },
      enterprise: {
        level: 'enterprise',
        name: 'Enterprise Store',
        price: 100000,
        duration: 30,
        features: [
          'All Premium features',
          'Priority customer support',
          'Custom analytics dashboard',
          'API access',
          'Dedicated account manager',
          '2000 free ad credits/month',
        ],
        adCreditsIncluded: 2000,
      },
    };

    return {
      success: true,
      data: plans,
    };
  }

  /**
   * Initialize membership checkout (Demo mode - simulates payment)
   */
  async initializeMembershipCheckout(membershipLevel: 'premium' | 'enterprise', paymentProvider: string = 'paystack'): Promise<{
    success: boolean;
    data: any;
    message: string;
  }> {
    const storeData = localStorage.getItem('pricewise_store');
    if (!storeData) {
      throw new Error('No store found. Please register your store first.');
    }

    const store = JSON.parse(storeData);
    const plans: any = {
      premium: { price: 25000, credits: 500, duration: 30 },
      enterprise: { price: 100000, credits: 2000, duration: 30 },
    };

    const plan = plans[membershipLevel];

    // Simulate payment success (in production, this would redirect to payment gateway)
    // For demo, we'll auto-complete the payment
    store.membershipLevel = membershipLevel;
    store.membershipStatus = 'active';
    store.membershipExpiry = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000).toISOString();
    store.adCreditsBalance += plan.credits;
    store.totalAdCreditsPurchased += plan.credits;
    store.isVerified = true;

    localStorage.setItem('pricewise_store', JSON.stringify(store));

    return {
      success: true,
      data: {
        paymentId: `payment_${Date.now()}`,
        transactionRef: `MEM_${store._id}_${Date.now()}`,
        amount: plan.price,
        currency: 'NGN',
        paymentProvider,
        status: 'successful',
      },
      message: `Payment successful! You've been upgraded to ${membershipLevel} membership with ${plan.credits} free credits.`,
    };
  }

  /**
   * Initialize credits checkout (Demo mode - simulates payment)
   */
  async initializeCreditsCheckout(creditsAmount: number, paymentProvider: string = 'paystack'): Promise<{
    success: boolean;
    data: any;
    message: string;
  }> {
    const storeData = localStorage.getItem('pricewise_store');
    if (!storeData) {
      throw new Error('No store found. Please register your store first.');
    }

    const store = JSON.parse(storeData);
    const costPerCredit = 50;
    const totalAmount = creditsAmount * costPerCredit;

    // Simulate payment success
    store.adCreditsBalance += creditsAmount;
    store.totalAdCreditsPurchased += creditsAmount;

    localStorage.setItem('pricewise_store', JSON.stringify(store));

    return {
      success: true,
      data: {
        paymentId: `payment_${Date.now()}`,
        transactionRef: `CRD_${store._id}_${Date.now()}`,
        amount: totalAmount,
        currency: 'NGN',
        paymentProvider,
        status: 'successful',
      },
      message: `Payment successful! ${creditsAmount} credits have been added to your account.`,
    };
  }

  /**
   * Get store analytics (Demo mode - returns mock data)
   */
  async getStoreAnalytics(type: 'demand' | 'insights' | 'performance' | 'competitive', params?: any): Promise<{
    success: boolean;
    data: any;
  }> {
    // Generate demo analytics data
    if (type === 'performance') {
      const days = params?.days || 30;
      const dailyBreakdown = Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - i - 1));
        return {
          date: date.toISOString().split('T')[0],
          clicks: Math.floor(Math.random() * 100) + 20,
          revenue: Math.floor(Math.random() * 500000) + 100000,
        };
      });

      const totalClicks = dailyBreakdown.reduce((sum, d) => sum + d.clicks, 0);
      const totalRevenue = dailyBreakdown.reduce((sum, d) => sum + d.revenue, 0);

      return {
        success: true,
        data: {
          totalClicks,
          totalRevenue,
          uniqueProducts: Math.floor(Math.random() * 50) + 10,
          avgDailyClicks: totalClicks / days,
          avgDailyRevenue: totalRevenue / days,
          dailyBreakdown,
          period: `${days} days`,
        },
      };
    }

    if (type === 'demand') {
      const category = params?.category || 'phones';
      const topProducts = Array.from({ length: 10 }, (_, i) => ({
        productId: `product_${i}`,
        productName: `${category.charAt(0).toUpperCase() + category.slice(1)} Product ${i + 1}`,
        searchCount: Math.floor(Math.random() * 1000) + 100,
        avgPrice: Math.floor(Math.random() * 500000) + 50000,
        clickCount: Math.floor(Math.random() * 200) + 20,
      }));

      return {
        success: true,
        data: {
          category,
          topProducts,
          avgMarketPrice: topProducts.reduce((sum, p) => sum + p.avgPrice, 0) / topProducts.length,
          totalSearches: topProducts.reduce((sum, p) => sum + p.searchCount, 0),
          period: `${params?.days || 30} days`,
        },
      };
    }

    if (type === 'insights') {
      return {
        success: true,
        data: {
          mostSearchedTerms: [
            { term: 'iPhone 15', count: 1250 },
            { term: 'Samsung S24', count: 980 },
            { term: 'Laptop', count: 850 },
            { term: 'Headphones', count: 720 },
            { term: 'Smart TV', count: 650 },
          ],
          popularCategories: [
            { category: 'phones', count: 3500 },
            { category: 'laptops', count: 2800 },
            { category: 'electronics', count: 2200 },
            { category: 'fashion', count: 1800 },
          ],
          priceSensitivity: {
            avgPriceClicked: 250000,
            avgPriceRange: { min: 50000, max: 1500000 },
          },
          peakShoppingHours: [
            { hour: 20, count: 450 },
            { hour: 19, count: 420 },
            { hour: 21, count: 380 },
            { hour: 18, count: 350 },
            { hour: 14, count: 320 },
          ],
        },
      };
    }

    // competitive
    return {
      success: true,
      data: {
        totalCompetitors: 25,
        ratingPosition: 5,
        competitors: Array.from({ length: 10 }, (_, i) => ({
          storeId: `store_${i}`,
          businessName: `Competitor Store ${i + 1}`,
          membershipLevel: i < 3 ? 'enterprise' : 'premium',
          rating: (5 - i * 0.3).toFixed(1),
          totalProducts: Math.floor(Math.random() * 500) + 100,
          totalClicks: Math.floor(Math.random() * 10000) + 1000,
          avgPrice: Math.floor(Math.random() * 300000) + 100000,
        })),
      },
    };
  }

  /**
   * Pause a campaign (Demo mode - uses localStorage)
   */
  async pauseCampaign(campaignId: string): Promise<{
    success: boolean;
    data: any;
    message: string;
  }> {
    const campaigns = JSON.parse(localStorage.getItem('pricewise_campaigns') || '[]');
    const campaignIndex = campaigns.findIndex((c: any) => c._id === campaignId);
    
    if (campaignIndex === -1) {
      throw new Error('Campaign not found');
    }

    campaigns[campaignIndex].status = 'paused';
    campaigns[campaignIndex].isActive = false;
    campaigns[campaignIndex].updatedAt = new Date().toISOString();

    localStorage.setItem('pricewise_campaigns', JSON.stringify(campaigns));

    return {
      success: true,
      data: campaigns[campaignIndex],
      message: 'Campaign paused successfully',
    };
  }

  /**
   * Resume a campaign (Demo mode - uses localStorage)
   */
  async resumeCampaign(campaignId: string): Promise<{
    success: boolean;
    data: any;
    message: string;
  }> {
    const campaigns = JSON.parse(localStorage.getItem('pricewise_campaigns') || '[]');
    const campaignIndex = campaigns.findIndex((c: any) => c._id === campaignId);
    
    if (campaignIndex === -1) {
      throw new Error('Campaign not found');
    }

    const campaign = campaigns[campaignIndex];
    
    if (campaign.spentAmount >= campaign.totalBudget) {
      throw new Error('Campaign has exhausted its budget');
    }

    campaigns[campaignIndex].status = 'active';
    campaigns[campaignIndex].isActive = true;
    campaigns[campaignIndex].updatedAt = new Date().toISOString();

    localStorage.setItem('pricewise_campaigns', JSON.stringify(campaigns));

    return {
      success: true,
      data: campaigns[campaignIndex],
      message: 'Campaign resumed successfully',
    };
  }
}

export const api = new ApiService();
