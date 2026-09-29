import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MOCK_KEYS = ['mongo_atlas_watchlist', 'mongo_atlas_watchlist_v2'];

const WatchlistPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    MOCK_KEYS.forEach((key) => {
      try {
        const raw = localStorage.getItem(key) || '[]';
        const items = JSON.parse(raw);
        const cleaned = (Array.isArray(items) ? items : []).filter((item: any) => {
          const name = String(item?.productName || '');
          const id = String(item?._id || '');
          const productId = String(item?.masterProductId || '');
          if (id === 'wl_1' || id === 'wl_2') return false;
          if (productId === 'iphone-15-pro' || productId === 'samsung-s24-ultra') return false;
          if (/iphone 15|samsung galaxy s24/i.test(name)) return false;
          return true;
        });
        localStorage.setItem(key, JSON.stringify(cleaned));
      } catch {
        localStorage.removeItem(key);
      }
    });
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Heart size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to use a watchlist</h2>
          <p className="text-gray-500 mb-6">Nothing is preloaded. Save an item only after you search and find it.</p>
          <Link to="/login?next=/watchlist" className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-full">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto bg-white border border-dashed border-gray-300 rounded-2xl px-6 py-16 text-center">
        <Heart size={40} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Watchlist is empty</h1>
        <p className="text-base text-gray-500 mt-2 leading-relaxed">
          Sample phones were removed. This list stays empty until you save a product from search.
        </p>
        <Link to="/search" className="inline-block mt-6 text-indigo-600 font-semibold">
          Go to search
        </Link>
      </div>
    </div>
  );
};

export default WatchlistPage;
