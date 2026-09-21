import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Eye, MousePointer, Award, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

const StoreAnalyticsPage: React.FC = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'performance' | 'demand' | 'insights'>('performance');
  const [performance, setPerformance] = useState<any>(null);
  const [demand, setDemand] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('phones');
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [activeTab, category, days]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      if (activeTab === 'performance') {
        const response = await api.getStoreAnalytics('performance', { days });
        setPerformance(response.data);
      } else if (activeTab === 'demand') {
        const response = await api.getStoreAnalytics('demand', { category, days });
        setDemand(response.data);
      } else if (activeTab === 'insights') {
        const response = await api.getStoreAnalytics('insights', { days });
        setInsights(response.data);
      }
    } catch (error: any) {
      addToast(error.message || 'Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
          <p className="text-gray-600 mt-1">Track performance and discover market trends</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'performance', label: 'Performance' },
            { key: 'demand', label: 'Market Demand' },
            { key: 'insights', label: 'Shopper Insights' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Performance Tab */}
        {activeTab === 'performance' && performance && (
          <div className="space-y-6">
            {/* Controls */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Time Period:</label>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Total Clicks</span>
                  <MousePointer size={20} className="text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{performance.totalClicks.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Avg {performance.avgDailyClicks.toFixed(0)}/day</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Total Revenue</span>
                  <DollarSign size={20} className="text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(performance.totalRevenue)}</p>
                <p className="text-xs text-gray-500 mt-1">Avg {formatCurrency(performance.avgDailyRevenue)}/day</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Unique Products</span>
                  <BarChart3 size={20} className="text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{performance.uniqueProducts}</p>
                <p className="text-xs text-gray-500 mt-1">products clicked</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Period</span>
                  <Calendar size={20} className="text-indigo-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{days}</p>
                <p className="text-xs text-gray-500 mt-1">days</p>
              </div>
            </div>

            {/* Daily Breakdown Chart */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performance.dailyBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="clicks" stroke="#6366f1" strokeWidth={2} name="Clicks" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Market Demand Tab */}
        {activeTab === 'demand' && demand && (
          <div className="space-y-6">
            {/* Controls */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="phones">Phones</option>
                <option value="laptops">Laptops</option>
                <option value="electronics">Electronics</option>
                <option value="fashion">Fashion</option>
                <option value="home">Home & Appliances</option>
              </select>
              <label className="text-sm font-medium text-gray-700">Period:</label>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Total Searches</span>
                  <Eye size={20} className="text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{demand.totalSearches.toLocaleString()}</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Avg Market Price</span>
                  <DollarSign size={20} className="text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(demand.avgMarketPrice)}</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Top Products</span>
                  <Award size={20} className="text-yellow-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{demand.topProducts.length}</p>
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products in {category}</h3>
              <div className="space-y-3">
                {demand.topProducts.map((product: any, index: number) => (
                  <div key={product.productId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-gray-300">#{index + 1}</span>
                      <div>
                        <p className="font-medium text-gray-900">{product.productName}</p>
                        <p className="text-sm text-gray-500">
                          {product.searchCount} searches • {product.clickCount} clicks
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">{formatCurrency(product.avgPrice)}</p>
                      <p className="text-xs text-gray-500">avg price</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Shopper Insights Tab */}
        {activeTab === 'insights' && insights && (
          <div className="space-y-6">
            {/* Most Searched Terms */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Searched Terms</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {insights.mostSearchedTerms.slice(0, 10).map((item: any, index: number) => (
                  <div key={item.term} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-300">#{index + 1}</span>
                      <span className="font-medium text-gray-900">{item.term}</span>
                    </div>
                    <span className="text-sm text-gray-500">{item.count} searches</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Categories */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Categories</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={insights.popularCategories}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" name="Clicks" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Price Sensitivity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Sensitivity</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Average Price Clicked</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(insights.priceSensitivity.avgPriceClicked)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Price Range</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(insights.priceSensitivity.avgPriceRange.min)} - {formatCurrency(insights.priceSensitivity.avgPriceRange.max)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Shopping Hours</h3>
                <div className="space-y-2">
                  {insights.peakShoppingHours.slice(0, 5).map((item: any) => (
                    <div key={item.hour} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{item.hour}:00</span>
                      <div className="flex-1 mx-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${(item.count / insights.peakShoppingHours[0].count) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreAnalyticsPage;
