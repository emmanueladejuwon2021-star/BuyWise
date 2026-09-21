import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { TrendingDown, TrendingUp, Calendar, Award } from 'lucide-react';

interface PriceDataPoint {
  date: string;
  [retailer: string]: number | string;
}

interface PriceChartProps {
  data: PriceDataPoint[];
  retailers: string[];
  currency?: string;
  allTimeLow?: { price: number; date: string };
  allTimeHigh?: { price: number; date: string };
  averagePrice?: number;
}

const RETAILER_COLORS: Record<string, string> = {
  jumia: '#F68B1E',
  konga: '#E31837',
  amazon: '#FF9900',
  aliexpress: '#FF4747',
  jiji: '#1DB954',
  slot: '#0066CC',
  payportmall: '#7B2D8E',
  ebay: '#E53238',
};

const PriceChart: React.FC<PriceChartProps> = ({
  data,
  retailers,
  currency = '₦',
  allTimeLow,
  allTimeHigh,
  averagePrice,
}) => {
  const [visibleRetailers, setVisibleRetailers] = useState<Set<string>>(new Set(retailers));
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '180d' | 'all'>('90d');

  // Filter data based on time range
  const filteredData = useMemo(() => {
    if (timeRange === 'all') return data;
    
    const days = timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 180;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    return data.filter(point => {
      const pointDate = new Date(point.date);
      return pointDate >= cutoff;
    });
  }, [data, timeRange]);

  const toggleRetailer = (retailer: string) => {
    setVisibleRetailers(prev => {
      const next = new Set(prev);
      if (next.has(retailer)) {
        next.delete(retailer);
      } else {
        next.add(retailer);
      }
      return next;
    });
  };

  const formatPrice = (value: number) => {
    if (currency === '₦') {
      if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `₦${(value / 1000).toFixed(0)}k`;
      return `₦${value}`;
    }
    return `$${value}`;
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <p className="text-gray-500">No price history available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Price History</h3>
          <p className="text-sm text-gray-500">Track price changes across stores</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(['30d', '90d', '180d', 'all'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                timeRange === range
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : range === '180d' ? '180 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {allTimeLow && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown size={14} className="text-green-600" />
              <span className="text-xs text-green-700 font-medium">All-Time Low</span>
            </div>
            <p className="text-lg font-bold text-green-900">{formatPrice(allTimeLow.price)}</p>
            <p className="text-xs text-green-600">{new Date(allTimeLow.date).toLocaleDateString()}</p>
          </div>
        )}
        
        {allTimeHigh && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-red-600" />
              <span className="text-xs text-red-700 font-medium">All-Time High</span>
            </div>
            <p className="text-lg font-bold text-red-900">{formatPrice(allTimeHigh.price)}</p>
            <p className="text-xs text-red-600">{new Date(allTimeHigh.date).toLocaleDateString()}</p>
          </div>
        )}
        
        {averagePrice && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={14} className="text-blue-600" />
              <span className="text-xs text-blue-700 font-medium">Average</span>
            </div>
            <p className="text-lg font-bold text-blue-900">{formatPrice(averagePrice)}</p>
            <p className="text-xs text-blue-600">Over selected period</p>
          </div>
        )}
        
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Award size={14} className="text-purple-600" />
            <span className="text-xs text-purple-700 font-medium">Data Points</span>
          </div>
          <p className="text-lg font-bold text-purple-900">{filteredData.length}</p>
          <p className="text-xs text-purple-600">Price records</p>
        </div>
      </div>

      {/* Retailer Toggles */}
      <div className="flex flex-wrap gap-2 mb-4">
        {retailers.map(retailer => (
          <button
            key={retailer}
            onClick={() => toggleRetailer(retailer)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              visibleRetailers.has(retailer)
                ? 'border-transparent text-white'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
            style={{
              backgroundColor: visibleRetailers.has(retailer) ? RETAILER_COLORS[retailer] || '#6366f1' : 'transparent'
            }}
          >
            {retailer.charAt(0).toUpperCase() + retailer.slice(1)}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11 }} 
              stroke="#9ca3af"
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }}
            />
            <YAxis 
              tick={{ fontSize: 11 }} 
              stroke="#9ca3af"
              tickFormatter={formatPrice}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number, name: string) => [
                formatPrice(value),
                name.charAt(0).toUpperCase() + name.slice(1)
              ]}
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                });
              }}
            />
            <Legend />
            
            {/* Reference line for average price */}
            {averagePrice && (
              <ReferenceLine 
                y={averagePrice} 
                stroke="#6366f1" 
                strokeDasharray="5 5"
                label={{ value: 'Average', position: 'right', fill: '#6366f1', fontSize: 11 }}
              />
            )}
            
            {/* Price lines for each retailer */}
            {retailers.map(retailer => (
              visibleRetailers.has(retailer) && (
                <Line
                  key={retailer}
                  type="monotone"
                  dataKey={retailer}
                  name={retailer.charAt(0).toUpperCase() + retailer.slice(1)}
                  stroke={RETAILER_COLORS[retailer] || '#6366f1'}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2 }}
                  connectNulls={true}
                />
              )
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Note */}
      <p className="text-xs text-gray-400 mt-4 text-center">
        Prices are updated every 15 minutes. Historical data may have gaps due to scraping limitations.
      </p>
    </div>
  );
};

export default PriceChart;
