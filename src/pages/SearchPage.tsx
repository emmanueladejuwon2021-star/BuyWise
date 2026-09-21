import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Grid, List, ChevronDown, X, TrendingDown } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { products, stores } from '../data/products';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const categoryFilter = searchParams.get('category') || '';
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxDeliveryDays, setMaxDeliveryDays] = useState(30);

  const filteredProducts = useMemo(() => {
    let results = [...products];

    // Search filter
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (categoryFilter) {
      results = results.filter(p => p.category === categoryFilter);
    }

    // Store filter
    if (selectedStores.length > 0) {
      results = results.filter(p =>
        p.listings.some(l => selectedStores.includes(l.store.id))
      );
    }

    // Rating filter
    if (ratingFilter > 0) {
      results = results.filter(p => {
        const maxRating = Math.max(...p.listings.map(l => l.rating));
        return maxRating >= ratingFilter;
      });
    }

    // In-stock filter
    if (inStockOnly) {
      results = results.filter(p => p.listings.some(l => l.inStock));
    }

    // Max delivery days filter
    if (maxDeliveryDays < 30) {
      results = results.filter(p => 
        p.listings.some(l => parseInt(l.deliveryDays) <= maxDeliveryDays)
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        results.sort((a, b) => {
          const aPrice = Math.min(...a.listings.map(l => l.currency === '₦' ? l.totalCost : l.totalCost * 1500));
          const bPrice = Math.min(...b.listings.map(l => l.currency === '₦' ? l.totalCost : l.totalCost * 1500));
          return aPrice - bPrice;
        });
        break;
      case 'price-high':
        results.sort((a, b) => {
          const aPrice = Math.max(...a.listings.map(l => l.currency === '₦' ? l.totalCost : l.totalCost * 1500));
          const bPrice = Math.max(...b.listings.map(l => l.currency === '₦' ? l.totalCost : l.totalCost * 1500));
          return bPrice - aPrice;
        });
        break;
      case 'discount':
        results.sort((a, b) => {
          const aDiscount = Math.max(...a.listings.map(l => l.discount));
          const bDiscount = Math.max(...b.listings.map(l => l.discount));
          return bDiscount - aDiscount;
        });
        break;
      case 'rating':
        results.sort((a, b) => {
          const aRating = Math.max(...a.listings.map(l => l.rating));
          const bRating = Math.max(...b.listings.map(l => l.rating));
          return bRating - aRating;
        });
        break;
      case 'delivery':
        results.sort((a, b) => {
          const aDelivery = Math.min(...a.listings.map(l => parseInt(l.deliveryDays)));
          const bDelivery = Math.min(...b.listings.map(l => parseInt(l.deliveryDays)));
          return aDelivery - bDelivery;
        });
        break;
      case 'best-value':
        results.sort((a, b) => {
          const aBest = Math.min(...a.listings.map(l => l.currency === '₦' ? l.totalCost : l.totalCost * 1500));
          const bBest = Math.min(...b.listings.map(l => l.currency === '₦' ? l.totalCost : l.totalCost * 1500));
          const aRating = Math.max(...a.listings.map(l => l.rating));
          const bRating = Math.max(...b.listings.map(l => l.rating));
          const aScore = (1000000 / aBest) * 0.5 + aRating * 0.5;
          const bScore = (1000000 / bBest) * 0.5 + bRating * 0.5;
          return bScore - aScore;
        });
        break;
      case 'stores':
        results.sort((a, b) => b.listings.length - a.listings.length);
        break;
    }

    return results;
  }, [query, categoryFilter, sortBy, selectedStores, ratingFilter, priceRange, inStockOnly, maxDeliveryDays]);

  const toggleStore = (storeId: string) => {
    setSelectedStores(prev =>
      prev.includes(storeId)
        ? prev.filter(s => s !== storeId)
        : [...prev, storeId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span>Home</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">
              {query ? `Results for "${query}"` : categoryFilter ? `Category: ${categoryFilter}` : 'All Products'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {query ? `Results for "${query}"` : 'All Products'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {filteredProducts.length} products found across {stores.length} stores
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium hover:border-indigo-300 transition-colors"
              >
                <SlidersHorizontal size={16} />
                Filters
              </button>
              <div className="hidden md:flex items-center gap-1 bg-white border border-gray-200 rounded-full p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-full transition-colors ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-full transition-colors ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto md:relative md:inset-auto md:z-auto md:bg-transparent md:p-0' : 'hidden'} md:block md:w-64 shrink-0`}>
            {showFilters && (
              <div className="flex items-center justify-between mb-6 md:hidden">
                <h3 className="text-lg font-bold">Filters</h3>
                <button onClick={() => setShowFilters(false)}>
                  <X size={24} />
                </button>
              </div>
            )}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-6 sticky top-24">
              {/* Sort */}
              <div>
                <h4 className="font-semibold text-sm text-gray-900 mb-3">Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Lowest Total Cost (incl. shipping)</option>
                  <option value="price-high">Highest Price</option>
                  <option value="discount">Biggest Discount</option>
                  <option value="rating">Highest Seller Rating</option>
                  <option value="delivery">Fastest Delivery</option>
                  <option value="best-value">Best Overall Value</option>
                  <option value="stores">Most Stores</option>
                </select>
              </div>

              {/* Stores */}
              <div>
                <h4 className="font-semibold text-sm text-gray-900 mb-3">Stores</h4>
                <div className="space-y-2">
                  {stores.map(store => (
                    <label key={store.id} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedStores.includes(store.id)}
                        onChange={() => toggleStore(store.id)}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                        {store.logo} {store.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <h4 className="font-semibold text-sm text-gray-900 mb-3">Minimum Rating</h4>
                <div className="flex gap-1">
                  {[0, 3, 3.5, 4, 4.5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setRatingFilter(rating)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        ratingFilter === rating
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {rating === 0 ? 'All' : `${rating}+★`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="font-semibold text-sm text-gray-900 mb-3">Price Range</h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="5000000"
                    step="50000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>₦0</span>
                    <span>₦{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {/* In-Stock Only */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-900">In Stock Only</span>
                </label>
              </div>

              {/* Max Delivery Time */}
              <div>
                <h4 className="font-semibold text-sm text-gray-900 mb-3">Max Delivery Time</h4>
                <div className="flex flex-wrap gap-1">
                  {[3, 5, 7, 14, 30].map(days => (
                    <button
                      key={days}
                      onClick={() => setMaxDeliveryDays(days)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        maxDeliveryDays === days
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {days === 30 ? 'Any' : `${days} days`}
                    </button>
                  ))}
                </div>
              </div>

              {(selectedStores.length > 0 || ratingFilter > 0 || inStockOnly || maxDeliveryDays < 30) && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-900 mb-3">Active Filters</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedStores.map(id => {
                      const store = stores.find(s => s.id === id);
                      return (
                        <button
                          key={id}
                          onClick={() => toggleStore(id)}
                          className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs"
                        >
                          {store?.name} <X size={12} />
                        </button>
                      );
                    })}
                    {ratingFilter > 0 && (
                      <button
                        onClick={() => setRatingFilter(0)}
                        className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs"
                      >
                        {ratingFilter}+ stars <X size={12} />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => { setSelectedStores([]); setRatingFilter(0); setInStockOnly(false); setMaxDeliveryDays(30); }}
                    className="mt-3 text-xs text-red-500 hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <Search size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
                <button
                  onClick={() => { setSelectedStores([]); setRatingFilter(0); setInStockOnly(false); setMaxDeliveryDays(30); }}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {/* Savings Banner */}
                {filteredProducts.length > 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
                    <TrendingDown size={20} className="text-green-600 shrink-0" />
                    <p className="text-sm text-green-800">
                      <strong>Smart Savings:</strong> Users who compared prices saved an average of <strong>18%</strong> on their purchases today.
                    </p>
                  </div>
                )}

                <div className={viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
                  : 'space-y-4'
                }>
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} view={viewMode} />
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
