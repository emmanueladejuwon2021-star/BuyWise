import { ClickLog } from '../models/ClickLog';
import { Product } from '../models/Product';
import { StoreProfile } from '../models/StoreProfile';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
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

export interface MarketTrend {
  category: string;
  topProducts: Array<{
    productId: string;
    productName: string;
    searchCount: number;
    avgPrice: number;
    clickCount: number;
  }>;
  avgMarketPrice: number;
  totalSearches: number;
  period: string;
}

export interface ShopperInsight {
  mostSearchedTerms: Array<{ term: string; count: number }>;
  popularCategories: Array<{ category: string; count: number }>;
  priceSensitivity: {
    avgPriceClicked: number;
    avgPriceRange: { min: number; max: number };
  };
  peakShoppingHours: Array<{ hour: number; count: number }>;
}

export class AnalyticsService {
  /**
   * Get market demand report for a category
   */
  async getCategoryDemandReport(category: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all click logs for this category
    const clickLogs = await ClickLog.find({
      timestamp: { $gte: startDate },
    }).populate('productId');

    // Group by product
    const productStats = new Map<string, {
      productId: string;
      productName: string;
      searchCount: number;
      clickCount: number;
      prices: number[];
    }>();

    clickLogs.forEach(log => {
      const productId = log.productId.toString();
      if (!productStats.has(productId)) {
        productStats.set(productId, {
          productId,
          productName: (log as any).productName || 'Unknown',
          searchCount: 0,
          clickCount: 0,
          prices: [],
        });
      }

      const stats = productStats.get(productId)!;
      stats.searchCount += 1;
      if (log.redirectUrl) {
        stats.clickCount += 1;
      }
      stats.prices.push(log.originalPrice);
    });

    // Calculate averages and sort
    const topProducts = Array.from(productStats.values())
      .map(stats => ({
        productId: stats.productId,
        productName: stats.productName,
        searchCount: stats.searchCount,
        avgPrice: stats.prices.reduce((a, b) => a + b, 0) / stats.prices.length,
        clickCount: stats.clickCount,
      }))
      .sort((a, b) => b.searchCount - a.searchCount)
      .slice(0, 10);

    const avgMarketPrice = topProducts.length > 0
      ? topProducts.reduce((sum, p) => sum + p.avgPrice, 0) / topProducts.length
      : 0;

    return {
      category,
      topProducts,
      avgMarketPrice,
      totalSearches: clickLogs.length,
      period: `${days} days`,
    } as MarketTrend;
  }

