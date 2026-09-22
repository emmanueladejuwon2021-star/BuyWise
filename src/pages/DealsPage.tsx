import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, TrendingDown, Flame } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { products, getBestDeal } from '../data/products';

const DealsPage: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 42, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const deals = products
    .map(p => ({ product: p, ...getBestDeal(p) }))
    .sort((a, b) => b.listing.discount - a.listing.discount);

  const flashDeals = deals.filter(d => d.listing.discount >= 15);
  const bestDiscounts = deals.filter(d => d.listing.discount >= 10);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Flash Deals Banner */}
      <section className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Flame size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">Flash Deals</h1>
                <p className="text-white/80 text-xs sm:text-sm">Massive discounts ending soon!</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-white/80 text-xs sm:text-sm font-medium">Ends in:</span>
              <div className="flex items-center gap-1 sm:gap-1.5">
                {[
                  { value: timeLeft.hours, label: 'HRS' },
                  { value: timeLeft.minutes, label: 'MIN' },
                  { value: timeLeft.seconds, label: 'SEC' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 text-center min-w-[42px] sm:min-w-[48px]">
                      <span className="text-sm sm:text-base font-bold text-white">{String(item.value).padStart(2, '0')}</span>
                      <p className="text-[8px] sm:text-[9px] text-white/70">{item.label}</p>
                    </div>
                    {i < 2 && <span className="text-white text-sm sm:text-base font-bold">:</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Flash Deals */}
        {flashDeals.length > 0 && (
          <section className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Zap size={16} className="text-red-500" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">Mega Flash Deals</h2>
                  <p className="text-[11px] sm:text-xs text-gray-500">15%+ off — Don't miss out!</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {flashDeals.map(({ product }) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Best Discounts */}
        <section className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingDown size={16} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">Biggest Discounts</h2>
                <p className="text-[11px] sm:text-xs text-gray-500">Top savings across all stores</p>
              </div>
            </div>
          </div>
          <div className="space-y-2.5 sm:space-y-3">
            {bestDiscounts.map(({ product, listing, savings }) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="block bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-2.5 sm:p-4 hover:shadow-md hover:border-green-200 transition-all"
              >
                <div className="flex flex-row gap-3 sm:gap-4">
                  <img src={product.images[0]} alt={product.name} className="w-20 h-20 sm:w-28 sm:h-28 object-cover rounded-lg sm:rounded-xl shrink-0" />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[10px] sm:text-xs text-indigo-600 font-medium truncate">{product.brand}</p>
                          <h3 className="font-semibold text-gray-900 text-xs sm:text-sm line-clamp-1">{product.name}</h3>
                          <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 truncate">
                            Best at <strong>{listing.store.name}</strong> {listing.store.logo}
                          </p>
                        </div>
                        <span className="bg-red-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
                          -{listing.discount}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 pt-1 border-t border-gray-50 flex-wrap">
                      <div>
                        <span className="text-xs sm:text-base font-bold text-gray-900">
                          {listing.currency === '₦' ? `₦${listing.price.toLocaleString()}` : `$${listing.price.toLocaleString()}`}
                        </span>
                        <span className="text-[10px] sm:text-xs text-gray-400 line-through ml-1.5">
                          {listing.currency === '₦' ? `₦${listing.originalPrice.toLocaleString()}` : `$${listing.originalPrice.toLocaleString()}`}
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-xs text-green-600 font-medium flex items-center gap-0.5 ml-auto">
                        <TrendingDown size={11} />
                        Save {listing.currency === '₦' ? `₦${(listing.originalPrice - listing.price).toLocaleString()}` : `$${(listing.originalPrice - listing.price).toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Savings Tips */}
        <section>
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 sm:p-6 border border-indigo-100">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-1.5">
              💡 Smart Shopping Tips
            </h2>
            <div className="grid md:grid-cols-3 gap-3 sm:gap-4">
              {[
                { title: 'Compare Before You Buy', desc: 'Always check at least 3 stores before purchasing. The same product can vary by 20-30% in price.' },
                { title: 'Watch for Flash Sales', desc: 'Stores like Jumia and Konga have weekly flash sales. Set price alerts to catch them.' },
                { title: 'Factor in Shipping', desc: 'A lower product price might have higher shipping. Always check the total cost including delivery.' },
              ].map((tip, i) => (
                <div key={i} className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100">
                  <h3 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1">{tip.title}</h3>
                  <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DealsPage;
