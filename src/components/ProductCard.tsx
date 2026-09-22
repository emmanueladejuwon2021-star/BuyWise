import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, TrendingDown, Clock, Store, Zap, Shield, AlertTriangle, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { MasterProduct } from '../engine';
import { useAuth } from '../context/AuthContext';
import { useRegion } from '../context/RegionContext';
import { predictPriceTrajectory } from '../utils/pricePredictor';
import { calculateTotalPrice, isPriceStale, computeSummaryTags, sortListings } from '../engine';

interface ProductCardProps {
  product: Product | MasterProduct;
  view?: 'grid' | 'list';
}

// Type guard
function isMasterProduct(p: Product | MasterProduct): p is MasterProduct {
  return 'canonicalTitle' in p && 'allListings' in p;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, view = 'grid' }) => {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, isAuthenticated } = useAuth();
  const { formatPrice } = useRegion();
  
  // Normalize to common interface
  const productId = isMasterProduct(product) ? product.sourceProducts[0]?.id || product.id : product.id;
  const productName = isMasterProduct(product) ? product.canonicalTitle : product.name;
  const productBrand = product.brand;
  const productImage = isMasterProduct(product) ? product.images[0] : product.images[0];
  const productTags = product.tags;
  const allListings = isMasterProduct(product) ? product.allListings : product.listings;
  
  const inWatchlist = isInWatchlist(productId);

  // Get best deal using engine
  const sortedListings = sortListings(allListings, 'lowest_price');
  const taggedListings = computeSummaryTags(sortedListings);
  const bestListing = taggedListings[0];
  
  // Calculate savings
  const allTotals = allListings.map(l => calculateTotalPrice(l));
  const minTotal = Math.min(...allTotals);
  const maxTotal = Math.max(...allTotals);
  const savings = maxTotal - minTotal;

  // AI Price Prediction
  const prediction = predictPriceTrajectory(
    bestListing.price,
    [],
    bestListing.discount || 0,
    product.category
  );

  const avgRating = isMasterProduct(product) 
    ? product.avgRating 
    : product.ratings.reduce((sum, r) => sum + r.rating, 0) / product.ratings.length;
  
  const reviewCount = isMasterProduct(product) 
    ? product.totalReviews 
    : product.ratings.length;

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    if (inWatchlist) removeFromWatchlist(productId);
    else addToWatchlist(productId);
  };

  const staleCount = allListings.filter(l => isPriceStale(l)).length;

  if (view === 'list') {
    return (
      <Link to={`/product/${productId}`} className="block bg-white rounded-xl sm:rounded-2xl border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all duration-300 overflow-hidden">
        <div className="flex flex-row">
          <div className="relative w-28 sm:w-44 h-28 sm:h-auto shrink-0 bg-gray-50">
            <img src={productImage} alt={productName} className="w-full h-full object-cover" />
            {bestListing.discount > 10 && (
              <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                -{bestListing.discount}%
              </span>
            )}
            <button
              onClick={handleWatchlistToggle}
              aria-label="Save to watchlist"
              className={`absolute top-1.5 right-1.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all ${
                inWatchlist ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <Heart size={12} fill={inWatchlist ? 'currentColor' : 'none'} />
            </button>
          </div>
          <div className="flex-1 p-2.5 sm:p-4 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-[10px] sm:text-xs text-indigo-600 font-medium truncate">{productBrand}</p>
                    <span className={`text-[8px] sm:text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                      prediction.recommendation === 'BUY_NOW'
                        ? 'bg-green-100 text-green-700'
                        : prediction.recommendation === 'WAIT'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-50 text-blue-700'
                    }`}>
                      {prediction.recommendation === 'BUY_NOW' ? '⚡ Buy Now' : prediction.recommendation === 'WAIT' ? '⏳ Wait' : 'Fair Price'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-xs sm:text-sm line-clamp-1">{productName}</h3>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs sm:text-base font-bold text-gray-900">{formatPrice(bestListing.totalCost || bestListing.price, bestListing.currency)}</p>
                  <p className="text-[9px] text-gray-400 hidden sm:block">Best at {bestListing.store.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 my-1">
                <div className="flex items-center gap-0.5">
                  <Star size={11} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-[11px] font-medium">{avgRating.toFixed(1)}</span>
                </div>
                <span className="text-[10px] text-gray-400">({reviewCount})</span>
                <span className="text-gray-300 text-[10px]">•</span>
                <span className="text-[10px] text-gray-500">{allListings.length} stores</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-gray-50 text-[10px]">
              <span className="text-gray-500 truncate max-w-[140px] sm:max-w-none">
                {bestListing.store.logo} <span className="font-medium text-gray-700">{bestListing.store.name}</span>
              </span>
              {savings > 0 && (
                <span className="text-green-600 font-medium flex items-center gap-0.5 shrink-0">
                  <TrendingDown size={10} /> Save {formatPrice(savings, bestListing.currency)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid view
  return (
    <Link to={`/product/${productId}`} className="group bg-white rounded-xl sm:rounded-2xl border border-gray-100 hover:shadow-md hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col justify-between">
      <div>
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <img src={productImage} alt={productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {bestListing.discount > 10 && (
            <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-xs">
              -{bestListing.discount}%
            </span>
          )}
          {/* AI Price Prediction Pill */}
          <span className={`absolute top-1.5 left-1.5 mt-5 text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-xs backdrop-blur-md ${
            prediction.recommendation === 'BUY_NOW'
              ? 'bg-emerald-600/90 text-white'
              : prediction.recommendation === 'WAIT'
              ? 'bg-amber-500/90 text-white'
              : 'bg-indigo-600/90 text-white'
          }`}>
            {prediction.recommendation === 'BUY_NOW' ? '⚡ BUY NOW' : prediction.recommendation === 'WAIT' ? '⏳ WAIT' : 'FAIR'}
          </span>
          <button
            onClick={handleWatchlistToggle}
            aria-label="Save to watchlist"
            className={`absolute top-1.5 right-1.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shadow-xs transition-all ${
              inWatchlist ? 'bg-red-500 text-white scale-105' : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500'
            }`}
          >
            <Heart size={12} fill={inWatchlist ? 'currentColor' : 'none'} />
          </button>
          {/* Store badges (deduplicated by store) */}
          <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center gap-1 flex-wrap">
            {Array.from(new Map(allListings.map(l => [l.store.id, l])).values())
              .slice(0, 3)
              .map((listing, i) => (
                <span key={i} className="bg-white/90 backdrop-blur-sm text-[8px] sm:text-[9px] font-medium px-1 sm:px-1.5 py-0.5 rounded-full shadow-xs truncate max-w-[90px]">
                  {listing.store.logo} {listing.store.name}
                </span>
              ))}
            {new Set(allListings.map(l => l.store.id)).size > 3 && (
              <span className="bg-white/90 backdrop-blur-sm text-[8px] sm:text-[9px] font-medium px-1 py-0.5 rounded-full shadow-xs text-indigo-600 font-bold">
                +{new Set(allListings.map(l => l.store.id)).size - 3}
              </span>
            )}
          </div>
          {/* Stale indicator */}
          {staleCount > 0 && (
            <div className="absolute top-1.5 right-8 sm:right-9 bg-amber-100 text-amber-700 p-0.5 sm:p-1 rounded-full" title={`${staleCount} prices not updated in 24h`}>
              <AlertTriangle size={9} />
            </div>
          )}
        </div>
        <div className="p-2 sm:p-3">
          <p className="text-[9px] sm:text-[10px] text-indigo-600 font-medium truncate">{productBrand}</p>
          <h3 className="font-semibold text-gray-900 text-[11px] sm:text-xs line-clamp-2 my-0.5 group-hover:text-indigo-600 transition-colors min-h-[1.75rem] leading-snug">
            {productName}
          </h3>
          <div className="flex items-center gap-1 my-1">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={9} className={i < Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
              ))}
            </div>
            <span className="text-[9px] sm:text-[10px] text-gray-500">({reviewCount})</span>
          </div>
        </div>
      </div>
      <div className="px-2 pb-2 sm:px-3 sm:pb-3 pt-0 border-t border-gray-50">
        <div className="flex items-end justify-between pt-1">
          <div>
            <p className="text-xs sm:text-sm font-bold text-gray-900">{formatPrice(bestListing.totalCost || bestListing.price, bestListing.currency)}</p>
            <p className="text-[8px] sm:text-[9px] text-gray-400">incl. shipping</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] sm:text-[10px] text-gray-500 flex items-center gap-0.5 justify-end">
              <Store size={8} /> {allListings.length} stores
            </p>
            <p className="text-[8px] sm:text-[9px] text-green-600 font-medium flex items-center gap-0.5 justify-end">
              <Clock size={8} /> {bestListing.lastUpdated}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
