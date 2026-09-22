import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Scale, Plus, X, Check, ArrowRight, ExternalLink, 
  Sparkles, Star, Shield, Truck, DollarSign, Award, ChevronDown 
} from 'lucide-react';
import { products, getBestDeal } from '../data/products';
import { useRegion } from '../context/RegionContext';
import { useToast } from '../context/ToastContext';
import { Product } from '../types';

const ComparePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { formatPrice } = useRegion();
  const { addToast } = useToast();

  // Get initial product IDs from query string or default to first 2 products
  const productIdsParam = searchParams.get('ids');
  const initialIds = productIdsParam ? productIdsParam.split(',') : ['1', '2'];

  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Synchronize search params with selectedIds
  const updateSelectedIds = (newIds: string[]) => {
    setSelectedIds(newIds);
    setSearchParams({ ids: newIds.join(',') });
  };

  const comparedProducts = useMemo(() => {
    return selectedIds
      .map(id => products.find(p => p.id === id))
      .filter((p): p is Product => Boolean(p));
  }, [selectedIds]);

  const handleRemove = (id: string) => {
    if (selectedIds.length <= 1) {
      addToast('Keep at least 1 product to compare', 'info');
      return;
    }
    const filtered = selectedIds.filter(item => item !== id);
    updateSelectedIds(filtered);
    addToast('Product removed from comparison', 'info');
  };

  const handleAddProduct = (id: string) => {
    if (selectedIds.includes(id)) {
      addToast('Product is already in comparison', 'info');
      return;
    }
    if (selectedIds.length >= 4) {
      addToast('You can compare up to 4 products at once', 'warning');
      return;
    }
    const updated = [...selectedIds, id];
    updateSelectedIds(updated);
    setShowAddModal(false);
    addToast('Product added to comparison!', 'success');
  };

  // Find overall lowest price among compared
  const lowestOverallPrice = useMemo(() => {
    if (comparedProducts.length === 0) return 0;
    return Math.min(...comparedProducts.map(p => getBestDeal(p).listing.price));
  }, [comparedProducts]);

  // Aggregate all unique specification keys
  const allSpecKeys = useMemo(() => {
    const keysSet = new Set<string>();
    comparedProducts.forEach(p => {
      Object.keys(p.specifications || {}).forEach(k => keysSet.add(k));
    });
    return Array.from(keysSet);
  }, [comparedProducts]);

  // Dynamic grid template based on number of products compared
  const gridTemplate = {
    gridTemplateColumns: `minmax(110px, 140px) repeat(${Math.max(1, comparedProducts.length)}, minmax(160px, 1fr))`,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-3 sm:py-6 px-2.5 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1">
              <Scale size={13} /> Product Comparison
            </div>
            <h1 className="text-lg sm:text-xl font-black text-gray-900">Compare Products & Prices</h1>
            <p className="text-[11px] sm:text-xs text-gray-500">
              Compare features, store pricing, and specs across up to 4 items simultaneously.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {selectedIds.length < 4 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus size={14} /> Add Product ({selectedIds.length}/4)
              </button>
            )}
          </div>
        </div>

        {comparedProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 sm:p-8 text-center border border-gray-100 shadow-sm">
            <Scale size={36} className="mx-auto text-gray-300 mb-2.5" />
            <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-1">No products selected</h3>
            <p className="text-xs text-gray-500 mb-3.5">Select items to view their price differences and specs.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
            >
              Choose Products
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto pb-2 scrollbar-thin">
            <div
              className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-xs divide-y divide-gray-100"
              style={{ minWidth: `${Math.max(340, 140 + comparedProducts.length * 160)}px` }}
            >
              {/* Product Cards Top Row */}
              <div className="grid p-3 sm:p-4 bg-gray-50/70 rounded-t-xl sm:rounded-t-2xl" style={gridTemplate}>
                <div className="sticky left-0 bg-gray-50/95 backdrop-blur-xs z-10 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center pr-2">
                  Product
                </div>
                {comparedProducts.map(product => {
                  const { listing } = getBestDeal(product);
                  const isLowest = listing.price === lowestOverallPrice;

                  return (
                    <div key={product.id} className="px-2.5 relative flex flex-col justify-between">
                      <button
                        onClick={() => handleRemove(product.id)}
                        className="absolute top-0 right-1 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
                        title="Remove product"
                      >
                        <X size={14} />
                      </button>

                      <div>
                        {isLowest && (
                          <span className="inline-block bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full mb-1">
                            ★ Lowest Price
                          </span>
                        )}
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto mb-1.5 rounded-lg bg-white p-1"
                        />
                        <Link
                          to={`/product/${product.id}`}
                          className="text-xs font-bold text-gray-900 hover:text-indigo-600 line-clamp-2 transition-colors"
                        >
                          {product.name}
                        </Link>
                        <p className="text-[10px] text-gray-500">{product.brand}</p>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-gray-100">
                        <p className="text-xs sm:text-sm font-black text-indigo-600">
                          {formatPrice(listing.price, '₦')}
                        </p>
                        <p className="text-[10px] text-gray-500 flex items-center gap-1 truncate">
                          on <span className="font-semibold text-gray-700">{listing.store.name}</span>
                        </p>
                        <Link
                          to={`/product/${product.id}`}
                          className="mt-1.5 inline-flex items-center justify-center w-full py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg transition-colors"
                        >
                          View Stores →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Stores & Availability Row */}
              <div className="grid p-3 text-xs items-center" style={gridTemplate}>
                <div className="sticky left-0 bg-white/95 backdrop-blur-xs z-10 font-semibold text-gray-500 flex items-center gap-1.5 text-[11px] pr-2">
                  <Truck size={13} className="text-gray-400" /> Best Store
                </div>
                {comparedProducts.map(p => {
                  const { listing } = getBestDeal(p);
                  return (
                    <div key={p.id} className="px-2.5">
                      <p className="font-bold text-gray-900 text-xs">{listing.store.name}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{listing.deliveryDays}</p>
                      <span className={`inline-block text-[9px] font-semibold mt-1 px-1.5 py-0.5 rounded ${
                        listing.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {listing.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Number of Stores Selling Row */}
              <div className="grid p-3 text-xs items-center" style={gridTemplate}>
                <div className="sticky left-0 bg-white/95 backdrop-blur-xs z-10 font-semibold text-gray-500 flex items-center gap-1.5 text-[11px] pr-2">
                  <DollarSign size={13} className="text-gray-400" /> Stores
                </div>
                {comparedProducts.map(p => (
                  <div key={p.id} className="px-2.5 font-semibold text-gray-700 text-xs">
                    {p.listings.length} stores tracked
                  </div>
                ))}
              </div>

              {/* Ratings Row */}
              <div className="grid p-3 text-xs items-center" style={gridTemplate}>
                <div className="sticky left-0 bg-white/95 backdrop-blur-xs z-10 font-semibold text-gray-500 flex items-center gap-1.5 text-[11px] pr-2">
                  <Star size={13} className="text-amber-500" /> Rating
                </div>
                {comparedProducts.map(p => {
                  const avgRating = p.ratings && p.ratings.length > 0
                    ? (p.ratings.reduce((sum, r) => sum + r.rating, 0) / p.ratings.length).toFixed(1)
                    : '4.5';
                  return (
                    <div key={p.id} className="px-2.5 flex items-center gap-1 text-gray-800 font-bold text-xs">
                      <span className="text-amber-500">★</span> {avgRating}
                      <span className="text-gray-400 font-normal text-[10px]">({p.ratings?.length || 12})</span>
                    </div>
                  );
                })}
              </div>

              {/* Specifications Header */}
              <div className="p-2.5 bg-gray-100/70 font-bold text-[11px] text-gray-700 uppercase tracking-wider">
                Specifications
              </div>

              {/* Dynamic Specifications Rows */}
              {allSpecKeys.map(specKey => (
                <div key={specKey} className="grid p-2.5 sm:p-3 text-xs items-center hover:bg-gray-50/70 transition-colors" style={gridTemplate}>
                  <div className="sticky left-0 bg-white/95 backdrop-blur-xs z-10 font-semibold text-gray-600 capitalize text-[11px] pr-2">
                    {specKey.replace(/([A-Z])/g, ' $1')}
                  </div>
                  {comparedProducts.map(p => (
                    <div key={p.id} className="px-2.5 text-gray-800 font-medium text-xs">
                      {p.specifications?.[specKey] || '—'}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-gray-100 max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                <h3 className="font-bold text-gray-900 text-sm">Add Product to Compare</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                >
                  ✕
                </button>
              </div>

              <input
                type="text"
                placeholder="Search products to add..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs mb-3 outline-none focus:border-indigo-500"
              />

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {products
                  .filter(p => !selectedIds.includes(p.id))
                  .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.includes(searchQuery.toLowerCase()))
                  .map(prod => {
                    const { listing } = getBestDeal(prod);
                    return (
                      <div
                        key={prod.id}
                        onClick={() => handleAddProduct(prod.id)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50/70 border border-gray-100 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={prod.images[0]}
                            alt={prod.name}
                            className="w-10 h-10 object-contain rounded-md bg-white p-1"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">{prod.name}</p>
                            <p className="text-[11px] text-indigo-600 font-semibold">{formatPrice(listing.price, '₦')}</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-bold shrink-0">
                          + Add
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparePage;
