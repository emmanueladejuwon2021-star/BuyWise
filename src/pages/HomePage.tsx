import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Clock, Search, ChevronRight, Scale, Tag, Truck, Zap } from 'lucide-react';
import { categories, stores } from '../data/products';

const HomePage: React.FC = () => {
  const [homeQuery, setHomeQuery] = useState('');
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-5">
              <span className="text-sm text-white/90">Price comparison for Nigerian shoppers</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Find a fair price.
              <br />
              <span className="text-yellow-300">Before you buy.</span>
            </h1>
            <p className="text-base sm:text-lg text-white/85 mb-8 max-w-xl leading-relaxed">
              Search a product, then compare live offers from stores such as Jumia and Konga.
              Catalog numbers stay empty until a real search or a store listing comes in.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const q = homeQuery.trim();
                navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
              }}
              className="flex flex-col sm:flex-row gap-2 mb-4 max-w-xl"
            >
              <input
                value={homeQuery}
                onChange={(e) => setHomeQuery(e.target.value)}
                placeholder="Try a product name"
                className="flex-1 px-4 py-3 rounded-full text-gray-900 text-base outline-none"
              />
              <button type="submit" className="px-6 py-3 bg-yellow-300 text-indigo-900 font-semibold rounded-full">
                Search
              </button>
            </form>
            <div className="flex flex-row items-center gap-3 flex-wrap">
              <Link
                to="/search"
                className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 font-semibold px-6 py-3 text-sm sm:text-base rounded-full hover:bg-gray-100 transition-colors shadow-sm"
              >
                Open search page <ArrowRight size={18} />
              </Link>
              <Link
                to="/store/register"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white font-semibold px-6 py-3 text-sm sm:text-base rounded-full hover:bg-white/20 transition-colors border border-white/20"
              >
                List your store
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
            {[
              { label: 'Products listed', value: 'None yet', icon: Search, note: 'Filled after a live search' },
              { label: 'Stores you can search', value: `${stores.length || 0}`, icon: Shield, note: 'Names of stores we can query' },
              { label: 'Price updates', value: 'On search', icon: Clock, note: 'No fake refresh timer' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                <stat.icon size={20} className="text-yellow-300 mb-2" />
                <p className="text-xl sm:text-2xl font-bold text-white leading-tight">{stat.value}</p>
                <p className="text-sm text-white/80 mt-1">{stat.label}</p>
                <p className="text-xs text-white/60 mt-1">{stat.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/compare" className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-200 hover:border-indigo-400 hover:shadow-sm transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Scale size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Compare items</h3>
              <p className="text-sm text-gray-500 mt-0.5">Place two to four products side by side</p>
            </div>
          </Link>
          <Link to="/coupons" className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-200 hover:border-yellow-400 hover:shadow-sm transition-all">
            <div className="w-12 h-12 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0">
              <Tag size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Promo codes</h3>
              <p className="text-sm text-gray-500 mt-0.5">Only codes that stores add themselves</p>
            </div>
          </Link>
          <Link to="/shipping-calculator" className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Truck size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Shipping estimate</h3>
              <p className="text-sm text-gray-500 mt-0.5">Add delivery cost before you decide</p>
            </div>
          </Link>
          <Link to="/deals" className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-200 hover:border-red-400 hover:shadow-sm transition-all">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <Zap size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Deals</h3>
              <p className="text-sm text-gray-500 mt-0.5">Shows up when a real discount is listed</p>
            </div>
          </Link>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Shop by category</h2>
          <Link to="/categories" className="text-sm sm:text-base text-indigo-600 font-medium flex items-center gap-1 hover:underline">
            View all <ChevronRight size={18} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/search?q=${encodeURIComponent(cat.name)}&category=${cat.id}`}
              className="bg-white rounded-2xl p-5 text-center hover:shadow-md hover:border-indigo-200 border border-gray-100 transition-all"
            >
              <span className="text-3xl mb-3 block">{cat.icon}</span>
              <p className="text-sm font-medium text-gray-800">{cat.name}</p>
              <p className="text-xs text-gray-400 mt-1">No listings yet</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Stores we can search</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {stores.map(store => (
            <Link
              key={store.id}
              to={`/search?q=${encodeURIComponent(store.name)}&store=${store.id}`}
              className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-sm hover:border-indigo-200 transition-all flex items-center gap-4"
            >
              <span className="text-3xl shrink-0">{store.logo}</span>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-base truncate">{store.name}</p>
                <p className="text-sm text-gray-500 truncate">{store.country}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Hot deals</h2>
        <p className="text-base text-gray-500 mb-6">Deals appear here after products are listed or found in search.</p>
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl px-6 py-14 text-center">
          <p className="text-lg font-semibold text-gray-800">No deals on file</p>
          <p className="text-base text-gray-500 mt-2 max-w-md mx-auto">
            We are not showing sample phones or fake discounts. Search a product or wait for a store to add stock.
          </p>
          <Link to="/search" className="inline-flex items-center gap-2 mt-6 text-indigo-600 font-semibold">
            Go to search <ArrowRight size={18} />
          </Link>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">How it works</h2>
          <p className="text-base text-gray-500 max-w-xl mx-auto">Three steps. No made-up catalog behind them.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { step: '1', title: 'Search a product', description: 'Type a name or brand. Results come from a live store search when the back end is running.' },
            { step: '2', title: 'Compare offers', description: 'Read price, delivery, and seller side by side. Empty lists stay empty instead of filling with sample items.' },
            { step: '3', title: 'Open the store', description: 'Leave this site to finish the buy on the store page. Commission only works after a real partner link is set.' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="text-sm font-bold text-indigo-600 mb-2">STEP {item.step}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-base text-gray-500 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Popular products</h2>
        <p className="text-base text-gray-500 mb-6">This list is empty on purpose. Sample iPhones and laptops were removed.</p>
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl px-6 py-14 text-center">
          <p className="text-lg font-semibold text-gray-800">No products stored yet</p>
          <p className="text-base text-gray-500 mt-2">Use search, or register a store and add a real item.</p>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-8 sm:p-10">
          <p className="text-sm text-white/80 font-medium mb-3">For store owners</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">List your store when you are ready</h2>
          <p className="text-white/85 mb-6 text-base max-w-2xl leading-relaxed">
            There is no paid traffic yet. Register if you want a profile ready for later. Do not expect shopper volume today.
          </p>
          <Link to="/store/register" className="inline-flex items-center gap-2 bg-white text-indigo-600 font-semibold px-6 py-3 text-base rounded-full hover:bg-gray-100 transition-colors">
            Register your store <ArrowRight size={18} />
          </Link>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-16">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Create a free account</h2>
          <p className="text-white/85 mb-6 text-base max-w-lg mx-auto leading-relaxed">
            Watchlists and alerts need a sign-in. We do not claim a large user base.
          </p>
          <Link to="/signup" className="inline-flex items-center gap-2 bg-white text-indigo-600 font-semibold px-6 py-3 text-base rounded-full hover:bg-gray-100 transition-colors">
            Sign up <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
