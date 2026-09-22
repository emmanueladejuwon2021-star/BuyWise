import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Bell, Clock, ExternalLink, Settings, MapPin, Trash2, TrendingDown, Eye, ChevronRight, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { products, getBestDeal } from '../data/products';

const DashboardPage: React.FC = () => {
  const { user, isAuthenticated, removeFromWatchlist, removePriceAlert, updatePreferences, updateNotificationSettings } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<'overview' | 'watchlist' | 'alerts' | 'history' | 'settings'>('overview');

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye size={28} className="text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to access your dashboard</h2>
          <p className="text-gray-500 mb-6">Track prices, manage alerts, and view your shopping history</p>
          <Link to="/login" className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-full hover:opacity-90 transition-opacity">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const watchlistProducts = products.filter(p => user.watchlist.includes(p.id));
  const formatPrice = (price: number, currency: string) => {
    if (currency === '₦') return `₦${price.toLocaleString()}`;
    return `$${price.toLocaleString()}`;
  };

  const sections = [
    { key: 'overview', label: 'Overview', icon: Eye },
    { key: 'watchlist', label: 'Watchlist', icon: Heart },
    { key: 'alerts', label: 'Price Alerts', icon: Bell },
    { key: 'history', label: 'Click History', icon: Clock },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Dashboard Header */}
        <div className="mb-4 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white text-base sm:text-xl font-bold shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight">Welcome back, {user.name}!</h1>
              <p className="text-xs sm:text-sm text-gray-500">Manage your watchlist, alerts, and preferences</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mb-4 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-5">
            <Heart size={16} className="text-red-500 mb-1 sm:mb-2" />
            <p className="text-lg sm:text-2xl font-bold text-gray-900">{user.watchlist.length}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">Items Watched</p>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-5">
            <Bell size={16} className="text-indigo-500 mb-1 sm:mb-2" />
            <p className="text-lg sm:text-2xl font-bold text-gray-900">{user.priceAlerts.length}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">Active Alerts</p>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-5">
            <Clock size={16} className="text-green-500 mb-1 sm:mb-2" />
            <p className="text-lg sm:text-2xl font-bold text-gray-900">{user.clickHistory.length}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">Stores Visited</p>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-5">
            <TrendingDown size={16} className="text-purple-500 mb-1 sm:mb-2" />
            <p className="text-lg sm:text-2xl font-bold text-gray-900">₦{(user.clickHistory.length * 15000).toLocaleString()}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">Estimated Savings</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto pb-1 scrollbar-none">
          {sections.map(section => (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key as typeof activeSection)}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                activeSection === section.key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'
              }`}
            >
              <section.icon size={14} />
              {section.label}
            </button>
          ))}
        </div>

        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Recent Watchlist Items */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3.5 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-sm sm:text-base font-bold text-gray-900">Recently Watched</h3>
                <button onClick={() => setActiveSection('watchlist')} className="text-xs sm:text-sm text-indigo-600 font-medium flex items-center gap-0.5">
                  View All <ChevronRight size={13} />
                </button>
              </div>
              {watchlistProducts.length === 0 ? (
                <p className="text-xs sm:text-sm text-gray-500">No items in your watchlist yet. <Link to="/" className="text-indigo-600 hover:underline">Browse products</Link></p>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {watchlistProducts.slice(0, 3).map(product => {
                    const { listing } = getBestDeal(product);
                    return (
                      <Link key={product.id} to={`/product/${product.id}`} className="flex items-center gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors">
                        <img src={product.images[0]} alt={product.name} className="w-11 h-11 sm:w-14 sm:h-14 rounded-lg object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{product.name}</p>
                          <p className="text-[10px] sm:text-xs text-gray-500">Best: {formatPrice(listing.price, listing.currency)} at {listing.store.name}</p>
                        </div>
                        <ChevronRight size={14} className="text-gray-400 shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Click History */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3.5 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-sm sm:text-base font-bold text-gray-900">Recent Store Visits</h3>
                <button onClick={() => setActiveSection('history')} className="text-xs sm:text-sm text-indigo-600 font-medium flex items-center gap-0.5">
                  View All <ChevronRight size={13} />
                </button>
              </div>
              {user.clickHistory.length === 0 ? (
                <p className="text-xs sm:text-sm text-gray-500">No store visits yet. Click "Buy Now" on any product to start tracking.</p>
              ) : (
                <div className="space-y-2">
                  {user.clickHistory.slice(0, 3).map(log => (
                    <div key={log.id} className="flex items-center gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gray-50">
                      <ExternalLink size={14} className="text-indigo-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{log.productName}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500">→ {log.storeName} • {formatPrice(log.price, log.currency)} • {new Date(log.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Watchlist Section */}
        {activeSection === 'watchlist' && (
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3.5 sm:p-6">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3 sm:mb-4">My Watchlist ({watchlistProducts.length} items)</h3>
            {watchlistProducts.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Heart size={36} className="mx-auto text-gray-300 mb-2" />
                <p className="text-xs sm:text-sm text-gray-500 mb-3">Your watchlist is empty</p>
                <Link to="/" className="px-4 py-2 bg-indigo-600 text-white rounded-full text-xs sm:text-sm font-medium">Browse Products</Link>
              </div>
            ) : (
              <div className="space-y-2.5 sm:space-y-3">
                {watchlistProducts.map(product => {
                  const { listing, savings } = getBestDeal(product);
                  return (
                    <div key={product.id} className="flex flex-row gap-3 p-2.5 sm:p-4 border border-gray-100 rounded-xl hover:shadow-sm transition-all">
                      <Link to={`/product/${product.id}`} className="shrink-0">
                        <img src={product.images[0]} alt={product.name} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${product.id}`} className="font-semibold text-gray-900 text-xs sm:text-sm hover:text-indigo-600 transition-colors line-clamp-1">
                          {product.name}
                        </Link>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 truncate">
                          Best: <strong className="text-green-600">{formatPrice(listing.totalCost, listing.currency)}</strong> at {listing.store.name}
                          {listing.shippingCost === 0 && ' (free ship)'}
                        </p>
                        {savings > 0 && (
                          <p className="text-[10px] sm:text-xs text-green-600 mt-0.5 flex items-center gap-1">
                            <TrendingDown size={11} /> Save up to {formatPrice(savings, listing.currency)}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Link to={`/product/${product.id}`} className="px-2.5 py-1 bg-indigo-600 text-white text-[11px] sm:text-xs font-medium rounded-lg hover:bg-indigo-700">
                            Compare
                          </Link>
                          <button
                            onClick={() => { removeFromWatchlist(product.id); addToast('Removed from watchlist', 'info'); }}
                            className="p-1 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors"
                            title="Remove from watchlist"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Price Alerts Section */}
        {activeSection === 'alerts' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Price Alerts ({user.priceAlerts.length} active)</h3>
            {user.priceAlerts.length === 0 ? (
              <div className="text-center py-12">
                <Bell size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">No price alerts set</p>
                <p className="text-sm text-gray-400 mb-4">Visit any product page and click "Price Alert" to get started</p>
                <Link to="/" className="px-6 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium">Browse Products</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {user.priceAlerts.map(alert => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${alert.active ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <Bell size={18} className={alert.active ? 'text-green-600' : 'text-gray-400'} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{alert.productName}</p>
                        <p className="text-xs text-gray-500">
                          Alert when {alert.alertType === 'below-price' ? `below ${formatPrice(alert.targetPrice, '₦')}` :
                           alert.alertType === 'percentage-drop' ? `${alert.percentageThreshold}% drop` : 'any price drop'}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Channels: {alert.channels.join(', ')} • Created {new Date(alert.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => { removePriceAlert(alert.id); addToast('Price alert removed', 'info'); }}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                      title="Remove alert"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Click History Section */}
        {activeSection === 'history' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Outbound Click History ({user.clickHistory.length})</h3>
            {user.clickHistory.length === 0 ? (
              <div className="text-center py-12">
                <Clock size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">No clicks recorded yet</p>
                <p className="text-sm text-gray-400">Your store visits will appear here for tracking</p>
              </div>
            ) : (
              <div className="space-y-2">
                {user.clickHistory.map(log => (
                  <div key={log.id} className="flex items-center gap-4 p-3 border border-gray-50 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                      <ExternalLink size={14} className="text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{log.productName}</p>
                      <p className="text-xs text-gray-500">
                        → {log.storeName} • {formatPrice(log.price, log.currency)} • via {log.source}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleDateString()}</p>
                      <p className="text-[10px] text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Section */}
        {activeSection === 'settings' && (
          <div className="space-y-6">
            {/* Location Preferences */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-indigo-600" /> Delivery Location
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default City</label>
                  <input
                    type="text"
                    value={user.preferences.defaultCity}
                    onChange={(e) => updatePreferences({ defaultCity: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={user.preferences.defaultState}
                    onChange={(e) => updatePreferences({ defaultState: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Bell size={20} className="text-indigo-600" /> Notification Preferences
              </h3>
              <div className="space-y-4">
                {[
                  { key: 'emailEnabled', label: 'Email Notifications', desc: 'Receive alerts via email' },
                  { key: 'smsEnabled', label: 'SMS Notifications', desc: 'Receive alerts via text message' },
                  { key: 'pushEnabled', label: 'Push Notifications', desc: 'Browser push notifications' },
                  { key: 'priceDropAlerts', label: 'Price Drop Alerts', desc: 'Get notified when watched items drop in price' },
                  { key: 'dealAlerts', label: 'Deal Alerts', desc: 'Get notified about flash sales and deals' },
                  { key: 'backInStockAlerts', label: 'Back in Stock', desc: 'Get notified when out-of-stock items return' },
                ].map(setting => (
                  <div key={setting.key} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{setting.label}</p>
                      <p className="text-xs text-gray-500">{setting.desc}</p>
                    </div>
                    <button
                      onClick={() => updateNotificationSettings({ [setting.key]: !user.notificationSettings[setting.key as keyof typeof user.notificationSettings] })}
                      className="shrink-0"
                    >
                      {user.notificationSettings[setting.key as keyof typeof user.notificationSettings] ? (
                        <ToggleRight size={28} className="text-indigo-600" />
                      ) : (
                        <ToggleLeft size={28} className="text-gray-300" />
                      )}
                    </button>
                  </div>
                ))}
                <div className="pt-4 border-t">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Digest Frequency</label>
                  <select
                    value={user.notificationSettings.emailFrequency}
                    onChange={(e) => updateNotificationSettings({ emailFrequency: e.target.value as 'instant' | 'daily' | 'weekly' })}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500"
                  >
                    <option value="instant">Instant</option>
                    <option value="daily">Daily Digest</option>
                    <option value="weekly">Weekly Summary</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Account Information</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-500">Name</span>
                  <span className="text-sm font-medium text-gray-900">{user.name}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-500">Email</span>
                  <span className="text-sm font-medium text-gray-900">{user.email}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-500">Member Since</span>
                  <span className="text-sm font-medium text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
