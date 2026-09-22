import React, { useState } from 'react';
import { BarChart3, TrendingUp, Download, Eye, Globe2, ShieldCheck, ArrowUpRight, Filter, PieChart, Layers } from 'lucide-react';
import { useRegion } from '../context/RegionContext';
import { useToast } from '../context/ToastContext';

const MarketIntelligencePage: React.FC = () => {
  const { currentRegion, formatPrice } = useRegion();
  const { addToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const categories = ['All', 'Phones & Tablets', 'Computing', 'Electronics', 'Home & Kitchen', 'Fashion'];

  const retailerBenchmarks = [
    { store: 'Jumia Nigeria', marketSharePct: 38, avgPriceIndex: 101.4, fulfillmentScore: '89%', clickVolume: '412,000' },
    { store: 'Konga', marketSharePct: 24, avgPriceIndex: 98.7, fulfillmentScore: '92%', clickVolume: '289,000' },
    { store: 'Slot Nigeria', marketSharePct: 16, avgPriceIndex: 103.1, fulfillmentScore: '96%', clickVolume: '194,000' },
    { store: 'Amazon (Ship to NG)', marketSharePct: 9, avgPriceIndex: 112.5, fulfillmentScore: '95%', clickVolume: '105,000' },
    { store: 'Pointek', marketSharePct: 8, avgPriceIndex: 99.2, fulfillmentScore: '91%', clickVolume: '88,000' },
    { store: 'Others / Local Direct', marketSharePct: 5, avgPriceIndex: 97.4, fulfillmentScore: '86%', clickVolume: '54,000' },
  ];

  const topSearchedTerms = [
    { rank: 1, term: 'iPhone 15 Pro Max 256GB', searchVolume: '142,500', avgPriceNGN: 1850000, priceSpread: '14.2%', conversionRate: '4.8%' },
    { rank: 2, term: 'Samsung Galaxy S24 Ultra', searchVolume: '98,200', avgPriceNGN: 1680000, priceSpread: '11.8%', conversionRate: '3.9%' },
    { rank: 3, term: 'MacBook Air M2 8GB/256GB', searchVolume: '84,100', avgPriceNGN: 1350000, priceSpread: '16.5%', conversionRate: '5.2%' },
    { rank: 4, term: 'Hisense 58 inch 4K Smart TV', searchVolume: '76,900', avgPriceNGN: 420000, priceSpread: '18.9%', conversionRate: '6.4%' },
    { rank: 5, term: 'PlayStation 5 Digital Edition', searchVolume: '63,400', avgPriceNGN: 720000, priceSpread: '9.4%', conversionRate: '5.7%' },
    { rank: 6, term: 'Apple AirPods Pro (2nd Gen)', searchVolume: '52,800', avgPriceNGN: 295000, priceSpread: '12.1%', conversionRate: '7.1%' },
  ];

  const regionalDemand = [
    { city: 'Lagos', share: 54, growth: '+18%', topCategory: 'Smartphones & Laptops' },
    { city: 'Abuja (FCT)', share: 22, growth: '+24%', topCategory: 'Home Appliances & TVs' },
    { city: 'Port Harcourt', share: 13, growth: '+12%', topCategory: 'Electronics & Audio' },
    { city: 'Ibadan / Oyo', share: 6, growth: '+15%', topCategory: 'Budget Smartphones' },
    { city: 'Kano / Northern Hub', share: 5, growth: '+9%', topCategory: 'Mobile Accessories' },
  ];

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Rank,Product Name,Monthly Searches,Average Price (NGN),Price Difference,Purchases Made\n"
      + topSearchedTerms.map(e => `${e.rank},"${e.term}",${e.searchVolume},${e.avgPriceNGN},${e.priceSpread},${e.conversionRate}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pricewise_shopping_trends_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Shopping trends report downloaded successfully!', 'success');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-bold mb-2">
              <BarChart3 size={14} className="text-indigo-600" />
              <span>SHOPPING INSIGHTS & PRICE TRENDS</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-gray-900">
              Online Shopping Price Trends & Store Comparisons
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Live tracking of product prices across verified stores, popular items shoppers look for, and real price differences.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-white border border-gray-200 hover:border-indigo-300 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Download size={14} />
              <span>Download Report (CSV)</span>
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-gray-100 shadow-xs">
            <div className="flex items-center justify-between text-gray-400 mb-1">
              <span className="text-xs font-medium">Monthly Searches</span>
              <Eye size={16} className="text-indigo-500" />
            </div>
            <p className="text-lg sm:text-2xl font-bold text-gray-900">1,142,000</p>
            <p className="text-[10px] text-green-600 flex items-center gap-0.5 mt-0.5 font-medium">
              <TrendingUp size={11} /> +22.4% vs last month
            </p>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-gray-100 shadow-xs">
            <div className="flex items-center justify-between text-gray-400 mb-1">
              <span className="text-xs font-medium">Average Price Difference</span>
              <PieChart size={16} className="text-purple-500" />
            </div>
            <p className="text-lg sm:text-2xl font-bold text-gray-900">14.8%</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Gap between lowest & highest store</p>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-gray-100 shadow-xs">
            <div className="flex items-center justify-between text-gray-400 mb-1">
              <span className="text-xs font-medium">Shoppers Visiting Stores</span>
              <ArrowUpRight size={16} className="text-emerald-500" />
            </div>
            <p className="text-lg sm:text-2xl font-bold text-gray-900">7.2%</p>
            <p className="text-[10px] text-green-600 mt-0.5 font-medium">Over 3x regular web average</p>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl p-4 border border-gray-100 shadow-xs">
            <div className="flex items-center justify-between text-gray-400 mb-1">
              <span className="text-xs font-medium">Tracked Products</span>
              <Layers size={16} className="text-blue-500" />
            </div>
            <p className="text-lg sm:text-2xl font-bold text-gray-900">128,450</p>
            <p className="text-[10px] text-blue-600 mt-0.5 font-medium">Checked every 30 minutes</p>
          </div>
        </div>

        {/* Retailer Benchmarks Table */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 mb-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900">Store Price Comparison & Delivery Ratings</h3>
              <p className="text-xs text-gray-500">Price level guide: 100 is typical market price. Numbers below 100 mean cheaper than average.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Store Name</th>
                  <th className="py-2.5 px-3">Shopper Share</th>
                  <th className="py-2.5 px-3">Price Level</th>
                  <th className="py-2.5 px-3">Delivery Success</th>
                  <th className="py-2.5 px-3">Monthly Store Visits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {retailerBenchmarks.map((retailer, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-gray-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      {retailer.store}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full"
                            style={{ width: `${retailer.marketSharePct * 2}%` }}
                          ></div>
                        </div>
                        <span className="font-medium text-gray-700">{retailer.marketSharePct}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-semibold ${
                          retailer.avgPriceIndex < 100 ? 'text-green-600' : 'text-amber-700'
                        }`}
                      >
                        {retailer.avgPriceIndex < 100 ? `${retailer.avgPriceIndex} (Cheaper)` : `${retailer.avgPriceIndex} (Higher)`}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-gray-700">{retailer.fulfillmentScore}</td>
                    <td className="py-3 px-3 text-gray-600 font-mono text-xs">{retailer.clickVolume}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Searched Queries & Price Disparity */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-xs">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">Most Searched Items</h3>
            <p className="text-xs text-gray-500 mb-4">What shoppers search for most and how much prices vary across stores</p>

            <div className="space-y-3">
              {topSearchedTerms.map(item => (
                <div key={item.rank} className="p-3 bg-gray-50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                      #{item.rank}
                    </span>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-900">{item.term}</p>
                      <p className="text-[11px] text-gray-500">
                        Searches: {item.searchVolume} • Avg Price: {formatPrice(item.avgPriceNGN, '₦')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:text-right">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-medium">Price Difference</p>
                      <p className="text-xs font-bold text-purple-700">{item.priceSpread}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-medium">Purchases</p>
                      <p className="text-xs font-bold text-green-600">{item.conversionRate}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Demand Distribution */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-xs">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1 flex items-center gap-1.5">
              <Globe2 size={16} className="text-indigo-600" />
              <span>Where Shoppers Are Located</span>
            </h3>
            <p className="text-xs text-gray-500 mb-4">Where shopping searches come from across major cities</p>

            <div className="space-y-3">
              {regionalDemand.map((region, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-gray-800">{region.city}</span>
                    <span className="text-indigo-600 font-bold">{region.share}% ({region.growth})</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full"
                      style={{ width: `${region.share}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-gray-400">Most Popular: {region.topCategory}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-3 bg-indigo-50 rounded-xl text-[11px] text-indigo-900">
              <p className="font-semibold mb-0.5 flex items-center gap-1">
                <ShieldCheck size={13} className="text-indigo-600" />
                Privacy & Data Protection
              </p>
              <span>All shopping trends are grouped together anonymously to protect user privacy in line with national data protection standards.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketIntelligencePage;
