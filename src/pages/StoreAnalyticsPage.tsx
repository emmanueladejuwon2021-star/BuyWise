import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Users, MousePointer, DollarSign, 
  Search, Eye, ArrowUpRight, ArrowDownRight, Compass, Filter, RefreshCw 
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

interface PerformanceData {
  overview: {
    totalImpressions: number;
    totalClicks: number;
    averageCTR: number;
    totalCost: number;
    averageCPC: number;
    conversions: number;
    conversionRate: number;
    revenue: number;
  };
  dailyMetrics: Array<{
    date: string;
    impressions: number;
    clicks: number;
    ctr: number;
    cost: number;
    conversions: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    impressions: number;
    clicks: number;
    ctr: number;
    cost: number;
  }>;
}

const StoreAnalyticsPage: React.FC = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'performance' | 'demand' | 'insights'>('performance');
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);

  const [performance, setPerformance] = useState<PerformanceData>({
    overview: {
      totalImpressions: 54800,
      totalClicks: 2430,
      averageCTR: 4.43,
      totalCost: 97200,
      averageCPC: 40,
      conversions: 86,
      conversionRate: 3.54,
      revenue: 4850000,
    },
    dailyMetrics: [
      { date: 'Sep 15', impressions: 2100, clicks: 94, ctr: 4.47, cost: 3760, conversions: 4 },
      { date: 'Sep 16', impressions: 2400, clicks: 110, ctr: 4.58, cost: 4400, conversions: 5 },
      { date: 'Sep 17', impressions: 2800, clicks: 132, ctr: 4.71, cost: 5280, conversions: 6 },
      { date: 'Sep 18', impressions: 3100, clicks: 145, ctr: 4.67, cost: 5800, conversions: 7 },
      { date: 'Sep 19', impressions: 3400, clicks: 160, ctr: 4.70, cost: 6400, conversions: 8 },
      { date: 'Sep 20', impressions: 3900, clicks: 185, ctr: 4.74, cost: 7400, conversions: 9 },
      { date: 'Sep 21', impressions: 4200, clicks: 198, ctr: 4.71, cost: 7920, conversions: 10 },
    ],
    categoryBreakdown: [
      { category: 'Smartphones & Tablets', impressions: 28500, clicks: 1350, ctr: 4.73, cost: 54000 },
      { category: 'Laptops & Computers', impressions: 14200, clicks: 610, ctr: 4.29, cost: 24400 },
      { category: 'Audio & Wearables', impressions: 7800, clicks: 310, ctr: 3.97, cost: 12400 },
      { category: 'Home Appliances', impressions: 4300, clicks: 160, ctr: 3.72, cost: 6400 },
    ],
  });

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 size={20} className="text-orange-600" />
            Store Traffic & Conversion Analytics
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Monitor incoming shopper clicks, buyer intent keywords, and competitor price positions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => {
              setDays(Number(e.target.value));
              addToast(`Data timeframe adjusted to ${e.target.value} days`, 'info');
            }}
            className="px-2.5 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white outline-none focus:border-orange-500"
          >
            <option value={7}>Last 7 Days</option>
            <option value={14}>Last 14 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last Quarter</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {[
          { key: 'performance', label: '📊 CPC & Lead Performance' },
          { key: 'demand', label: '🔥 Top Searched Keywords' },
          { key: 'insights', label: '🎯 Competitor Price Index' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === tab.key
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Performance */}
      {activeTab === 'performance' && (
        <div className="space-y-4">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-xs">
              <span className="text-[11px] text-gray-500">Shopper Impressions</span>
              <p className="text-lg font-bold text-gray-900 mt-0.5">{performance.overview.totalImpressions.toLocaleString()}</p>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                <ArrowUpRight size={12} /> +18.4% vs last period
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-xs">
              <span className="text-[11px] text-gray-500">Inbound Leads (Clicks)</span>
              <p className="text-lg font-bold text-blue-600 mt-0.5">{performance.overview.totalClicks.toLocaleString()}</p>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                <ArrowUpRight size={12} /> +24.1% high intent
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-xs">
              <span className="text-[11px] text-gray-500">Click-Through Rate (CTR)</span>
              <p className="text-lg font-bold text-emerald-600 mt-0.5">{performance.overview.averageCTR}%</p>
              <span className="text-[10px] text-gray-400">Industry avg: 2.1%</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-xs">
              <span className="text-[11px] text-gray-500">Store Checkout Leads</span>
              <p className="text-lg font-bold text-orange-600 mt-0.5">{performance.overview.conversions}</p>
              <span className="text-[10px] text-orange-600 font-semibold">₦4.85M gross sales</span>
            </div>
          </div>

          {/* Daily Trend Table */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="p-3.5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-gray-900">Recent Daily Telemetry</h3>
              <span className="text-[11px] text-gray-400">Real-time click tracker</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Impressions</th>
                    <th className="py-2.5 px-3">Clicks</th>
                    <th className="py-2.5 px-3">CTR</th>
                    <th className="py-2.5 px-3">Ad Spend</th>
                    <th className="py-2.5 px-3 text-right">Orders / Leads</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {performance.dailyMetrics.map((day, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/80">
                      <td className="py-2.5 px-3 font-semibold text-gray-900">{day.date}</td>
                      <td className="py-2.5 px-3 text-gray-600">{day.impressions.toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-semibold text-blue-600">{day.clicks}</td>
                      <td className="py-2.5 px-3 text-emerald-600 font-medium">{day.ctr}%</td>
                      <td className="py-2.5 px-3 text-gray-700">{formatCurrency(day.cost)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-orange-600">{day.conversions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-xs">
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-3">Performance by Category</h3>
            <div className="space-y-2.5">
              {performance.categoryBreakdown.map((cat, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                  <div className="font-semibold text-gray-900">{cat.category}</div>
                  <div className="flex items-center gap-4 text-gray-600 text-[11px]">
                    <span>{cat.impressions.toLocaleString()} impressions</span>
                    <span className="font-bold text-blue-600">{cat.clicks} clicks</span>
                    <span className="text-emerald-600 font-semibold">{cat.ctr}% CTR</span>
                    <span className="text-gray-900 font-bold">{formatCurrency(cat.cost)} spent</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Demand */}
      {activeTab === 'demand' && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-gray-900">Highest Search Volume Buyer Queries</h3>
          <p className="text-xs text-gray-500">
            Products shoppers in your target delivery regions are actively comparing right now:
          </p>
          <div className="space-y-2">
            {[
              { query: 'Samsung S24 Ultra 512gb price in Nigeria', searches: '24,200', competition: 'High', cpc: '₦45' },
              { query: 'iPhone 15 Pro Max slot vs jumia price', searches: '18,900', competition: 'High', cpc: '₦50' },
              { query: 'MacBook Pro M3 Pro Lagos fast delivery', searches: '12,400', competition: 'Medium', cpc: '₦40' },
              { query: 'Sony WH-1000XM5 original warranty', searches: '8,100', competition: 'Low', cpc: '₦25' },
              { query: 'Hisense 55 inch 4K TV best deal today', searches: '15,600', competition: 'High', cpc: '₦35' },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-800 font-bold flex items-center justify-center text-[10px]">
                    #{idx + 1}
                  </span>
                  <span className="font-semibold text-gray-900">{item.query}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-gray-600">
                  <span>Monthly Searches: <strong className="text-gray-900">{item.searches}</strong></span>
                  <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-700 font-medium">{item.competition} Comp</span>
                  <span className="font-bold text-orange-600">CPC: {item.cpc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Competitor Insights */}
      {activeTab === 'insights' && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-gray-900">Competitor Price Indexing Status</h3>
          <p className="text-xs text-gray-500">
            How your store catalog prices compare against scraped market averages (Jumia, Konga, Slot):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
              <p className="text-emerald-800 font-bold text-sm">68 Products</p>
              <p className="text-emerald-700 font-semibold mt-0.5">Lowest Price Winner (Rank #1)</p>
              <p className="text-[11px] text-emerald-600 mt-1">Winning 72% of comparison clicks</p>
            </div>
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs">
              <p className="text-amber-800 font-bold text-sm">44 Products</p>
              <p className="text-amber-700 font-semibold mt-0.5">Competitive (Within 3% of Low)</p>
              <p className="text-[11px] text-amber-600 mt-1">Good conversion with CPC boost</p>
            </div>
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs">
              <p className="text-rose-800 font-bold text-sm">30 Products</p>
              <p className="text-rose-700 font-semibold mt-0.5">Above Market Average (&gt;5% higher)</p>
              <p className="text-[11px] text-rose-600 mt-1">Recommend discounting to win clicks</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreAnalyticsPage;
