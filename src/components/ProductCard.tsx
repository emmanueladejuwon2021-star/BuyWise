import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, TrendingDown, Clock, Store, Zap, Shield, AlertTriangle } from 'lucide-react';
import { Product } from '../types';
import { MasterProduct } from '../engine';
import { useAuth } from '../context/AuthContext';
import { getBestDeal } from '../data/products';
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

  const formatPrice = (price: number, currency: string) => {
    if (currency === '₦') return `₦${price.toLocaleString()}`;
    return `$${price.toLocaleString()}`;
  };

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
      <Link to={`/product/${productId}`} className="block bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          <div className="relative sm:w-48 h-40 sm:h-auto shrink-0">
            <img src={productImage} alt={productName} className="w-full h-full object-cover" />
            {bestListing.discount > 10 && (
              <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                -{bestListing.discount}%
              </span>
            )}
            <button
              onClick={handleWatchlistToggle}
              className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                inWatchlist ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <Heart size={14} fill={inWatchlist ? 'currentColor' : 'none'} />
            </button>
          </div>
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-indigo-600 font-medium mb-0.5">{productBrand}</p>
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 mb-1">{productName}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-0.5">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-medium">{avgRating.toFixed(1)}</span>
                  </div>
                  <span className="text-xs text-gray-400">({reviewCount})</span>
                  <span className="text-xs text-gray-300">•</span>
                  <span className="text-xs text-gray-500">{allListings.length} stores</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] text-gray-400 mb-0.5">Best at {bestListing.store.name}</p>
                <p className="text-lg font-bold text-gray-900">{formatPrice(bestListing.totalCost || bestListing.price, bestListing.currency)}</p>
                {savings > 0 && (
                  <p className="text-[10px] text-green-600 font-medium flex items-center justify-end gap-0.5">
                    <TrendingDown size={10} /> Save {formatPrice(savings, bestListing.currency)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t overflow-x-auto">
              {allListings.slice(0, 5).map((listing, i) => (
                <span key={i} className="shrink-0 flex items-center gap-1 text-[10px] bg-gray-50 px-1.5 py-0.5 rounded-full">
                  <span>{listing.store.logo}</span>
                  <span className="text-gray-600">{formatPrice(listing.price, listing.currency)}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid view
  return (
    <Link to={`/product/${productId}`} className="group bg-white rounded-2xl border border-gray-100 hover:shadow-xl hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img src={productImage} alt={productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {bestListing.discount > 10 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
            -{bestListing.discount}%
          </span>
        )}
        {productTags.includes('bestseller') && (
          <span className="absolute top-2 left-2 mt-6 bg-yellow-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
            BESTSELLER
          </span>
        )}
        <button
          onClick={handleWatchlistToggle}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${
            inWatchlist ? 'bg-red-500 text-white scale-110' : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500 hover:scale-110'
          }`}
        >
          <Heart size={14} fill={inWatchlist ? 'currentColor' : 'none'} />
        </button>
        {/* Store badges */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1 flex-wrap">
          {allListings.slice(0, 3).map((listing, i) => (
            <span key={i} className="bg-white/90 backdrop-blur-sm text-[9px] font-medium px-1.5 py-0.5 rounded-full shadow-sm">
              {listing.store.logo} {listing.store.name}
            </span>
          ))}
          {allListings.length > 3 && (
            <span className="bg-white/90 backdrop-blur-sm text-[9px] font-medium px-1.5 py-0.5 rounded-full shadow-sm text-indigo-600">
              +{allListings.length - 3}
            </span>
          )}
        </div>
        {/* Stale indicator */}
        {staleCount > 0 && (
          <div className="absolute top-2 right-11 bg-amber-100 text-amber-700 p-1 rounded-full" title={`${staleCount} prices not updated in 24h`}>
            <AlertTriangle size={10} />
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-[10px] text-indigo-600 font-medium">{productBrand}</p>
        <h3 className="font-semibold text-gray-900 text-xs line-clamp-2 my-1 group-hover:text-indigo-600 transition-colors min-h-[2rem]">
          {productName}
        </h3>
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={10} className={i < Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
            ))}
          </div>
          <span className="text-[10px] text-gray-500">({reviewCount})</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-bold text-gray-900">{formatPrice(bestListing.totalCost || bestListing.price, bestListing.currency)}</p>
            <p className="text-[9px] text-gray-400">incl. shipping</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-500 flex items-center gap-0.5 justify-end">
              <Store size={9} /> {allListings.length} stores
            </p>
            <p className="text-[10px] text-green-600 font-medium flex items-center gap-0.5 justify-end">
              <Clock size={9} /> {bestListing.lastUpdated}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
