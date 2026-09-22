import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Bell, Trash2, TrendingDown, TrendingUp, Award, AlertCircle, Settings, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

interface WatchlistItem {
  _id: string;
  masterProductId: string;
  productName: string;
  productImage: string;
  targetPrice?: number;
  targetPercentageDrop?: number;
  alertType: 'absolute' | 'percentage' | 'any';
  channels: ('email' | 'sms' | 'push')[];
  isActive: boolean;
  initialPrice: number;
  currentLowestPrice: number;
  allTimeLow: number;
  allTimeLowDate?: string;
  lastTriggeredAt?: string;
  totalSavings: number;
  savingsPercentage: number;
}

interface WatchlistStats {
  totalItems: number;
  activeItems: number;
  totalSavings: number;
  averageSavingsPercentage: number;
  itemsAtAllTimeLow: number;
  itemsWithAlerts: number;
}

const WatchlistPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [stats, setStats] = useState<WatchlistStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWatchlist();
      fetchStats();
    }
  }, [isAuthenticated]);

  const fetchWatchlist = async () => {
    try {
      const response = await api.getWatchlist();
      setWatchlistItems(response.data);
    } catch (error) {
      addToast('Failed to load watchlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.getWatchlistStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleRemove = async (watchlistId: string) => {
    try {
      await api.removeFromWatchlist(watchlistId);
      setWatchlistItems(items => items.filter(item => item._id !== watchlistId));
      addToast('Removed from watchlist', 'success');
      fetchStats();
    } catch (error) {
      addToast('Failed to remove from watchlist', 'error');
    }
  };

  const handleToggleActive = async (watchlistId: string, isActive: boolean) => {
    try {
      await api.updateWatchlistItem(watchlistId, { isActive: !isActive });
      setWatchlistItems(items =>
        items.map(item =>
          item._id === watchlistId ? { ...item, isActive: !isActive } : item
        )
      );
      addToast(isActive ? 'Alerts paused' : 'Alerts activated', 'success');
    } catch (error) {
      addToast('Failed to update alert status', 'error');
    }
  };

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  const isAtAllTimeLow = (item: WatchlistItem) => {
    return item.currentLowestPrice === item.allTimeLow;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Heart size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view your watchlist</h2>
          <p className="text-gray-500 mb-6">Track prices and get alerts on your favorite products</p>
          <Link to="/login" className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-full hover:opacity-90 transition-opacity">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1">My Watchlist</h1>
          <p className="text-xs sm:text-sm text-gray-500">Track prices and get notified when they drop</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mb-4 sm:mb-8">
            <div className="bg-white rounded-xl p-3 sm:p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <span className="text-xs sm:text-sm text-gray-500">Total Items</span>
                <Heart size={16} className="text-indigo-600 sm:w-5 sm:h-5" />
              </div>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalItems}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{stats.activeItems} active</p>
            </div>

            <div className="bg-white rounded-xl p-3 sm:p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <span className="text-xs sm:text-sm text-gray-500">Total Savings</span>
                <TrendingDown size={16} className="text-green-600 sm:w-5 sm:h-5" />
              </div>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{formatPrice(stats.totalSavings)}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{stats.averageSavingsPercentage.toFixed(1)}% avg</p>
            </div>

            <div className="bg-white rounded-xl p-3 sm:p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <span className="text-xs sm:text-sm text-gray-500">All-Time Low</span>
                <Award size={16} className="text-yellow-600 sm:w-5 sm:h-5" />
              </div>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.itemsAtAllTimeLow}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Best time to buy!</p>
            </div>

            <div className="bg-white rounded-xl p-3 sm:p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <span className="text-xs sm:text-sm text-gray-500">Active Alerts</span>
                <Bell size={16} className="text-purple-600 sm:w-5 sm:h-5" />
              </div>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.itemsWithAlerts}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Watching for drops</p>
            </div>
          </div>
        )}

        {/* Watchlist Items */}
        {watchlistItems.length === 0 ? (
          <div className="text-center py-12 sm:py-20 bg-white rounded-2xl border border-gray-100 px-4">
            <Heart size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-base sm:text-xl font-semibold text-gray-900 mb-1.5">Your watchlist is empty</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-5 max-w-md mx-auto">
              Start adding products to track their prices. We'll notify you when prices drop!
            </p>
            <Link to="/" className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs sm:text-sm font-medium rounded-full hover:opacity-90 transition-opacity">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {watchlistItems.map(item => (
              <div key={item._id} className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-5">
                  {/* Product Image */}
                  <Link to={`/product/${item.masterProductId}`} className="shrink-0 self-center sm:self-start">
                    <img
                      src={item.productImage || 'https://via.placeholder.com/150'}
                      alt={item.productName}
                      className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-lg sm:rounded-xl"
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                      <div className="min-w-0 flex-1">
                        <Link to={`/product/${item.masterProductId}`} className="text-sm sm:text-base font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1">
                          {item.productName}
                        </Link>
                        {isAtAllTimeLow(item) && (
                          <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-medium rounded-full">
                            <Award size={10} /> All-Time Low!
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                        <button
                          onClick={() => handleToggleActive(item._id, item.isActive)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            item.isActive
                              ? 'bg-green-100 text-green-600 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                          title={item.isActive ? 'Pause alerts' : 'Activate alerts'}
                        >
                          <Bell size={15} />
                        </button>
                        <button
                          onClick={() => setShowSettings(showSettings === item._id ? null : item._id)}
                          className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                          title="Alert settings"
                        >
                          <Settings size={15} />
                        </button>
                        <button
                          onClick={() => handleRemove(item._id)}
                          className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                          title="Remove from watchlist"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Price Comparison */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3 bg-gray-50/70 rounded-lg p-2 sm:p-2.5">
                      <div>
                        <p className="text-[10px] text-gray-500">Initial</p>
                        <p className="text-xs font-medium text-gray-500 line-through">
                          {formatPrice(item.initialPrice)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500">Current</p>
                        <p className="text-xs sm:text-sm font-bold text-gray-900">
                          {formatPrice(item.currentLowestPrice)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500">Lowest</p>
                        <p className="text-xs sm:text-sm font-medium text-green-600">
                          {formatPrice(item.allTimeLow)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500">Savings</p>
                        <p className="text-xs sm:text-sm font-bold text-green-600">
                          {formatPrice(item.totalSavings)}
                          <span className="text-[9px] ml-0.5">({item.savingsPercentage.toFixed(0)}%)</span>
                        </p>
                      </div>
                    </div>

                    {/* Alert Settings */}
                    {showSettings === item._id && (
                      <div className="bg-gray-50 rounded-lg p-2.5 sm:p-3 mb-3 text-xs border border-gray-100">
                        <h4 className="text-xs font-semibold text-gray-900 mb-2">Alert Settings</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <p className="text-[10px] text-gray-500">Alert Type</p>
                            <p className="text-xs font-medium text-gray-900 capitalize">
                              {item.alertType === 'absolute' && `Below ${formatPrice(item.targetPrice || 0)}`}
                              {item.alertType === 'percentage' && `${item.targetPercentageDrop}% drop`}
                              {item.alertType === 'any' && 'Any price drop'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500">Channels</p>
                            <div className="flex gap-1 mt-0.5">
                              {item.channels.map(channel => (
                                <span key={channel} className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-medium rounded">
                                  {channel}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/product/${item.masterProductId}`}
                        className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        View Product
                      </Link>
                      <Link
                        to={`/product/${item.masterProductId}?tab=history`}
                        className="px-3 py-1.5 border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                      >
                        <Eye size={13} /> History
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchlistPage;
