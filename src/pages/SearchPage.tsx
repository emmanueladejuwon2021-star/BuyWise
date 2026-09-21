import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Grid, List, X, TrendingDown, Clock, Zap, Filter, ChevronDown, ChevronUp, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { search, SearchParams, SortMode, getCacheStats } from '../engine';
import { stores } from '../data/products';
import { useToast } from '../context/ToastContext';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const query = searchParams.get('q') || '';
  const categoryFilter = searchParams.get('category') || '';
  const storeFilter = searchParams.get('store') || '';
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortMode>('lowest_price');
  const [selectedStores, setSelectedStores] = useState<string[]>(storeFilter ? [storeFilter] : []);
  const [showFilters, setShowFilters] = useState(false);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxDeliveryDays, setMaxDeliveryDays] = useState(30);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Execute search using the engine
  const searchResult = useMemo(() => {
    const params: SearchParams = {
      q: query,
      category: categoryFilter || undefined,
      retailers: selectedStores.length > 0 ? selectedStores : undefined,
      inStockOnly: inStockOnly || undefined,
      minRating: ratingFilter > 0 ? ratingFilter : undefined,
      maxDeliveryDays: maxDeliveryDays < 30 ? maxDeliveryDays : undefined,
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < 5000000 ? priceRange[1] : undefined,
      sortBy,
      page: currentPage,
      limit: 12,
    };
    
    return search(params);
  }, [query, categoryFilter, selectedStores, inStockOnly, ratingFilter, maxDeliveryDays, priceRange, sortBy, currentPage]);

  const cacheStats = getCacheStats();

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, categoryFilter, selectedStores, inStockOnly, ratingFilter, maxDeliveryDays, priceRange, sortBy]);

  const toggleStore = (storeId: string) => {
    setSelectedStores(prev =>
      prev.includes(storeId) ? prev.filter(s => s !== storeId) : [...prev, storeId]
    );
  };

  const clearAllFilters = () => {
    setSelectedStores([]);
    setRatingFilter(0);
    setInStockOnly(false);
    setMaxDeliveryDays(30);
    setPriceRange([0, 5000000]);
    setSortBy('lowest_price');
    addToast('All filters cleared', 'info');
  };

  const hasActiveFilters = selectedStores.length > 0 || ratingFilter > 0 || inStockOnly || maxDeliveryDays < 30 || priceRange[0] > 0 || priceRange[1] < 5000000;

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        {/* Search Header */}
        <div className="mb-4 md:mb-6">
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 mb-2">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate">
              {query ? `Results for "${query}"` : categoryFilter ? `Category: ${categoryFilter}` : 'All Products'}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                {query ? `Results for "${query}"` : 'All Products'}
              </h1>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <p className="text-xs md:text-sm text-gray-500">
                  {searchResult.totalCount} products found
                </p>
                <span className="hidden md:inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  <Clock size={10} /> {searchResult.executionTimeMs}ms
                </span>
                {searchResult.cacheHit && (
                  <span className="hidden md:inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    <Zap size={10} /> Cached
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="md:hidden flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:border-indigo-300 transition-colors"
              >
                <Filter size={14} />
                Filters
                {hasActiveFilters && <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>}
              </button>
              <div className="hidden md:flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Filters Drawer */}
        {showMobileFilters && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileFilters(false)}>
            <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 space-y-5">
                <FilterControls
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  selectedStores={selectedStores}
                  toggleStore={toggleStore}
                  ratingFilter={ratingFilter}
                  setRatingFilter={setRatingFilter}
                  inStockOnly={inStockOnly}
                  setInStockOnly={setInStockOnly}
                  maxDeliveryDays={maxDeliveryDays}
                  setMaxDeliveryDays={setMaxDeliveryDays}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  facets={searchResult.facets}
                  hasActiveFilters={hasActiveFilters}
                  clearAllFilters={clearAllFilters}
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 md:gap-6">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5 sticky top-24">
              <FilterControls
                sortBy={sortBy}
                setSortBy={setSortBy}
                selectedStores={selectedStores}
                toggleStore={toggleStore}
                ratingFilter={ratingFilter}
                setRatingFilter={setRatingFilter}
                inStockOnly={inStockOnly}
                setInStockOnly={setInStockOnly}
                maxDeliveryDays={maxDeliveryDays}
                setMaxDeliveryDays={setMaxDeliveryDays}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                facets={searchResult.facets}
                hasActiveFilters={hasActiveFilters}
                clearAllFilters={clearAllFilters}
              />
              
              {/* Cache Stats */}
              <div className="pt-4 border-t">
                <p className="text-[10px] text-gray-400 uppercase font-medium mb-2">Engine Stats</p>
                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Cache Hit Rate</span>
                    <span className="font-medium text-green-600">{cacheStats.hitRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Response Time</span>
                    <span className="font-medium">{searchResult.executionTimeMs}ms</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1 min-w-0">
            {searchResult.results.length === 0 ? (
              <div className="text-center py-16 md:py-20 bg-white rounded-2xl border border-gray-100">
                <Search size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm">
                  Try adjusting your search or filters. Our engine searched across all stores but found no matches.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                {/* Summary Banner */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-3 md:p-4 mb-4 flex items-center gap-3">
                  <BarChart3 size={18} className="text-indigo-600 shrink-0 hidden sm:block" />
                  <p className="text-xs md:text-sm text-indigo-800">
                    <strong>Smart Comparison:</strong> Showing {searchResult.results.length} of {searchResult.totalCount} products.
                    Sorted by <strong>{sortBy.replace('_', ' ')}</strong>.
                    {searchResult.cacheHit && ' Results served from cache.'}
                  </p>
                </div>

                {/* Results Grid */}
                <div className={viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5'
                  : 'space-y-3 md:space-y-4'
                }>
                  {searchResult.results.map(product => (
                    <ProductCard key={product.id} product={product} view={viewMode} />
                  ))}
                </div>

                {/* Pagination */}
                {searchResult.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, searchResult.totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-indigo-600 text-white'
                              : 'border border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(searchResult.totalPages, p + 1))}
                      disabled={currentPage === searchResult.totalPages}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

// Filter Controls Component (shared between mobile drawer and desktop sidebar)
interface FilterControlsProps {
  sortBy: SortMode;
  setSortBy: (v: SortMode) => void;
  selectedStores: string[];
  toggleStore: (id: string) => void;
  ratingFilter: number;
  setRatingFilter: (v: number) => void;
  inStockOnly: boolean;
  setInStockOnly: (v: boolean) => void;
  maxDeliveryDays: number;
  setMaxDeliveryDays: (v: number) => void;
  priceRange: [number, number];
  setPriceRange: (v: [number, number]) => void;
  facets: any;
  hasActiveFilters: boolean;
  clearAllFilters: () => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  sortBy, setSortBy, selectedStores, toggleStore, ratingFilter, setRatingFilter,
  inStockOnly, setInStockOnly, maxDeliveryDays, setMaxDeliveryDays, priceRange,
  setPriceRange, facets, hasActiveFilters, clearAllFilters,
}) => {
  return (
    <>
      {/* Sort */}
      <div>
        <h4 className="font-semibold text-sm text-gray-900 mb-2">Sort By</h4>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortMode)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500"
        >
          <option value="lowest_price">Lowest Total Cost</option>
          <option value="rating">Highest Seller Rating</option>
          <option value="fastest_delivery">Fastest Delivery</option>
          <option value="best_value">Best Overall Value</option>
        </select>
      </div>

      {/* Stores */}
      <div>
        <h4 className="font-semibold text-sm text-gray-900 mb-2">
          Stores {selectedStores.length > 0 && <span className="text-indigo-600">({selectedStores.length})</span>}
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {stores.map(store => (
            <label key={store.id} className="flex items-center gap-2 cursor-pointer group py-0.5">
              <input
                type="checkbox"
                checked={selectedStores.includes(store.id)}
                onChange={() => toggleStore(store.id)}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                {store.logo} {store.name}
              </span>
              {facets?.retailers && (
                <span className="text-xs text-gray-400 ml-auto">
                  {facets.retailers.find((r: any) => r.id === store.id)?.count || 0}
                </span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h4 className="font-semibold text-sm text-gray-900 mb-2">Min Seller Rating</h4>
        <div className="flex flex-wrap gap-1.5">
          {[0, 3, 3.5, 4, 4.5].map(rating => (
            <button
              key={rating}
              onClick={() => setRatingFilter(rating)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                ratingFilter === rating ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {rating === 0 ? 'All' : `${rating}+★`}
            </button>
          ))}
        </div>
      </div>

      {/* In Stock */}
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

      {/* Delivery */}
      <div>
        <h4 className="font-semibold text-sm text-gray-900 mb-2">Max Delivery Time</h4>
        <div className="flex flex-wrap gap-1.5">
          {[1, 3, 5, 7, 14, 30].map(days => (
            <button
              key={days}
              onClick={() => setMaxDeliveryDays(days)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                maxDeliveryDays === days ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {days === 1 ? 'Same Day' : days === 30 ? 'Any' : `≤${days}d`}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-semibold text-sm text-gray-900 mb-2">Price Range</h4>
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
            <span>₦{(priceRange[1] / 1000000).toFixed(1)}M</span>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="pt-3 border-t">
          <button
            onClick={clearAllFilters}
            className="text-xs text-red-500 hover:underline font-medium"
          >
            ✕ Clear all filters
          </button>
        </div>
      )}
    </>
  );
};

export default SearchPage;
