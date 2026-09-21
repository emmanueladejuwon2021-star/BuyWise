import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Clock, TrendingDown, Flame, Timer, ArrowRight } from 'lucide-react';
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
      <section className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Flame size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Flash Deals</h1>
                <p className="text-white/80 text-sm">Massive discounts ending soon!</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white/80 text-sm font-medium">Ends in:</span>
              <div className="flex items-center gap-2">
                {[
                  { value: timeLeft.hours, label: 'HRS' },
                  { value: timeLeft.minutes, label: 'MIN' },
                  { value: timeLeft.seconds, label: 'SEC' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 text-center min-w-[52px]">
                      <span className="text-xl font-bold text-white">{String(item.value).padStart(2, '0')}</span>
                      <p className="text-[10px] text-white/70">{item.label}</p>
                    </div>
                    {i < 2 && <span className="text-white text-xl font-bold">:</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Flash Deals */}
        {flashDeals.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <Zap size={20} className="text-red-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Mega Flash Deals</h2>
                  <p className="text-sm text-gray-500">15%+ off — Don't miss out!</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {flashDeals.map(({ product }) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Best Discounts */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingDown size={20} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Biggest Discounts</h2>
                <p className="text-sm text-gray-500">Top savings across all stores</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {bestDiscounts.map(({ product, listing, savings }) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="block bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-green-200 transition-all"
              >
                <div className="flex flex-col sm:flex-row gap-5">
                  <img src={product.image} alt={product.name} className="w-full sm:w-32 h-32 object-cover rounded-xl" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs text-indigo-600 font-medium">{product.brand}</p>
                        <h3 className="font-semibold text-gray-900 mt-1">{product.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Best price at <strong>{listing.store.name}</strong> {listing.store.logo}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                          -{listing.discount}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <div>
                        <span className="text-xl font-bold text-gray-900">
                          {listing.currency === '₦' ? `₦${listing.price.toLocaleString()}` : `$${listing.price.toLocaleString()}`}
                        </span>
                        <span className="text-sm text-gray-400 line-through ml-2">
                          {listing.currency === '₦' ? `₦${listing.originalPrice.toLocaleString()}` : `$${listing.originalPrice.toLocaleString()}`}
                        </span>
                      </div>
                      <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                        <TrendingDown size={14} />
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
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-8 border border-indigo-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              💡 Smart Shopping Tips
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: 'Compare Before You Buy', desc: 'Always check at least 3 stores before purchasing. The same product can vary by 20-30% in price.' },
                { title: 'Watch for Flash Sales', desc: 'Stores like Jumia and Konga have weekly flash sales. Set price alerts to catch them.' },
                { title: 'Factor in Shipping', desc: 'A lower product price might have higher shipping. Always check the total cost including delivery.' },
              ].map((tip, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">{tip.title}</h3>
                  <p className="text-sm text-gray-500">{tip.desc}</p>
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
