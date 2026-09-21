import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, Share2, Bell, ExternalLink, Truck, Shield, Clock, ChevronDown, ChevronUp, Check, ArrowRight, TrendingDown, AlertCircle } from 'lucide-react';
import { products, getBestDeal } from '../data/products';
import { useAuth } from '../context/AuthContext';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const product = products.find(p => p.id === id);
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, isAuthenticated } = useAuth();
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const [activeTab, setActiveTab] = useState<'prices' | 'specs' | 'reviews'>('prices');
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'delivery'>('price');

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-500 mb-4">The product you're looking for doesn't exist.</p>
          <Link to="/" className="text-indigo-600 font-medium hover:underline">Go Home</Link>
        </div>
      </div>
    );
  }

  const { listing: bestListing, savings } = getBestDeal(product);
  const inWatchlist = isInWatchlist(product.id);
  const avgRating = product.ratings.reduce((sum, r) => sum + r.rating, 0) / product.ratings.length;

  const sortedListings = [...product.listings].sort((a, b) => {
    if (sortBy === 'price') {
      const aPrice = a.currency === '₦' ? a.price : a.price * 1500;
      const bPrice = b.currency === '₦' ? b.price : b.price * 1500;
      return aPrice - bPrice;
    }
    if (sortBy === 'rating') return b.rating - a.rating;
    return a.deliveryDays.localeCompare(b.deliveryDays);
  });

  const formatPrice = (price: number, currency: string) => {
    if (currency === '₦') return `₦${price.toLocaleString()}`;
    return `$${price.toLocaleString()}`;
  };

  const specs = Object.entries(product.specifications);
  const visibleSpecs = showAllSpecs ? specs : specs.slice(0, 4);

  const handleAffiliateClick = (storeName: string) => {
    // In production, this would redirect to the affiliate URL
    // The commission is tracked through the affiliate link
    alert(`Redirecting to ${storeName}...\n\nIn production, you would be redirected to the store's product page via our affiliate link. We earn a small commission at no extra cost to you.`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-indigo-600">Home</Link>
          <span>/</span>
          <Link to={`/search?category=${product.category}`} className="hover:text-indigo-600 capitalize">{product.category}</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </nav>

        {/* Product Header */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Product Image */}
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
            <div className="aspect-square relative">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
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
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-2">
              <span className="text-sm text-indigo-600 font-medium">{product.brand}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
            <p className="text-gray-500 mb-4">{product.description}</p>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className={i < Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                ))}
              </div>
              <span className="font-semibold">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({product.ratings.length} reviews)</span>
              <span className="text-sm text-green-600 font-medium">✓ {product.listings.filter(l => l.inStock).length} stores have this in stock</span>
            </div>

            {/* Best Price Highlight */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown size={18} className="text-green-600" />
                <span className="text-sm font-semibold text-green-800">Best Price Available</span>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(bestListing.price, bestListing.currency)}
                </span>
                {bestListing.originalPrice > bestListing.price && (
                  <span className="text-lg text-gray-400 line-through mb-1">
                    {formatPrice(bestListing.originalPrice, bestListing.currency)}
                  </span>
                )}
              </div>
              <p className="text-sm text-green-700 mt-2">
                at <strong>{bestListing.store.name}</strong> • {bestListing.deliveryDays} delivery
                {bestListing.shippingCost === 0 && ' • Free shipping'}
              </p>
              <button
                onClick={() => handleAffiliateClick(bestListing.store.name)}
                className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                Buy at Best Price <ExternalLink size={16} />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    alert('Please sign in to set price alerts');
                    return;
                  }
                  alert('Price alert set! We\'ll notify you when the price drops.');
                }}
                className="flex flex-col items-center gap-1 p-3 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 transition-colors"
              >
                <Bell size={20} className="text-indigo-600" />
                <span className="text-xs font-medium text-gray-700">Price Alert</span>
              </button>
              <button className="flex flex-col items-center gap-1 p-3 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 transition-colors">
                <Share2 size={20} className="text-indigo-600" />
                <span className="text-xs font-medium text-gray-700">Share</span>
              </button>
              <button
                onClick={() => inWatchlist ? removeFromWatchlist(product.id) : addToWatchlist(product.id)}
                className="flex flex-col items-center gap-1 p-3 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 transition-colors"
              >
                <Heart size={20} className={inWatchlist ? 'text-red-500' : 'text-indigo-600'} fill={inWatchlist ? 'currentColor' : 'none'} />
                <span className="text-xs font-medium text-gray-700">{inWatchlist ? 'Saved' : 'Watchlist'}</span>
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
                <span>Prices updated every 30min</span>
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
          <div className="flex border-b">
            {(['prices', 'specs', 'reviews'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'prices' && `Price Comparison (${product.listings.length})`}
                {tab === 'specs' && 'Specifications'}
                {tab === 'reviews' && `Reviews (${product.ratings.length})`}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Price Comparison Tab */}
            {activeTab === 'prices' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Compare Prices Across Stores</h3>
                    <p className="text-sm text-gray-500">Click any store to visit their product page</p>
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'price' | 'rating' | 'delivery')}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                  >
                    <option value="price">Sort by Price</option>
                    <option value="rating">Sort by Rating</option>
                    <option value="delivery">Sort by Delivery</option>
                  </select>
                </div>

                <div className="space-y-4">
                  {sortedListings.map((listing, index) => (
                    <div
                      key={index}
                      className={`relative border rounded-2xl p-5 transition-all hover:shadow-md ${
                        index === 0 ? 'border-green-300 bg-green-50/30' : 'border-gray-100 bg-white'
                      }`}
                    >
                      {index === 0 && (
                        <div className="absolute -top-3 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          BEST PRICE
                        </div>
                      )}
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Store Info */}
                        <div className="flex items-center gap-3 md:w-48 shrink-0">
                          <span className="text-3xl">{listing.store.logo}</span>
                          <div>
                            <p className="font-semibold text-gray-900">{listing.store.name}</p>
                            <div className="flex items-center gap-1">
                              <Star size={12} className="text-yellow-400 fill-yellow-400" />
                              <span className="text-xs text-gray-500">{listing.rating} ({listing.reviews} reviews)</span>
                            </div>
                          </div>
                        </div>

                        {/* Price Info */}
                        <div className="flex-1">
                          <div className="flex items-end gap-2 mb-1">
                            <span className="text-xl font-bold text-gray-900">
                              {formatPrice(listing.price, listing.currency)}
                            </span>
                            {listing.originalPrice > listing.price && (
                              <span className="text-sm text-gray-400 line-through">
                                {formatPrice(listing.originalPrice, listing.currency)}
                              </span>
                            )}
                            {listing.discount > 0 && (
                              <span className="text-xs bg-red-100 text-red-600 font-medium px-2 py-0.5 rounded-full">
                                -{listing.discount}%
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Truck size={12} />
                              {listing.shippingCost === 0 ? 'Free shipping' : `+${formatPrice(listing.shippingCost, listing.currency)} shipping`}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {listing.deliveryDays}
                            </span>
                            <span className="flex items-center gap-1">
                              <Shield size={12} />
                              {listing.warranty}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Seller: {listing.seller} • Updated: {listing.lastUpdated} • Condition: {listing.condition}
                          </p>
                        </div>

                        {/* Action */}
                        <div className="shrink-0">
                          {listing.inStock ? (
                            <button
                              onClick={() => handleAffiliateClick(listing.store.name)}
                              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                                index === 0
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90 shadow-md'
                                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
                              }`}
                            >
                              Visit Store <ExternalLink size={14} />
                            </button>
                          ) : (
                            <span className="flex items-center gap-1 text-sm text-red-500">
                              <AlertCircle size={14} /> Out of Stock
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Affiliate Disclosure */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500">
                    <strong>Affiliate Disclosure:</strong> PriceWise earns a small commission when you purchase through our links, at no extra cost to you. 
                    This helps us keep the service free. We always show you the best prices regardless of commission rates.
                  </p>
                </div>
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === 'specs' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Product Specifications</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {visibleSpecs.map(([key, value], i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-500">{key}</span>
                      <span className="text-sm font-medium text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
                {specs.length > 4 && (
                  <button
                    onClick={() => setShowAllSpecs(!showAllSpecs)}
                    className="mt-4 flex items-center gap-1 text-sm text-indigo-600 font-medium hover:underline"
                  >
                    {showAllSpecs ? (
                      <>Show Less <ChevronUp size={16} /></>
                    ) : (
                      <>Show All Specifications <ChevronDown size={16} /></>
                    )}
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
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className={i < Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                      ))}
                    </div>
                    <span className="font-semibold">{avgRating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">({product.ratings.length} reviews)</span>
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
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
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
    </div>
  );
};

export default ProductDetailPage;