  /**
   * Get shopper insights for a store's categories
   */
  async getShopperInsights(storeId: string, days: number = 30) {
    const store = await StoreProfile.findById(storeId);
    if (!store) {
      throw new Error('Store not found');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all click logs in the time period
    const clickLogs = await ClickLog.find({
      timestamp: { $gte: startDate },
    });

    // Most searched terms (from referrer URLs or search params)
    const searchTermCounts = new Map<string, number>();
    clickLogs.forEach(log => {
      if (log.referrerUrl) {
        const url = new URL(log.referrerUrl);
        const searchQuery = url.searchParams.get('q');
        if (searchQuery) {
          searchTermCounts.set(searchQuery, (searchTermCounts.get(searchQuery) || 0) + 1);
        }
      }
    });

    const mostSearchedTerms = Array.from(searchTermCounts.entries())
      .map(([term, count]) => ({ term, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // Popular categories
    const categoryCounts = new Map<string, number>();
    const products = await Product.find({});
    products.forEach(product => {
      const clicks = clickLogs.filter(log => log.productId === product._id.toString());
      if (clicks.length > 0) {
        categoryCounts.set(product.category, (categoryCounts.get(product.category) || 0) + clicks.length);
      }
    });

    const popularCategories = Array.from(categoryCounts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // Price sensitivity
    const prices = clickLogs.map(log => log.originalPrice);
    const avgPriceClicked = prices.length > 0
      ? prices.reduce((a, b) => a + b, 0) / prices.length
      : 0;

    // Peak shopping hours
    const hourCounts = new Map<number, number>();
    clickLogs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    const peakShoppingHours = Array.from(hourCounts.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count);

    return {
      mostSearchedTerms,
      popularCategories,
      priceSensitivity: {
        avgPriceClicked,
        avgPriceRange: {
          min: Math.min(...prices),
          max: Math.max(...prices),
        },
      },
      peakShoppingHours,
    } as ShopperInsight;
  }

  /**
   * Get store performance analytics
   */
  async getStorePerformance(storeId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const clickLogs = await ClickLog.find({
      retailerId: storeId,
      timestamp: { $gte: startDate },
    });

    const totalClicks = clickLogs.length;
    const uniqueProducts = new Set(clickLogs.map(log => log.productId)).size;
    const totalRevenue = clickLogs.reduce((sum, log) => sum + log.originalPrice, 0);

    // Daily breakdown
    const dailyStats = new Map<string, { clicks: number; revenue: number }>();
    clickLogs.forEach(log => {
      const date = new Date(log.timestamp).toISOString().split('T')[0];
      if (!dailyStats.has(date)) {
        dailyStats.set(date, { clicks: 0, revenue: 0 });
      }
      const stats = dailyStats.get(date)!;
      stats.clicks += 1;
      stats.revenue += log.originalPrice;
    });

    const dailyBreakdown = Array.from(dailyStats.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalClicks,
      uniqueProducts,
      totalRevenue,
      avgDailyClicks: totalClicks / days,
      avgDailyRevenue: totalRevenue / days,
      dailyBreakdown,
      period: `${days} days`,
    };
  }

  /**
   * Get competitive analysis for a store
   */
  async getCompetitiveAnalysis(storeId: string) {
    const store = await StoreProfile.findById(storeId);
    if (!store) {
      throw new Error('Store not found');
    }

    // Get all stores
    const allStores = await StoreProfile.find({
      _id: { $ne: storeId },
      membershipStatus: 'active',
    });

    // Compare metrics
    const comparison = allStores.map(otherStore => ({
      storeId: otherStore._id,
      businessName: otherStore.businessName,
      membershipLevel: otherStore.membershipLevel,
      rating: otherStore.rating,
      totalProducts: otherStore.totalProducts,
      totalClicks: otherStore.totalClicks,
      avgPrice: otherStore.totalSales / (otherStore.totalClicks || 1),
    }));

    // Find store's position
    const sortedByRating = [...comparison, {
      storeId: store._id,
      businessName: store.businessName,
      membershipLevel: store.membershipLevel,
      rating: store.rating,
      totalProducts: store.totalProducts,
      totalClicks: store.totalClicks,
      avgPrice: store.totalSales / (store.totalClicks || 1),
    }].sort((a, b) => b.rating - a.rating);

    const ratingPosition = sortedByRating.findIndex(s => s.storeId === storeId) + 1;

    return {
      totalCompetitors: allStores.length,
      ratingPosition,
      competitors: comparison.slice(0, 10),
    };
  }

  /**
   * Get platform-wide analytics (admin only)
   */
  async getPlatformAnalytics(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const clickLogs = await ClickLog.find({
      timestamp: { $gte: startDate },
    });

    const totalClicks = clickLogs.length;
    const totalRevenue = clickLogs.reduce((sum, log) => sum + log.originalPrice, 0);
    const uniqueUsers = new Set(clickLogs.map(log => log.userId).filter(Boolean)).size;
    const uniqueProducts = new Set(clickLogs.map(log => log.productId)).size;

    // Top retailers by clicks
    const retailerStats = new Map<string, { clicks: number; revenue: number }>();
    clickLogs.forEach(log => {
      if (!retailerStats.has(log.retailerId)) {
        retailerStats.set(log.retailerId, { clicks: 0, revenue: 0 });
      }
      const stats = retailerStats.get(log.retailerId)!;
      stats.clicks += 1;
      stats.revenue += log.originalPrice;
    });

    const topRetailers = Array.from(retailerStats.entries())
      .map(([retailerId, stats]) => ({ retailerId, ...stats }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);

    return {
      totalClicks,
      totalRevenue,
      uniqueUsers,
      uniqueProducts,
      avgRevenuePerClick: totalRevenue / totalClicks,
      topRetailers,
      period: `${days} days`,
    };
  }
}

export const analyticsService = new AnalyticsService();
