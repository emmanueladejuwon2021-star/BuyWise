import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Heart, Share2, Bell, ExternalLink, Truck, Shield, Clock, ChevronDown, ChevronUp, Check, TrendingDown, Eye, Zap, BarChart3, AlertTriangle, Award, Timer, Tag } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { products, stores } from '../data/products';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getProductDetail, ScoredListing, sortListings, computeSummaryTags, calculateTotalPrice, isPriceStale, parseDeliveryHours, calculateBestValueScore } from '../engine';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, isAuthenticated, addClickLog } = useAuth();
  const { addToast } = useToast();
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const [activeTab, setActiveTab] = useState<'prices' | 'history' | 'specs' | 'reviews'>('prices');
  const [sortBy, setSortBy] = useState<'total-cost' | 'price' | 'rating' | 'delivery' | 'best-value'>('total-cost');
  const [historyRange, setHistoryRange] = useState<30 | 90 | 180>(90);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');
  const [alertChannels, setAlertChannels] = useState<string[]>(['email', 'push']);
  const [redirecting, setRedirecting] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Use the engine to get product detail
  const detail = useMemo(() => {
    if (!id) return null;
    return getProductDetail(id);
  }, [id]);

  if (!detail || !detail.success || !detail.product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-500 mb-4">The product you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="px-6 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700">Go Home</Link>
        </div>
      </div>
    );
  }

  const product = detail.product;
  const allListings = detail.listings;
  const summaryTags = detail.summaryTags;
  const productId = product.sourceProducts[0]?.id || product.id;
  const inWatchlist = isInWatchlist(productId);

  // Sort listings based on user preference
  const sortedListings = useMemo(() => {
    const mode = sortBy === 'total-cost' ? 'lowest_price' : sortBy === 'best-value' ? 'best_value' : sortBy as any;
    return computeSummaryTags(sortListings(product.allListings, mode));
  }, [product.allListings, sortBy]);

  // Price history chart data
  const chartData = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - historyRange);
    const dateMap = new Map<string, Record<string, number>>();
    product.sourceProducts.forEach(p => {
      p.priceHistory.filter(e => new Date(e.date) >= cutoff).forEach(entry => {
        if (!dateMap.has(entry.date)) dateMap.set(entry.date, {});
        dateMap.get(entry.date)![entry.storeId] = entry.currency === '$' ? entry.price * 1500 : entry.price;
      });
    });
    return Array.from(dateMap.entries())
      .map(([date, storePrices]) => ({ date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), ...storePrices }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [product, historyRange]);

  const formatPrice = (price: number, currency: string) => currency === '₦' ? `₦${price.toLocaleString()}` : `$${price.toLocaleString()}`;
  const specs = Object.entries(product.specifications);
  const visibleSpecs = showAllSpecs ? specs : specs.slice(0, 6);

  const handleAffiliateClick = (listing: ScoredListing) => {
    if (isAuthenticated) {
      addClickLog({
        productId: productId,
        productName: product.canonicalTitle,
        storeId: listing.store.id,
        storeName: listing.store.name,
        source: 'comparison-table',
        price: listing.price,
        currency: listing.currency,
      });
    }
    setRedirecting(listing.store.id);
    addToast(`Redirecting to ${listing.store.name}...`, 'info', 2000);
    setTimeout(() => {
      setRedirecting(null);
      addToast(`✅ Click tracked! Affiliate tag: ${listing.affiliateTag}`, 'success', 4000);
    }, 1500);
  };

  const handleShare = async () => {
    const url = window.location.href;
    const bestPrice = sortedListings[0];
    const text = `${product.canonicalTitle} - Best: ${formatPrice(calculateTotalPrice(bestPrice), bestPrice.currency)} at ${bestPrice.store.name}`;
    if (navigator.share) {
      try { await navigator.share({ title: product.canonicalTitle, text, url }); addToast('Shared!', 'success'); } catch {}
    } else {
      try { await navigator.clipboard.writeText(`${text}\n${url}`); setCopied(true); addToast('Link copied!', 'success'); setTimeout(() => setCopied(false), 2000); } catch { addToast('Could not copy', 'error'); }
    }
  };

  const handleWatchlistToggle = () => {
    if (!isAuthenticated) { addToast('Please sign in', 'warning'); navigate('/login'); return; }
    if (inWatchlist) { removeFromWatchlist(productId); addToast('Removed from watchlist', 'info'); }
    else { addToWatchlist(productId); addToast('Added to watchlist!', 'success'); }
  };

  const storeColors: Record<string, string> = {
    jumia: '#F68B1E', konga: '#E31837', amazon: '#FF9900', aliexpress: '#FF4747',
    jiji: '#1DB954', slot: '#0066CC', payportmall: '#7B2D8E', ebay: '#E53238',
  };

  const bestListing = sortedListings[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs md:text-sm text-gray-500 mb-4 flex-wrap">
          <Link to="/" className="hover:text-indigo-600">Home</Link><span>/</span>
          <Link to={`/search?category=${product.category}`} className="hover:text-indigo-600 capitalize">{product.category}</Link><span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-[150px] md:max-w-[300px]">{product.canonicalTitle}</span>
        </nav>

        {/* Product Header */}
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
          {/* Image Gallery */}
          <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 overflow-hidden">
            <div className="aspect-square relative">
              <img src={product.images[selectedImage]} alt={product.canonicalTitle} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {bestListing.discount > 10 && <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">-{bestListing.discount}% OFF</span>}
                {product.tags.includes('bestseller') && <span className="bg-yellow-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">BESTSELLER</span>}
              </div>
              <div className="absolute top-3 right-3 flex flex-col gap-2">
                <button onClick={handleWatchlistToggle} className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${inWatchlist ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'}`}>
                  <Heart size={16} fill={inWatchlist ? 'currentColor' : 'none'} />
                </button>
                <button onClick={handleShare} className="w-9 h-9 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50">
                  {copied ? <Check size={16} className="text-green-500" /> : <Share2 size={16} className="text-gray-600" />}
                </button>
              </div>
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 text-[10px] md:text-xs">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700 font-medium">Verified {product.lastVerified}</span>
              </div>
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 p-3 md:p-4">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)} className={`w-14 h-14 md:w-16 md:h-16 rounded-lg md:rounded-xl overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-1.5 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-indigo-600 font-medium">{product.brand}</span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500"><Eye size={11} className="inline" /> {product.totalClicks.toLocaleString()} views</span>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                <Clock size={9} /> {detail.executionTimeMs}ms
              </span>
            </div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 md:mb-3">{product.canonicalTitle}</h1>
            <p className="text-sm md:text-base text-gray-500 mb-4">{product.description}</p>

            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 flex-wrap">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} className={i < Math.round(product.avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />)}
              </div>
              <span className="font-semibold text-sm">{product.avgRating.toFixed(1)}</span>
              <span className="text-xs text-gray-500">({product.totalReviews} reviews)</span>
              <span className="text-xs text-green-600 font-medium">✓ {product.allListings.filter(l => l.inStock).length} stores</span>
            </div>

            {/* Best Price */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl md:rounded-2xl p-4 md:p-5 mb-4 md:mb-6">
              <div className="flex items-center gap-2 mb-1.5">
                <TrendingDown size={16} className="text-green-600" />
                <span className="text-xs md:text-sm font-semibold text-green-800">Lowest Total Price (incl. shipping)</span>
              </div>
              <div className="flex items-end gap-2 md:gap-3">
                <span className="text-2xl md:text-3xl font-bold text-gray-900">{formatPrice(calculateTotalPrice(bestListing), bestListing.currency)}</span>
                {bestListing.originalPrice > bestListing.price && (
                  <span className="text-sm md:text-base text-gray-400 line-through mb-0.5">{formatPrice(bestListing.originalPrice, bestListing.currency)}</span>
                )}
              </div>
              <p className="text-xs md:text-sm text-green-700 mt-1.5">
                at <strong>{bestListing.store.name}</strong> {bestListing.store.logo} • Delivered by {bestListing.deliveryDate}
                {bestListing.shippingCost === 0 && ' • Free shipping'}
              </p>
              <button
                onClick={() => handleAffiliateClick(bestListing)}
                disabled={redirecting === bestListing.store.id}
                className="mt-3 w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-2.5 md:py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-70"
              >
                {redirecting === bestListing.store.id ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Redirecting...</> : <>Buy at Best Price <ExternalLink size={15} /></>}
              </button>
            </div>

            {/* Summary Tags */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {summaryTags.cheapest && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                  <Tag size={14} className="text-green-600 mx-auto mb-0.5" />
                  <p className="text-[10px] text-green-700 font-medium">Cheapest</p>
                  <p className="text-[9px] text-green-600">{summaryTags.cheapest}</p>
                </div>
              )}
              {summaryTags.fastest && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
                  <Timer size={14} className="text-blue-600 mx-auto mb-0.5" />
                  <p className="text-[10px] text-blue-700 font-medium">Fastest</p>
                  <p className="text-[9px] text-blue-600">{summaryTags.fastest}</p>
                </div>
              )}
              {summaryTags.topRated && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 text-center">
                  <Award size={14} className="text-purple-600 mx-auto mb-0.5" />
                  <p className="text-[10px] text-purple-700 font-medium">Top Rated</p>
                  <p className="text-[9px] text-purple-600">{summaryTags.topRated}</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-6">
              <button onClick={() => { if (!isAuthenticated) { addToast('Please sign in', 'warning'); navigate('/login'); return; } setShowAlertModal(true); }} className="flex flex-col items-center gap-0.5 md:gap-1 p-2 md:p-3 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 transition-all">
                <Bell size={18} className="text-indigo-600" /><span className="text-[9px] md:text-[10px] font-medium text-gray-700">Alert</span>
              </button>
              <button onClick={() => setActiveTab('history')} className="flex flex-col items-center gap-0.5 md:gap-1 p-2 md:p-3 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 transition-all">
                <BarChart3 size={18} className="text-indigo-600" /><span className="text-[9px] md:text-[10px] font-medium text-gray-700">History</span>
              </button>
              <button onClick={handleShare} className="flex flex-col items-center gap-0.5 md:gap-1 p-2 md:p-3 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 transition-all">
                {copied ? <Check size={18} className="text-green-600" /> : <Share2 size={18} className="text-indigo-600" />}
                <span className="text-[9px] md:text-[10px] font-medium text-gray-700">{copied ? 'Copied' : 'Share'}</span>
              </button>
              <button onClick={handleWatchlistToggle} className="flex flex-col items-center gap-0.5 md:gap-1 p-2 md:p-3 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 transition-all">
                <Heart size={18} className={inWatchlist ? 'text-red-500' : 'text-indigo-600'} fill={inWatchlist ? 'currentColor' : 'none'} />
                <span className="text-[9px] md:text-[10px] font-medium text-gray-700">{inWatchlist ? 'Saved' : 'Save'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs md:text-sm text-gray-600">
              <div className="flex items-center gap-1.5"><Truck size={14} className="text-indigo-500 shrink-0" /><span>Free delivery available</span></div>
              <div className="flex items-center gap-1.5"><Shield size={14} className="text-indigo-500 shrink-0" /><span>Buyer protection</span></div>
              <div className="flex items-center gap-1.5"><Clock size={14} className="text-indigo-500 shrink-0" /><span>Updated every 15min</span></div>
              <div className="flex items-center gap-1.5"><Check size={14} className="text-green-500 shrink-0" /><span>Verified sellers</span></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            {([
              { key: 'prices', label: `Prices (${product.allListings.length})` },
              { key: 'history', label: 'History' },
              { key: 'specs', label: 'Specs' },
              { key: 'reviews', label: `Reviews (${product.totalReviews})` },
            ] as const).map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-1 min-w-[80px] py-3 md:py-4 text-xs md:text-sm font-medium transition-colors whitespace-nowrap px-2 md:px-4 ${activeTab === tab.key ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-4 md:p-6">
            {/* Prices Tab */}
            {activeTab === 'prices' && (
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 md:mb-6">
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-gray-900">Side-by-Side Offer Matrix</h3>
                    <p className="text-xs md:text-sm text-gray-500">All prices include shipping • Sorted by {sortBy.replace('-', ' ')}</p>
                  </div>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="px-3 py-2 border border-gray-200 rounded-lg text-xs md:text-sm outline-none focus:border-indigo-500">
                    <option value="total-cost">Lowest Total Cost</option>
                    <option value="price">Lowest Base Price</option>
                    <option value="rating">Highest Rating</option>
                    <option value="delivery">Fastest Delivery</option>
                    <option value="best-value">Best Value Score</option>
                  </select>
                </div>

                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {['Retailer', 'Base Price', 'Shipping', 'Total Cost', 'Delivery', 'Stock', 'Rating', 'Value', 'Action'].map(h => (
                          <th key={h} className="text-center py-3 px-3 text-[10px] font-semibold text-gray-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedListings.map((listing, index) => (
                        <tr key={index} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${index === 0 ? 'bg-green-50/30' : ''} ${!listing.inStock ? 'opacity-50' : ''}`}>
                          <td className="py-3 px-3 text-left">
                            <div className="flex items-center gap-2">
                              {listing.summaryTags.includes('Cheapest Option') && <Zap size={12} className="text-green-500" />}
                              <span className="text-lg">{listing.store.logo}</span>
                              <div>
                                <p className="font-semibold text-xs text-gray-900">{listing.store.name}</p>
                                <p className="text-[9px] text-gray-400">{listing.seller}</p>
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-3 px-3">
                            <span className="text-xs font-medium">{formatPrice(listing.price, listing.currency)}</span>
                            {listing.discount > 0 && <span className="ml-1 text-[9px] bg-red-100 text-red-600 px-1 rounded">-{listing.discount}%</span>}
                          </td>
                          <td className="text-center py-3 px-3 text-xs">
                            {listing.shippingCost === 0 ? <span className="text-green-600 font-medium">FREE</span> : formatPrice(listing.shippingCost, listing.currency)}
                          </td>
                          <td className="text-center py-3 px-3">
                            <span className={`font-bold text-sm ${index === 0 ? 'text-green-600' : 'text-gray-900'}`}>{formatPrice(listing.totalCost || calculateTotalPrice(listing), listing.currency)}</span>
                          </td>
                          <td className="text-center py-3 px-3">
                            <div className="text-[10px]">
                              <p className="font-medium text-gray-900">{listing.deliveryDays}</p>
                              <p className="text-gray-400">{listing.deliveryDate}</p>
                            </div>
                          </td>
                          <td className="text-center py-3 px-3">
                            <span className={`inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded-full ${listing.stockLevel === 'in-stock' ? 'bg-green-100 text-green-700' : listing.stockLevel === 'low-stock' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                              {listing.stockLevel === 'in-stock' ? '✓' : listing.stockLevel === 'low-stock' ? '⚡' : '✗'}
                            </span>
                          </td>
                          <td className="text-center py-3 px-3">
                            <div className="flex items-center justify-center gap-0.5">
                              <Star size={10} className="text-yellow-400 fill-yellow-400" />
                              <span className="text-xs font-medium">{listing.rating}</span>
                            </div>
                          </td>
                          <td className="text-center py-3 px-3">
                            <div className="text-center">
                              <span className={`text-xs font-bold ${listing.bestValueScore >= 70 ? 'text-green-600' : listing.bestValueScore >= 50 ? 'text-yellow-600' : 'text-gray-500'}`}>
                                {listing.bestValueScore}
                              </span>
                              {listing.isStale && <span title="Price not updated in 24h"><AlertTriangle size={10} className="text-amber-500 inline ml-0.5" /></span>}
                            </div>
                          </td>
                          <td className="text-center py-3 px-3">
                            <button
                              onClick={() => handleAffiliateClick(listing)}
                              disabled={redirecting === listing.store.id || !listing.inStock}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ${
                                index === 0 ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                              }`}
                            >
                              {redirecting === listing.store.id ? '...' : listing.inStock ? 'Buy' : 'N/A'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-3">
                  {sortedListings.map((listing, index) => (
                    <div key={index} className={`relative border rounded-xl p-4 transition-all ${index === 0 ? 'border-green-300 bg-green-50/30' : 'border-gray-100'} ${!listing.inStock ? 'opacity-50' : ''}`}>
                      {index === 0 && <div className="absolute -top-2.5 left-3 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">BEST PRICE</div>}
                      {listing.summaryTags.length > 0 && (
                        <div className="absolute -top-2.5 right-3 flex gap-1">
                          {listing.summaryTags.map((tag, i) => (
                            <span key={i} className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${tag.includes('Fastest') ? 'bg-blue-500 text-white' : tag.includes('Top') ? 'bg-purple-500 text-white' : ''}`}>{tag}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-2 mt-1">
                        <span className="text-xl">{listing.store.logo}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-900">{listing.store.name}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                            <span className="flex items-center gap-0.5"><Star size={9} className="text-yellow-400 fill-yellow-400" />{listing.rating}</span>
                            <span>•</span>
                            <span>Value: <strong className={listing.bestValueScore >= 70 ? 'text-green-600' : 'text-gray-600'}>{listing.bestValueScore}</strong></span>
                            {listing.isStale && <><span>•</span><span className="text-amber-600 flex items-center gap-0.5"><AlertTriangle size={9} /> Stale</span></>}
                          </div>
                        </div>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${listing.stockLevel === 'in-stock' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {listing.stockLevel === 'in-stock' ? 'In Stock' : 'Low'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center bg-gray-50 rounded-lg p-1.5">
                          <p className="text-[9px] text-gray-400">Base</p>
                          <p className="text-xs font-medium">{formatPrice(listing.price, listing.currency)}</p>
                        </div>
                        <div className="text-center bg-gray-50 rounded-lg p-1.5">
                          <p className="text-[9px] text-gray-400">Ship</p>
                          <p className="text-xs font-medium">{listing.shippingCost === 0 ? <span className="text-green-600">FREE</span> : formatPrice(listing.shippingCost, listing.currency)}</p>
                        </div>
                        <div className="text-center bg-gray-50 rounded-lg p-1.5">
                          <p className="text-[9px] text-gray-400">Total</p>
                          <p className={`text-xs font-bold ${index === 0 ? 'text-green-600' : 'text-gray-900'}`}>{formatPrice(listing.totalCost || calculateTotalPrice(listing), listing.currency)}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] text-gray-500">
                          <p>📦 {listing.deliveryDays} • by {listing.deliveryDate}</p>
                        </div>
                        <button
                          onClick={() => handleAffiliateClick(listing)}
                          disabled={redirecting === listing.store.id || !listing.inStock}
                          className={`px-4 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50 ${index === 0 ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white'}`}
                        >
                          {redirecting === listing.store.id ? '...' : listing.inStock ? 'Buy Now' : 'Unavailable'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 md:mt-6 p-3 md:p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-[10px] md:text-xs text-amber-800">
                    <strong>💡 Affiliate Disclosure:</strong> PriceWise earns a commission (5-9%) when you purchase through our links, at no extra cost to you. 
                    Value Score = Price(50%) + Rating(30%) + Speed(20%). Stale prices haven't been verified in 24h.
                  </p>
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 md:mb-6">
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-gray-900">Price History</h3>
                    <p className="text-xs text-gray-500">Track price changes across stores</p>
                  </div>
                  <div className="flex gap-1.5">
                    {([30, 90, 180] as const).map(r => (
                      <button key={r} onClick={() => setHistoryRange(r)} className={`px-3 py-1.5 rounded-full text-xs font-medium ${historyRange === r ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{r}d</button>
                    ))}
                  </div>
                </div>
                {chartData.length > 0 ? (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                        <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} />
                        <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} formatter={(value: number) => [`₦${value.toLocaleString()}`, '']} />
                        <Legend />
                        {[...new Set(product.sourceProducts.flatMap(p => p.priceHistory.map(e => e.storeId)))].map(storeId => {
                          const store = stores.find(s => s.id === storeId);
                          return <Line key={storeId} type="monotone" dataKey={storeId} name={store?.name || storeId} stroke={storeColors[storeId] || '#6366f1'} strokeWidth={2} dot={false} />;
                        })}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500"><BarChart3 size={40} className="mx-auto mb-3 text-gray-300" /><p className="text-sm">No price history for this period</p></div>
                )}
              </div>
            )}

            {/* Specs Tab */}
            {activeTab === 'specs' && (
              <div>
                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3">Specifications</h3>
                <div className="grid md:grid-cols-2 gap-2">
                  {visibleSpecs.map(([key, value], i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                      <span className="text-xs text-gray-500">{key}</span>
                      <span className="text-xs font-medium text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
                {specs.length > 6 && (
                  <button onClick={() => setShowAllSpecs(!showAllSpecs)} className="mt-3 text-xs text-indigo-600 font-medium hover:underline">
                    {showAllSpecs ? 'Show Less' : `Show All ${specs.length} Specs`}
                  </button>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3">Customer Reviews</h3>
                <div className="space-y-3">
                  {product.sourceProducts.flatMap(p => p.ratings).slice(0, 10).map((review, i) => (
                    <div key={i} className="border border-gray-100 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium text-xs">{review.user.charAt(0)}</div>
                          <div>
                            <p className="text-xs font-medium text-gray-900">{review.user}</p>
                            <p className="text-[10px] text-gray-400">{review.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, j) => <Star key={j} size={10} className={j < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />)}
                          {review.verified && <Check size={10} className="text-green-500 ml-1" />}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Price Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAlertModal(false)}>
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Set Price Alert</h3>
            <p className="text-xs text-gray-500 mb-3">Get notified when price drops for <strong className="line-clamp-1">{product.canonicalTitle}</strong></p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Target Price (₦)</label>
                <input type="number" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} placeholder="e.g., 1000000" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500" autoFocus />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Notify via</label>
                <div className="flex gap-2">
                  {['email', 'sms', 'push'].map(ch => (
                    <button key={ch} onClick={() => setAlertChannels(prev => prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch])} className={`px-3 py-1.5 rounded-full text-xs font-medium ${alertChannels.includes(ch) ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {ch.charAt(0).toUpperCase() + ch.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowAlertModal(false)} className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={() => { if (!targetPrice || parseInt(targetPrice) <= 0) { addToast('Enter a valid price', 'warning'); return; } addToast(`Alert set for ₦${parseInt(targetPrice).toLocaleString()}`, 'success'); setShowAlertModal(false); setTargetPrice(''); }} className="flex-1 px-3 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:opacity-90">Set Alert</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
