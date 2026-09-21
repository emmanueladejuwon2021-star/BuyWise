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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Watchlist</h1>
          <p className="text-gray-500">Track prices and get notified when they drop</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Total Items</span>
                <Heart size={20} className="text-indigo-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.activeItems} active</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Total Savings</span>
                <TrendingDown size={20} className="text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalSavings)}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.averageSavingsPercentage.toFixed(1)}% avg</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">At All-Time Low</span>
                <Award size={20} className="text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.itemsAtAllTimeLow}</p>
              <p className="text-xs text-gray-500 mt-1">Best time to buy!</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Active Alerts</span>
                <Bell size={20} className="text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.itemsWithAlerts}</p>
              <p className="text-xs text-gray-500 mt-1">Watching for drops</p>
            </div>
          </div>
        )}

        {/* Watchlist Items */}
        {watchlistItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Heart size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your watchlist is empty</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Start adding products to track their prices. We'll notify you when prices drop!
            </p>
            <Link to="/" className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-full hover:opacity-90 transition-opacity">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {watchlistItems.map(item => (
              <div key={item._id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Product Image */}
                  <Link to={`/product/${item.masterProductId}`} className="shrink-0">
                    <img
                      src={item.productImage || 'https://via.placeholder.com/150'}
                      alt={item.productName}
                      className="w-full md:w-32 h-32 object-cover rounded-xl"
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <Link to={`/product/${item.masterProductId}`} className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                          {item.productName}
                        </Link>
                        {isAtAllTimeLow(item) && (
                          <span className="inline-flex items-center gap-1 ml-2 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                            <Award size={12} /> All-Time Low!
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(item._id, item.isActive)}
                          className={`p-2 rounded-lg transition-colors ${
                            item.isActive
                              ? 'bg-green-100 text-green-600 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                          title={item.isActive ? 'Pause alerts' : 'Activate alerts'}
                        >
                          <Bell size={18} />
                        </button>
                        <button
                          onClick={() => setShowSettings(showSettings === item._id ? null : item._id)}
                          className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                          title="Alert settings"
                        >
                          <Settings size={18} />
                        </button>
                        <button
                          onClick={() => handleRemove(item._id)}
                          className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                          title="Remove from watchlist"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Price Comparison */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Initial Price</p>
                        <p className="text-sm font-medium text-gray-600 line-through">
                          {formatPrice(item.initialPrice)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Current Lowest</p>
                        <p className="text-lg font-bold text-gray-900">
                          {formatPrice(item.currentLowestPrice)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">All-Time Low</p>
                        <p className="text-sm font-medium text-green-600">
                          {formatPrice(item.allTimeLow)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">You Save</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatPrice(item.totalSavings)}
                          <span className="text-xs ml-1">({item.savingsPercentage.toFixed(1)}%)</span>
                        </p>
                      </div>
                    </div>

                    {/* Alert Settings */}
                    {showSettings === item._id && (
                      <div className="bg-gray-50 rounded-xl p-4 mb-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Alert Settings</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Alert Type</p>
                            <p className="text-sm font-medium text-gray-900 capitalize">
                              {item.alertType === 'absolute' && `Below ${formatPrice(item.targetPrice || 0)}`}
                              {item.alertType === 'percentage' && `${item.targetPercentageDrop}% drop`}
                              {item.alertType === 'any' && 'Any price drop'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Notification Channels</p>
                            <div className="flex gap-2">
                              {item.channels.map(channel => (
                                <span key={channel} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded">
                                  {channel}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        {item.lastTriggeredAt && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500">
                              Last alert: {new Date(item.lastTriggeredAt).toLocaleDateString()} at {new Date(item.lastTriggeredAt).toLocaleTimeString()}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/product/${item.masterProductId}`}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        View Product
                      </Link>
                      <Link
                        to={`/product/${item.masterProductId}?tab=history`}
                        className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <Eye size={16} /> Price History
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
