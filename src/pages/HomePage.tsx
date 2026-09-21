import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Zap, Shield, Clock, BarChart3, Sparkles, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { products, categories, trendingSearches, stores, getBestDeal } from '../data/products';

const HomePage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');

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
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles size={16} className="text-yellow-300" />
              <span className="text-sm text-white/90">Compare prices from 8+ top stores in real-time</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Find the Best Price.
              <br />
              <span className="text-yellow-300">Save More Money.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl">
              Compare prices across Jumia, Konga, Amazon, AliExpress, and more. 
              We scan thousands of products every 30 minutes so you never overpay.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/search?q=iphone"
                className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 font-semibold px-8 py-4 rounded-full hover:bg-gray-100 transition-colors shadow-xl"
              >
                Start Comparing <ArrowRight size={18} />
              </Link>
              <Link
                to="/deals"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-full hover:bg-white/20 transition-colors border border-white/20"
              >
                <Zap size={18} /> View Hot Deals
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {[
              { label: 'Products Tracked', value: '50,000+', icon: BarChart3 },
              { label: 'Partner Stores', value: '8+', icon: Shield },
              { label: 'Prices Updated', value: 'Every 30min', icon: Clock },
              { label: 'Users Saved', value: '₦2.5B+', icon: TrendingUp },
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <stat.icon size={20} className="text-yellow-300 mb-2" />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Searches */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <span className="text-sm font-medium text-gray-500 shrink-0">Trending:</span>
          {trendingSearches.map((term, i) => (
            <Link
              key={i}
              to={`/search?q=${encodeURIComponent(term)}`}
              className="shrink-0 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
            >
              {term}
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
          <Link to="/categories" className="text-sm text-indigo-600 font-medium flex items-center gap-1 hover:underline">
            View All <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/search?category=${cat.id}`}
              className="bg-white rounded-2xl p-4 text-center hover:shadow-lg hover:border-indigo-200 border border-gray-100 transition-all group"
            >
              <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">{cat.icon}</span>
              <p className="text-xs font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">{cat.name}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{cat.count.toLocaleString()} items</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Partner Stores */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">We Compare Prices From</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stores.map(store => (
            <div key={store.id} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all flex items-center gap-3">
              <span className="text-3xl">{store.logo}</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{store.name}</p>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400 text-xs">★</span>
                  <span className="text-xs text-gray-500">{store.rating} • {store.country}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hot Deals */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Hot Deals</h2>
              <p className="text-sm text-gray-500">Biggest discounts right now</p>
            </div>
          </div>
          <Link to="/deals" className="text-sm text-indigo-600 font-medium flex items-center gap-1 hover:underline">
            See All <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {topDeals.map(({ product }) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">How PriceWise Works</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Save money in 3 simple steps. We do the hard work of comparing prices so you don't have to.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Search Your Product',
              description: 'Enter any product name, brand, or category. Our system searches across all partner stores simultaneously.',
              icon: '🔍',
              color: 'from-blue-500 to-indigo-500',
            },
            {
              step: '02',
              title: 'Compare Prices',
              description: 'See prices from all stores side by side. Filter by delivery time, seller rating, warranty, and shipping costs.',
              icon: '📊',
              color: 'from-purple-500 to-pink-500',
            },
            {
              step: '03',
              title: 'Buy & Save',
              description: 'Click through to the store with the best price. Complete your purchase directly on their platform. Simple!',
              icon: '💰',
              color: 'from-green-500 to-emerald-500',
            },
          ].map((item, i) => (
            <div key={i} className="relative bg-white rounded-3xl p-8 border border-gray-100 hover:shadow-xl transition-all group">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.color} opacity-5 rounded-bl-[3rem] rounded-tr-3xl`}></div>
              <span className="text-4xl mb-4 block">{item.icon}</span>
              <div className="text-xs font-bold text-indigo-600 mb-2">STEP {item.step}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* All Products */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Popular Products</h2>
          <div className="flex items-center gap-2">
            {['all', 'phones', 'laptops', 'electronics', 'gaming', 'fashion'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'
                }`}
              >
                {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          </div>
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Never Overpay Again</h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Join 100,000+ smart shoppers who save an average of ₦15,000 per purchase using PriceWise.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-white text-indigo-600 font-semibold px-8 py-4 rounded-full hover:bg-gray-100 transition-colors shadow-xl"
            >
              Get Started Free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
