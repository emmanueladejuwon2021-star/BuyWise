import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Bell, Trash2, TrendingDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { products, getBestDeal } from '../data/products';

const WatchlistPage: React.FC = () => {
  const { user, isAuthenticated, removeFromWatchlist } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Heart size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view your watchlist</h2>
          <p className="text-gray-500 mb-6">Track prices and get alerts on your favorite products</p>
          <Link to="/login" className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-full hover:opacity-90 transition-opacity">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const watchlistProducts = products.filter(p => user?.watchlist.includes(p.id));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Watchlist</h1>
            <p className="text-sm text-gray-500 mt-1">{watchlistProducts.length} products being tracked</p>
          </div>
        </div>

        {watchlistProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <Heart size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your watchlist is empty</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Start adding products to track their prices. We'll notify you when prices drop!
            </p>
            <Link to="/" className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-full hover:opacity-90 transition-opacity">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {watchlistProducts.map(product => {
              const { listing: bestListing, savings } = getBestDeal(product);
              const formatPrice = (price: number, currency: string) => {
                if (currency === '₦') return `₦${price.toLocaleString()}`;
                return `$${price.toLocaleString()}`;
              };

              return (
                <div key={product.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row gap-5">
                    <Link to={`/product/${product.id}`} className="shrink-0">
                      <img src={product.image} alt={product.name} className="w-full sm:w-32 h-32 object-cover rounded-xl" />
                    </Link>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs text-indigo-600 font-medium">{product.brand}</p>
                          <Link to={`/product/${product.id}`} className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                            {product.name}
                          </Link>
                          <p className="text-sm text-gray-500 mt-1">
                            Best price: <strong>{formatPrice(bestListing.price, bestListing.currency)}</strong> at {bestListing.store.name}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromWatchlist(product.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <Link
                          to={`/product/${product.id}`}
                          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          View Prices
                        </Link>
                        <button className="flex items-center gap-1 px-4 py-2 border border-gray-200 text-sm font-medium text-gray-700 rounded-lg hover:border-indigo-300 transition-colors">
                          <Bell size={14} /> Set Alert
                        </button>
                        {savings > 0 && (
                          <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                            <TrendingDown size={14} />
                            Save up to {formatPrice(savings, bestListing.currency)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchlistPage;
