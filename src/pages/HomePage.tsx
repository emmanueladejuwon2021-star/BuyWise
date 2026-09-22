import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingUp, Zap, Shield, Clock, BarChart3, Sparkles, ChevronRight, Eye, Scale, Tag, Truck, Crown, Gift } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useToast } from '../context/ToastContext';
import { products, categories, trendingSearches, stores, getBestDeal } from '../data/products';

const HomePage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const { addToast } = useToast();
  const navigate = useNavigate();

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  const topDeals = products
    .map(p => ({ product: p, ...getBestDeal(p) }))
    .sort((a, b) => b.listing.discount - a.listing.discount)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-300 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-5 sm:py-8 md:py-10 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-2.5 py-0.5 mb-2.5 sm:mb-3">
              <Sparkles size={13} className="text-yellow-300" />
              <span className="text-[11px] sm:text-xs text-white/90">Compare 8+ stores in real-time</span>
            </div>
            <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3 leading-tight">
              Find the Best Price.
              <br />
              <span className="text-yellow-300">Save More Money.</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 mb-3.5 sm:mb-4 max-w-xl">
              Compare prices across Jumia, Konga, Amazon, AliExpress, and more. 
              We scan thousands of products so you never overpay.
            </p>
            <div className="flex flex-row items-center gap-2 sm:gap-2.5 flex-wrap">
              <Link
                to="/search?q=iphone"
                className="inline-flex items-center justify-center gap-1.5 bg-white text-indigo-600 font-semibold px-4 sm:px-5 py-1.5 sm:py-2 text-xs rounded-full hover:bg-gray-100 transition-colors shadow-sm"
              >
                Start Comparing <ArrowRight size={13} />
              </Link>
              <Link
                to="/deals"
                className="inline-flex items-center justify-center gap-1.5 bg-white/10 backdrop-blur-sm text-white font-semibold px-4 sm:px-5 py-1.5 sm:py-2 text-xs rounded-full hover:bg-white/20 transition-colors border border-white/20"
              >
                <Zap size={13} /> View Hot Deals
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-4 sm:mt-6">
            {[
              { label: 'Products Tracked', value: '50,000+', icon: BarChart3 },
              { label: 'Partner Stores', value: '8+', icon: Shield },
              { label: 'Prices Updated', value: 'Every 30min', icon: Clock },
              { label: 'Users Saved', value: '₦2.5B+', icon: TrendingUp },
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-2 sm:p-3 border border-white/10">
                <stat.icon size={15} className="text-yellow-300 mb-0.5" />
                <p className="text-sm sm:text-lg font-bold text-white leading-tight">{stat.value}</p>
                <p className="text-[9px] sm:text-[11px] text-white/70 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Searches */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          <span className="text-xs font-semibold text-gray-500 shrink-0">Trending:</span>
          {trendingSearches.map((term, i) => (
            <Link
              key={i}
              to={`/search?q=${encodeURIComponent(term)}`}
              className="shrink-0 px-2.5 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-700 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
            >
              {term}
            </Link>
          ))}
        </div>
      </section>

      {/* Smart Shopping Utilities Banner */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 py-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <Link
            to="/compare"
            className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-gray-200 hover:border-indigo-400 hover:shadow-sm transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Scale size={16} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-gray-900 group-hover:text-indigo-600 truncate">Side-by-Side Compare</h3>
              <p className="text-[10px] text-gray-500 truncate">Specs & prices up to 4 items</p>
            </div>
          </Link>
          <Link
            to="/coupons"
            className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-gray-200 hover:border-yellow-400 hover:shadow-sm transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Tag size={16} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-gray-900 group-hover:text-yellow-600 truncate">Store Promo Codes</h3>
              <p className="text-[10px] text-gray-500 truncate">Verified discounts & coupons</p>
            </div>
          </Link>
          <Link
            to="/shipping-calculator"
            className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Truck size={16} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-gray-900 group-hover:text-blue-600 truncate">Shipping & Customs</h3>
              <p className="text-[10px] text-gray-500 truncate">Total landed price calculator</p>
            </div>
          </Link>
          <Link
            to="/deals"
            className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-gray-200 hover:border-red-400 hover:shadow-sm transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Zap size={16} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-gray-900 group-hover:text-red-600 truncate">Hot Drops & Deals</h3>
              <p className="text-[10px] text-gray-500 truncate">Biggest discounts today</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Shop by Category</h2>
          <Link to="/categories" className="text-xs sm:text-sm text-indigo-600 font-medium flex items-center gap-0.5 hover:underline">
            View All <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/search?category=${cat.id}`}
              className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 text-center hover:shadow-md hover:border-indigo-200 border border-gray-100 transition-all group"
            >
              <span className="text-2xl sm:text-3xl mb-1 block group-hover:scale-110 transition-transform">{cat.icon}</span>
              <p className="text-[11px] sm:text-xs font-medium text-gray-700 group-hover:text-indigo-600 transition-colors truncate">{cat.name}</p>
              <p className="text-[9px] text-gray-400 mt-0.5">{cat.count.toLocaleString()} items</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Partner Stores */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">We Compare Prices From</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3.5">
          {stores.map(store => (
            <button
              key={store.id}
              onClick={() => navigate(`/search?store=${store.id}`)}
              className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 border border-gray-100 hover:shadow-sm hover:border-indigo-200 transition-all flex items-center gap-2.5 text-left w-full"
            >
              <span className="text-2xl sm:text-3xl shrink-0">{store.logo}</span>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{store.name}</p>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400 text-[10px]">★</span>
                  <span className="text-[10px] text-gray-500 truncate">{store.rating} • {store.country}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Hot Deals */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Hot Deals</h2>
              <p className="text-[11px] sm:text-xs text-gray-500">Biggest discounts right now</p>
            </div>
          </div>
          <Link to="/deals" className="text-xs sm:text-sm text-indigo-600 font-medium flex items-center gap-0.5 hover:underline">
            See All <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {topDeals.map(({ product }) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="text-center mb-3.5 sm:mb-5">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">How PriceWise Works</h2>
          <p className="text-xs text-gray-500 max-w-md mx-auto">Save money in 3 simple steps without switching between multiple apps.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-2.5 sm:gap-4">
          {[
            {
              step: '1',
              title: 'Search Product',
              description: 'Enter any product, brand, or model. We scan across all partner stores simultaneously.',
              icon: '🔍',
              color: 'from-blue-500 to-indigo-500',
            },
            {
              step: '2',
              title: 'Compare Prices',
              description: 'See prices side-by-side. Filter by delivery time, seller rating, and total shipping cost.',
              icon: '📊',
              color: 'from-purple-500 to-pink-500',
            },
            {
              step: '3',
              title: 'Buy & Save',
              description: 'Tap directly through to the store with the lowest price and complete your order securely.',
              icon: '💰',
              color: 'from-green-500 to-emerald-500',
            },
          ].map((item, i) => (
            <div key={i} className="relative bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-100 hover:shadow-xs transition-all group">
              <span className="text-xl sm:text-2xl mb-1 block">{item.icon}</span>
              <div className="text-[10px] font-bold text-indigo-600 mb-0.5">STEP {item.step}</div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* All Products */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Popular Products</h2>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {['all', 'phones', 'laptops', 'electronics', 'gaming', 'fashion'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'
                }`}
              >
                {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Merchant CTA Section */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 rounded-full blur-3xl"></div>
          </div>
          <div className="relative grid md:grid-cols-2 gap-4 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-2.5 py-0.5 mb-2">
                <span className="text-sm">🏪</span>
                <span className="text-[11px] text-white/90 font-medium">For Store Owners</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Grow Your Business with PriceWise
              </h2>
              <p className="text-white/80 mb-3 text-xs sm:text-sm">
                Reach thousands of shoppers actively looking for products like yours. Get verified, promote your listings, and track performance.
              </p>
              <ul className="space-y-1 mb-3.5 text-xs">
                {[
                  'Get verified store badge',
                  'Sponsored listing placements',
                  'Live store visitor & sales stats',
                  'Popular product demand reports',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-white/90">
                    <span className="text-green-300 font-bold text-xs">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/store/register"
                className="inline-flex items-center gap-1.5 bg-white text-indigo-600 font-semibold px-4 py-2 text-xs rounded-full hover:bg-gray-100 transition-colors shadow-sm"
              >
                Register Your Store <ArrowRight size={13} />
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl">
                    <div>
                      <p className="text-white/60 text-[10px]">Monthly Revenue</p>
                      <p className="text-white text-xl font-bold">₦2.5M+</p>
                    </div>
                    <TrendingUp size={24} className="text-green-300" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl">
                    <div>
                      <p className="text-white/60 text-[10px]">Active Customers</p>
                      <p className="text-white text-xl font-bold">15,000+</p>
                    </div>
                    <Eye size={24} className="text-blue-300" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl">
                    <div>
                      <p className="text-white/60 text-[10px]">Shopper Purchase Rate</p>
                      <p className="text-white text-xl font-bold">12.5%</p>
                    </div>
                    <BarChart3 size={24} className="text-purple-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          </div>
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Never Overpay Again</h2>
            <p className="text-white/80 mb-5 text-xs sm:text-sm max-w-md mx-auto">
              Join 100,000+ smart shoppers who save an average of ₦15,000 per purchase using PriceWise.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-1.5 bg-white text-indigo-600 font-semibold px-5 py-2.5 text-xs sm:text-sm rounded-full hover:bg-gray-100 transition-colors shadow-md"
            >
              Get Started Free <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
