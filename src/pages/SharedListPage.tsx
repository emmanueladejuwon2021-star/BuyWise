import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, ShoppingBag, ArrowRight, Share2, Copy, Check, TrendingDown, Store, ExternalLink } from 'lucide-react';
import { products, getBestDeal } from '../data/products';
import { useRegion } from '../context/RegionContext';
import { useToast } from '../context/ToastContext';

const SharedListPage: React.FC = () => {
  const { listId } = useParams<{ listId: string }>();
  const { formatPrice } = useRegion();
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);

  // Sample items in this shared basket
  const listItems = products.slice(0, 4);

  const totalBestPrice = listItems.reduce((sum, item) => {
    const { listing } = getBestDeal(item);
    return sum + listing.price;
  }, 0);

  const totalOriginalPrice = listItems.reduce((sum, item) => {
    const { listing } = getBestDeal(item);
    return sum + (listing.originalPrice || listing.price * 1.2);
  }, 0);

  const totalSavings = totalOriginalPrice - totalBestPrice;

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    addToast('List link copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-6 shadow-sm mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
                  <Users size={16} />
                </span>
                <span className="text-xs uppercase font-bold text-purple-600 tracking-wider">
                  Shared Shopping List • #{listId || 'LIST-PW100'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900">Lagos Creator Studio Setup</h1>
              <p className="text-xs sm:text-sm text-gray-500">Collaborative basket created by Emmanuel • 4 items</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopy}
                className="flex-1 sm:flex-none px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Share'}</span>
              </button>
              <Link
                to="/"
                className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Add More Items</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Combined Basket Summary */}
        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-indigo-300 font-bold mb-1">
                Optimized Combined Cart
              </p>
              <h2 className="text-2xl sm:text-3xl font-black">
                {formatPrice(totalBestPrice, '₦')}
              </h2>
              <p className="text-xs text-indigo-200 mt-1 flex items-center gap-1">
                <TrendingDown size={14} className="text-emerald-400" />
                Combined basket saves <strong className="text-emerald-400">{formatPrice(totalSavings, '₦')}</strong> vs single-store purchase
              </p>
            </div>
            <button
              onClick={() => addToast('Opening retailer carts with applied promo codes...', 'info')}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all text-center"
            >
              Checkout All Best Deals →
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          {listItems.map((prod) => {
            const { listing } = getBestDeal(prod);
            return (
              <div
                key={prod.id}
                className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-indigo-200 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl bg-gray-50 shrink-0 border border-gray-100"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] text-indigo-600 font-bold uppercase">{prod.brand}</span>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 truncate">{prod.name}</h3>
                    <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                      <Store size={11} className="text-gray-400" />
                      Lowest price at <strong>{listing.store.name}</strong> {listing.store.logo}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                  <div className="text-left sm:text-right">
                    <p className="text-sm sm:text-base font-extrabold text-gray-900">
                      {formatPrice(listing.price, listing.currency)}
                    </p>
                    <p className="text-[10px] text-green-600 font-medium">Free delivery</p>
                  </div>
                  <Link
                    to={`/product/${prod.id}`}
                    className="px-3 py-1.5 bg-gray-50 hover:bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-lg border border-gray-200 transition-colors flex items-center gap-1"
                  >
                    <span>View Deal</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SharedListPage;
