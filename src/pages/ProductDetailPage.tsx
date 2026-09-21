import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, Share2, Bell, ExternalLink, Truck, Shield, Clock, ChevronDown, ChevronUp, Check, TrendingDown, AlertCircle, Eye, Zap, BarChart3, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { products, stores, getBestDeal, getBestValueScore } from '../data/products';
import { useAuth } from '../context/AuthContext';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const product = products.find(p => p.id === id);
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, isAuthenticated, addClickLog } = useAuth();
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const [activeTab, setActiveTab] = useState<'prices' | 'history' | 'specs' | 'reviews'>('prices');
  const [sortBy, setSortBy] = useState<'total-cost' | 'price' | 'rating' | 'delivery' | 'best-value'>('total-cost');
  const [historyRange, setHistoryRange] = useState<30 | 90 | 180>(90);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <Link to="/" className="text-indigo-600 font-medium hover:underline">Go Home</Link>
        </div>
      </div>
    );
  }

  const { listing: bestListing, savings } = getBestDeal(product);
  const inWatchlist = isInWatchlist(product.id);
  const avgRating = product.ratings.reduce((sum, r) => sum + r.rating, 0) / product.ratings.length;

  const sortedListings = useMemo(() => {
    return [...product.listings].sort((a, b) => {
      switch (sortBy) {
        case 'total-cost': {
          const aTotal = a.currency === '₦' ? a.totalCost : a.totalCost * 1500;
          const bTotal = b.currency === '₦' ? b.totalCost : b.totalCost * 1500;
          return aTotal - bTotal;
        }
        case 'price': {
          const aPrice = a.currency === '₦' ? a.price : a.price * 1500;
          const bPrice = b.currency === '₦' ? b.price : b.price * 1500;
          return aPrice - bPrice;
        }
        case 'rating': return b.rating - a.rating;
        case 'delivery': return parseInt(a.deliveryDays) - parseInt(b.deliveryDays);
        case 'best-value': return getBestValueScore(b) - getBestValueScore(a);
        default: return 0;
      }
    });
  }, [product.listings, sortBy]);

  // Price history chart data
  const chartData = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - historyRange);
    
    const storeIds = [...new Set(product.priceHistory.map(p => p.storeId))];
    const dateMap = new Map<string, Record<string, number>>();
    
    product.priceHistory
      .filter(entry => new Date(entry.date) >= cutoff)
      .forEach(entry => {
        if (!dateMap.has(entry.date)) dateMap.set(entry.date, {});
        const dateEntry = dateMap.get(entry.date)!;
        const normalizedPrice = entry.currency === '$' ? entry.price * 1500 : entry.price;
        dateEntry[entry.storeId] = normalizedPrice;
      });
    
    return Array.from(dateMap.entries())
      .map(([date, storePrices]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ...storePrices,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [product.priceHistory, historyRange]);

  const formatPrice = (price: number, currency: string) => {
    if (currency === '₦') return `₦${price.toLocaleString()}`;
    return `$${price.toLocaleString()}`;
  };

  const specs = Object.entries(product.specifications);
  const visibleSpecs = showAllSpecs ? specs : specs.slice(0, 6);

  const handleAffiliateClick = (listing: typeof product.listings[0]) => {
    // Log the click for affiliate tracking
    if (isAuthenticated) {
      addClickLog({
        productId: product.id,
        productName: product.name,
        storeId: listing.store.id,
        storeName: listing.store.name,
        source: activeTab === 'prices' ? 'comparison-table' : 'best-price-cta',
        price: listing.price,
        currency: listing.currency,
      });
    }
    // In production: window.location.href = listing.affiliateUrl;
    alert(`🔄 Redirecting to ${listing.store.name}...\n\n📋 Click tracked:\n• Product: ${product.name}\n• Store: ${listing.store.name}\n• Price: ${formatPrice(listing.price, listing.currency)}\n• Affiliate Tag: ${listing.affiliateTag}\n\nIn production, you would be redirected to:\n${listing.affiliateUrl}`);
  };

  const storeColors: Record<string, string> = {
    jumia: '#F68B1E',
    konga: '#E31837',
    amazon: '#FF9900',
    aliexpress: '#FF4747',
    jiji: '#1DB954',
    slot: '#0066CC',
    payportmall: '#7B2D8E',
    ebay: '#E53238',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <Link to="/" className="hover:text-indigo-600">Home</Link>
          <span>/</span>
          <Link to={`/search?category=${product.category}`} className="hover:text-indigo-600 capitalize">{product.category}</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Product Header */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Product Image Gallery */}
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
            <div className="aspect-square relative">
              <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {bestListing.discount > 10 && (
                  <span className="bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                    -{bestListing.discount}% OFF
                  </span>
                )}
                {product.tags.includes('bestseller') && (
                  <span className="bg-yellow-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                    BESTSELLER
                  </span>
                )}
              </div>
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  onClick={() => inWatchlist ? removeFromWatchlist(product.id) : addToWatchlist(product.id)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${
                    inWatchlist ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
                  }`}
                >
                  <Heart size={18} fill={inWatchlist ? 'currentColor' : 'none'} />
                </button>
                <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors">
                  <Share2 size={18} className="text-gray-600" />
                </button>
              </div>
              {/* Freshness indicator */}
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700 font-medium">Verified {product.lastVerified}</span>
              </div>
            </div>
            {/* Image thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 p-4">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === i ? 'border-indigo-500' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-2">
              <span className="text-sm text-indigo-600 font-medium">{product.brand}</span>
              <span className="text-xs text-gray-400 ml-2">• {product.totalClicks.toLocaleString()} people viewed</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
            <p className="text-gray-500 mb-4">{product.description}</p>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className={i < Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                ))}
              </div>
              <span className="font-semibold">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({product.ratings.length} reviews)</span>
              <span className="text-sm text-green-600 font-medium">✓ {product.listings.filter(l => l.inStock).length} stores in stock</span>
            </div>

            {/* Best Price Highlight */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown size={18} className="text-green-600" />
                <span className="text-sm font-semibold text-green-800">Lowest Total Price (incl. shipping)</span>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(bestListing.totalCost, bestListing.currency)}
                </span>
                {bestListing.originalPrice > bestListing.price && (
                  <span className="text-lg text-gray-400 line-through mb-1">
                    {formatPrice(bestListing.originalPrice, bestListing.currency)}
                  </span>
                )}
              </div>
              <p className="text-sm text-green-700 mt-2">
                at <strong>{bestListing.store.name}</strong> {bestListing.store.logo} • Delivered by {bestListing.deliveryDate}
                {bestListing.shippingCost === 0 && ' • Free shipping'}
              </p>
              <button
                onClick={() => handleAffiliateClick(bestListing)}
                className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                Buy at Best Price <ExternalLink size={16} />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <button
                onClick={() => {
                  if (!isAuthenticated) { alert('Please sign in to set price alerts'); return; }
                  setShowAlertModal(true);
                }}
                className="flex flex-col items-center gap-1 p-3 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 transition-colors"
              >
                <Bell size={20} className="text-indigo-600" />
                <span className="text-[10px] font-medium text-gray-700">Price Alert</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className="flex flex-col items-center gap-1 p-3 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 transition-colors"
              >
                <BarChart3 size={20} className="text-indigo-600" />
                <span className="text-[10px] font-medium text-gray-700">Price History</span>
              </button>
              <button className="flex flex-col items-center gap-1 p-3 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 transition-colors">
                <Share2 size={20} className="text-indigo-600" />
                <span className="text-[10px] font-medium text-gray-700">Share</span>
              </button>
              <button
                onClick={() => inWatchlist ? removeFromWatchlist(product.id) : addToWatchlist(product.id)}
                className="flex flex-col items-center gap-1 p-3 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 transition-colors"
              >
                <Heart size={20} className={inWatchlist ? 'text-red-500' : 'text-indigo-600'} fill={inWatchlist ? 'currentColor' : 'none'} />
                <span className="text-[10px] font-medium text-gray-700">{inWatchlist ? 'Saved' : 'Watchlist'}</span>
              </button>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck size={16} className="text-indigo-500" />
                <span>Free delivery available</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield size={16} className="text-indigo-500" />
                <span>Buyer protection</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={16} className="text-indigo-500" />
                <span>Updated every 15min</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Check size={16} className="text-green-500" />
                <span>Verified sellers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            {([
              { key: 'prices', label: `Price Comparison (${product.listings.length})` },
              { key: 'history', label: 'Price History' },
              { key: 'specs', label: 'Specifications' },
              { key: 'reviews', label: `Reviews (${product.ratings.length})` },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 min-w-[120px] py-4 text-sm font-medium transition-colors whitespace-nowrap px-4 ${
                  activeTab === tab.key
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Price Comparison Tab */}
            {activeTab === 'prices' && (
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Side-by-Side Offer Matrix</h3>
                    <p className="text-sm text-gray-500">All prices include shipping. Click to visit store.</p>
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                  >
                    <option value="total-cost">Lowest Total Cost</option>
                    <option value="price">Lowest Base Price</option>
                    <option value="rating">Highest Seller Rating</option>
                    <option value="delivery">Fastest Delivery</option>
                    <option value="best-value">Best Overall Value</option>
                  </select>
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Retailer</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Base Price</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Shipping</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Total Cost</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Delivery</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Stock</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Rating</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedListings.map((listing, index) => (
                        <tr
                          key={index}
                          className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${
                            index === 0 ? 'bg-green-50/30' : ''
                          }`}
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              {index === 0 && <Zap size={14} className="text-green-500" />}
                              <span className="text-xl">{listing.store.logo}</span>
                              <div>
                                <p className="font-semibold text-sm text-gray-900">{listing.store.name}</p>
                                <p className="text-[10px] text-gray-400">{listing.seller}</p>
                              </div>
                            </div>
                          </td>
                          <td className="text-right py-4 px-4">
                            <div>
                              <span className="font-medium text-sm">{formatPrice(listing.price, listing.currency)}</span>
                              {listing.discount > 0 && (
                                <span className="ml-1 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">-{listing.discount}%</span>
                              )}
                            </div>
                          </td>
                          <td className="text-right py-4 px-4 text-sm text-gray-600">
                            {listing.shippingCost === 0 ? (
                              <span className="text-green-600 font-medium">FREE</span>
                            ) : (
                              formatPrice(listing.shippingCost, listing.currency)
                            )}
                          </td>
                          <td className="text-right py-4 px-4">
                            <span className={`font-bold text-lg ${index === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                              {formatPrice(listing.totalCost, listing.currency)}
                            </span>
                          </td>
                          <td className="text-center py-4 px-4">
                            <div className="text-xs">
                              <p className="font-medium text-gray-900">{listing.deliveryDays}</p>
                              <p className="text-gray-400">by {listing.deliveryDate}</p>
                            </div>
                          </td>
                          <td className="text-center py-4 px-4">
                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                              listing.stockLevel === 'in-stock' ? 'bg-green-100 text-green-700' :
                              listing.stockLevel === 'low-stock' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {listing.stockLevel === 'in-stock' ? '✓ In Stock' :
                               listing.stockLevel === 'low-stock' ? '⚡ Low Stock' :
                               listing.stockLevel === 'pre-order' ? '📦 Pre-Order' : '✗ Out'}
                            </span>
                          </td>
                          <td className="text-center py-4 px-4">
                            <div className="flex items-center justify-center gap-1">
                              <Star size={12} className="text-yellow-400 fill-yellow-400" />
                              <span className="text-sm font-medium">{listing.rating}</span>
                              <span className="text-[10px] text-gray-400">({listing.reviews})</span>
                            </div>
                          </td>
                          <td className="text-center py-4 px-4">
                            <button
                              onClick={() => handleAffiliateClick(listing)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                index === 0
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90 shadow-sm'
                                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
                              }`}
                            >
                              Buy Now
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {sortedListings.map((listing, index) => (
                    <div
                      key={index}
                      className={`relative border rounded-2xl p-5 transition-all ${
                        index === 0 ? 'border-green-300 bg-green-50/30' : 'border-gray-100 bg-white'
                      }`}
                    >
                      {index === 0 && (
                        <div className="absolute -top-3 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          BEST TOTAL PRICE
                        </div>
                      )}
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{listing.store.logo}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{listing.store.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="flex items-center gap-0.5"><Star size={10} className="text-yellow-400 fill-yellow-400" />{listing.rating}</span>
                            <span>({listing.reviews})</span>
                            <span>•</span>
                            <span>{listing.seller}</span>
                          </div>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          listing.stockLevel === 'in-stock' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {listing.stockLevel === 'in-stock' ? 'In Stock' : 'Low Stock'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center">
                          <p className="text-[10px] text-gray-400 uppercase">Base</p>
                          <p className="text-sm font-medium">{formatPrice(listing.price, listing.currency)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-gray-400 uppercase">Shipping</p>
                          <p className="text-sm font-medium">{listing.shippingCost === 0 ? <span className="text-green-600">FREE</span> : formatPrice(listing.shippingCost, listing.currency)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-gray-400 uppercase">Total</p>
                          <p className={`text-sm font-bold ${index === 0 ? 'text-green-600' : 'text-gray-900'}`}>{formatPrice(listing.totalCost, listing.currency)}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          <p>📦 {listing.deliveryDays} • by {listing.deliveryDate}</p>
                          <p>🔄 Updated {listing.lastUpdated} • {listing.warranty}</p>
                        </div>
                        <button
                          onClick={() => handleAffiliateClick(listing)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium ${
                            index === 0 ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white'
                          }`}
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Affiliate Disclosure */}
                <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-xs text-amber-800">
                    <strong>💡 Affiliate Disclosure:</strong> PriceWise earns a commission (5-9%) when you purchase through our links, at no extra cost to you. 
                    Prices shown include shipping. We always rank by best value regardless of commission rates. Click tracking ID is appended for referral verification.
                  </p>
                </div>
              </div>
            )}

            {/* Price History Tab */}
            {activeTab === 'history' && (
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Price History & Trends</h3>
                    <p className="text-sm text-gray-500">Track price changes across stores over time</p>
                  </div>
                  <div className="flex gap-2">
                    {([30, 90, 180] as const).map(range => (
                      <button
                        key={range}
                        onClick={() => setHistoryRange(range)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          historyRange === range
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {range} days
                      </button>
                    ))}
                  </div>
                </div>

                {chartData.length > 0 ? (
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                        <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} />
                        <Tooltip
                          contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                          formatter={(value: number) => [`₦${value.toLocaleString()}`, '']}
                        />
                        <Legend />
                        {[...new Set(product.priceHistory.map(p => p.storeId))].map(storeId => {
                          const store = stores.find(s => s.id === storeId);
                          return (
                            <Line
                              key={storeId}
                              type="monotone"
                              dataKey={storeId}
                              name={store?.name || storeId}
                              stroke={storeColors[storeId] || '#6366f1'}
                              strokeWidth={2}
                              dot={false}
                              activeDot={{ r: 4 }}
                            />
                          );
                        })}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <BarChart3 size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No price history available for this period</p>
                  </div>
                )}

                {/* Price Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {(() => {
                    const allPrices = product.priceHistory
                      .filter(e => {
                        const cutoff = new Date();
                        cutoff.setDate(cutoff.getDate() - historyRange);
                        return new Date(e.date) >= cutoff;
                      })
                      .map(e => e.currency === '$' ? e.price * 1500 : e.price);
                    const min = Math.min(...allPrices);
                    const max = Math.max(...allPrices);
                    const avg = allPrices.reduce((a, b) => a + b, 0) / allPrices.length;
                    const current = bestListing.currency === '$' ? bestListing.totalCost * 1500 : bestListing.totalCost;
                    return (
                      <>
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Current Best</p>
                          <p className="text-lg font-bold text-green-600">₦{current.toLocaleString()}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Lowest Ever</p>
                          <p className="text-lg font-bold text-gray-900">₦{min.toLocaleString()}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Highest</p>
                          <p className="text-lg font-bold text-gray-900">₦{max.toLocaleString()}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Average</p>
                          <p className="text-lg font-bold text-gray-900">₦{Math.round(avg).toLocaleString()}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === 'specs' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Product Specifications</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {visibleSpecs.map(([key, value], i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-500">{key}</span>
                      <span className="text-sm font-medium text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
                {specs.length > 6 && (
                  <button
                    onClick={() => setShowAllSpecs(!showAllSpecs)}
                    className="mt-4 flex items-center gap-1 text-sm text-indigo-600 font-medium hover:underline"
                  >
                    {showAllSpecs ? <>Show Less <ChevronUp size={16} /></> : <>Show All {specs.length} Specs <ChevronDown size={16} /></>}
                  </button>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Customer Reviews</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className={i < Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                      ))}
                    </div>
                    <span className="font-semibold">{avgRating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {product.ratings.map((review, i) => (
                    <div key={i} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium text-sm">
                            {review.user.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{review.user}</p>
                            <p className="text-xs text-gray-400">{review.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, j) => (
                              <Star key={j} size={12} className={j < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                            ))}
                          </div>
                          {review.verified && (
                            <span className="text-xs text-green-600 font-medium flex items-center gap-0.5">
                              <Check size={10} /> Verified
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                        <span>{review.helpful} people found this helpful</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">You Might Also Like</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.filter(p => p.id !== product.id && p.category === product.category).slice(0, 4).map(p => (
              <Link key={p.id} to={`/product/${p.id}`} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
                <div className="aspect-square overflow-hidden">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-500">{p.brand}</p>
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{p.name}</p>
                  <p className="text-sm font-bold text-indigo-600 mt-1">
                    {formatPrice(Math.min(...p.listings.map(l => l.price)), p.listings[0].currency)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Price Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Set Price Alert</h3>
            <p className="text-sm text-gray-500 mb-4">Get notified when the price drops for <strong>{product.name}</strong></p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Price (₦)</label>
                <input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="e.g., 1000000"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notify via</label>
                <div className="flex gap-3">
                  {['email', 'sms', 'push'].map(channel => (
                    <label key={channel} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked={channel !== 'sms'} className="w-4 h-4 rounded text-indigo-600" />
                      <span className="text-sm capitalize">{channel}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAlertModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowAlertModal(false);
                    alert(`✅ Price alert set! You'll be notified when the price drops below ₦${parseInt(targetPrice || '0').toLocaleString()}`);
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:opacity-90"
                >
                  Set Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
