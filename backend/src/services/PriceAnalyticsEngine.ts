import { PriceHistory } from '../models/PriceHistory';
import { WatchlistItem } from '../models/WatchlistItem';

export interface PriceAnalytics {
  productId: string;
  range: '30d' | '90d' | '180d' | 'all';
  startDate: Date;
  endDate: Date;
  statistics: {
    allTimeLow: {
      price: number;
      date: Date;
      retailer: string;
    };
    allTimeHigh: {
      price: number;
      date: Date;
      retailer: string;
    };
    averagePrice: number;
    currentPrice: number;
    priceVolatility: number; // Standard deviation
    totalDataPoints: number;
  };
  timeline: {
    date: string;
    prices: {
      retailer: string;
      price: number;
    }[];
  }[];
  chartData: {
    date: string;
    [retailer: string]: number | string;
  }[];
}

export class PriceAnalyticsEngine {
  /**
   * Get price analytics for a product over a specified time range
   */
  async getProductAnalytics(
    productId: string,
    range: '30d' | '90d' | '180d' | 'all' = '90d'
  ): Promise<PriceAnalytics> {
    const endDate = new Date();
    let startDate: Date;

    switch (range) {
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '180d':
        startDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        startDate = new Date(0);
        break;
    }

    // Fetch price history for the product
    const priceHistory = await PriceHistory.find({
      productId,
      timestamp: { $gte: startDate, $lte: endDate }
    }).sort({ timestamp: 1 });

    if (priceHistory.length === 0) {
      throw new Error('No price history found for this product');
    }

    // Calculate statistics
    const statistics = await this.calculateStatistics(productId, priceHistory);

    // Build timeline
    const timeline = this.buildTimeline(priceHistory);

    // Build chart data
    const chartData = this.buildChartData(timeline);

    return {
      productId,
      range,
      startDate,
      endDate,
      statistics,
      timeline,
      chartData
    };
  }

  /**
   * Calculate price statistics
   */
  private async calculateStatistics(
    productId: string,
    priceHistory: any[]
  ): Promise<PriceAnalytics['statistics']> {
    // Get all-time low and high
    const allTimeHistory = await PriceHistory.find({ productId })
      .sort({ price: 1 })
      .limit(1);
    
    const allTimeHighHistory = await PriceHistory.find({ productId })
      .sort({ price: -1 })
      .limit(1);

    const allTimeLow = allTimeHistory[0];
    const allTimeHigh = allTimeHighHistory[0];

    // Calculate average price
    const prices = priceHistory.map(h => h.price);
    const averagePrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;

    // Calculate current price (most recent)
    const currentPrice = priceHistory[priceHistory.length - 1].price;

    // Calculate price volatility (standard deviation)
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - averagePrice, 2), 0) / prices.length;
    const priceVolatility = Math.sqrt(variance);

    return {
      allTimeLow: {
        price: allTimeLow.price,
        date: allTimeLow.timestamp,
        retailer: allTimeLow.retailerId
      },
      allTimeHigh: {
        price: allTimeHigh.price,
        date: allTimeHigh.timestamp,
        retailer: allTimeHigh.retailerId
      },
      averagePrice,
      currentPrice,
      priceVolatility,
      totalDataPoints: priceHistory.length
    };
  }

  /**
   * Build timeline data grouped by date
   */
  private buildTimeline(priceHistory: any[]): PriceAnalytics['timeline'] {
    const timelineMap = new Map<string, Map<string, number>>();

    priceHistory.forEach(entry => {
      const date = entry.timestamp.toISOString().split('T')[0];
      const retailer = entry.retailerId;
      const price = entry.price;

      if (!timelineMap.has(date)) {
        timelineMap.set(date, new Map());
      }

      const dateMap = timelineMap.get(date)!;
      // Keep the lowest price for each retailer on each day
      if (!dateMap.has(retailer) || dateMap.get(retailer)! > price) {
        dateMap.set(retailer, price);
      }
    });

    // Convert to array format
    const timeline: PriceAnalytics['timeline'] = [];
    timelineMap.forEach((retailerMap, date) => {
      const prices: { retailer: string; price: number }[] = [];
      retailerMap.forEach((price, retailer) => {
        prices.push({ retailer, price });
      });

      timeline.push({ date, prices });
    });

    return timeline.sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Build chart-ready data format
   */
  private buildChartData(timeline: PriceAnalytics['timeline']): PriceAnalytics['chartData'] {
    // Get all unique retailers
    const retailers = new Set<string>();
    timeline.forEach(entry => {
      entry.prices.forEach(p => retailers.add(p.retailer));
    });

    // Build chart data with interpolation for missing dates
    const chartData: PriceAnalytics['chartData'] = [];
    
    timeline.forEach(entry => {
      const dataPoint: any = { date: entry.date };
      
      retailers.forEach(retailer => {
        const priceEntry = entry.prices.find(p => p.retailer === retailer);
        dataPoint[retailer] = priceEntry ? priceEntry.price : null;
      });

      chartData.push(dataPoint);
    });

    // Interpolate missing values
    return this.interpolateMissingValues(chartData, Array.from(retailers));
  }

  /**
   * Interpolate missing values in chart data
   */
  private interpolateMissingValues(
    chartData: PriceAnalytics['chartData'],
    retailers: string[]
  ): PriceAnalytics['chartData'] {
    const interpolated = [...chartData];

    retailers.forEach(retailer => {
      let lastKnownValue: number | null = null;

      interpolated.forEach((point, index) => {
        if (point[retailer] !== null && point[retailer] !== undefined) {
          lastKnownValue = point[retailer] as number;
        } else if (lastKnownValue !== null) {
          // Find next known value
          let nextKnownValue: number | null = null;
          for (let i = index + 1; i < interpolated.length; i++) {
            if (interpolated[i][retailer] !== null && interpolated[i][retailer] !== undefined) {
              nextKnownValue = interpolated[i][retailer] as number;
              break;
            }
          }

          // Interpolate
          if (nextKnownValue !== null) {
            point[retailer] = (lastKnownValue + nextKnownValue) / 2;
          } else {
            point[retailer] = lastKnownValue;
          }
        }
      });
    });

    return interpolated;
  }

  /**
   * Update watchlist item with current prices
   */
  async updateWatchlistItemPrices(watchlistItemId: string): Promise<void> {
    const watchlistItem = await WatchlistItem.findById(watchlistItemId);
    if (!watchlistItem) {
      throw new Error('Watchlist item not found');
    }

    // Get current lowest price
    const currentPrices = await PriceHistory.find({
      productId: watchlistItem.masterProductId
    })
      .sort({ timestamp: -1 })
      .limit(10); // Get recent prices from all retailers

    if (currentPrices.length === 0) return;

    const lowestCurrentPrice = Math.min(...currentPrices.map(p => p.price));
    watchlistItem.currentLowestPrice = lowestCurrentPrice;

    // Update all-time low
    const allTimeLow = await PriceHistory.find({
      productId: watchlistItem.masterProductId
    })
      .sort({ price: 1 })
      .limit(1);

    if (allTimeLow.length > 0) {
      watchlistItem.allTimeLow = allTimeLow[0].price;
      watchlistItem.allTimeLowDate = allTimeLow[0].timestamp;
    }

    // Calculate savings
    watchlistItem.totalSavings = watchlistItem.initialPrice - lowestCurrentPrice;
    watchlistItem.savingsPercentage = (watchlistItem.totalSavings / watchlistItem.initialPrice) * 100;

    await watchlistItem.save();
  }
}

export const priceAnalyticsEngine = new PriceAnalyticsEngine();
