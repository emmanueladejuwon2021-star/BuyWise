import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, TrendingDown, Clock, Store } from 'lucide-react';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { getBestDeal } from '../data/products';

interface ProductCardProps {
  product: Product;
  view?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, view = 'grid' }) => {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, isAuthenticated } = useAuth();
  const inWatchlist = isInWatchlist(product.id);
  const { listing: bestListing, savings } = getBestDeal(product);

  const formatPrice = (price: number, currency: string) => {
    if (currency === '₦') {
      return `₦${price.toLocaleString()}`;
    }
    return `$${price.toLocaleString()}`;
  };

  const avgRating = product.ratings.reduce((sum, r) => sum + r.rating, 0) / product.ratings.length;

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    if (inWatchlist) {
      removeFromWatchlist(product.id);
    } else {
      addToWatchlist(product.id);
    }
  };

  if (view === 'list') {
    return (
      <Link to={`/product/${product.id}`} className="block bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          <div className="relative sm:w-56 h-48 sm:h-auto shrink-0">
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            {bestListing.discount > 10 && (
              <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                -{bestListing.discount}%
              </span>
            )}
            <button
              onClick={handleWatchlistToggle}
              className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                inWatchlist ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <Heart size={16} fill={inWatchlist ? 'currentColor' : 'none'} />
            </button>
          </div>
          <div className="flex-1 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs text-indigo-600 font-medium mb-1">{product.brand}</p>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{product.description}</p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
                  </div>
                  <span className="text-xs text-gray-400">({product.ratings.length} reviews)</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-gray-500 mb-1">Best total at {bestListing.store.name}</p>
                <p className="text-xl font-bold text-gray-900">{formatPrice(bestListing.totalCost, bestListing.currency)}</p>
                {bestListing.originalPrice > bestListing.price && (
                  <p className="text-sm text-gray-400 line-through">{formatPrice(bestListing.originalPrice, bestListing.currency)}</p>
                )}
                {savings > 0 && (
                  <p className="text-xs text-green-600 font-medium mt-1 flex items-center justify-end gap-1">
                    <TrendingDown size={12} />
                    Save up to {formatPrice(savings, bestListing.currency)}
                  </p>
                )}
                <p className="text-[10px] text-gray-400 mt-1">incl. shipping • {bestListing.deliveryDays}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t">
              {product.listings.slice(0, 4).map((listing, i) => (
                <div key={i} className="flex items-center gap-1 text-xs bg-gray-50 px-2 py-1 rounded-full">
                  <span>{listing.store.logo}</span>
                  <span className="text-gray-600">{formatPrice(listing.price, listing.currency)}</span>
                </div>
              ))}
              {product.listings.length > 4 && (
                <span className="text-xs text-indigo-600 font-medium">+{product.listings.length - 4} more</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/product/${product.id}`} className="group bg-white rounded-2xl border border-gray-100 hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {bestListing.discount > 10 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
            -{bestListing.discount}%
          </span>
        )}
        {product.tags.includes('new') && (
          <span className="absolute top-3 left-3 mt-8 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
            NEW
          </span>
        )}
        <button
          onClick={handleWatchlistToggle}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all ${
            inWatchlist ? 'bg-red-500 text-white scale-110' : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500 hover:scale-110'
          }`}
        >
          <Heart size={16} fill={inWatchlist ? 'currentColor' : 'none'} />
        </button>
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5">
          {product.listings.slice(0, 3).map((listing, i) => (
            <span key={i} className="bg-white/90 backdrop-blur-sm text-[10px] font-medium px-1.5 py-0.5 rounded-full shadow-sm">
              {listing.store.logo} {listing.store.name}
            </span>
          ))}
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs text-indigo-600 font-medium mb-1">{product.brand}</p>
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} className={i < Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.ratings.length})</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">{formatPrice(bestListing.totalCost, bestListing.currency)}</p>
            {bestListing.originalPrice > bestListing.price && (
              <p className="text-xs text-gray-400 line-through">{formatPrice(bestListing.originalPrice, bestListing.currency)}</p>
            )}
            <p className="text-[10px] text-gray-400">incl. shipping</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Store size={10} />
              {product.listings.length} stores
            </p>
            <p className="text-xs text-green-600 font-medium flex items-center gap-0.5">
              <Clock size={10} />
              {bestListing.lastUpdated}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
