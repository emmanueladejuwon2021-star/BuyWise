import React from 'react';
import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { products, getBestDeal } from '../data/products';

const DealsPage: React.FC = () => {
  const deals = products
    .map(p => ({ product: p, ...getBestDeal(p) }))
    .sort((a, b) => b.listing.discount - a.listing.discount);

  const flashDeals = deals.filter(d => d.listing.discount >= 15);

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Flame size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Deals</h1>
              <p className="text-white/90 text-base mt-1">Only listed discounts show here. There is no fake timer.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {flashDeals.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl px-6 py-16 text-center">
            <p className="text-lg font-semibold text-gray-800">No deals yet</p>
            <p className="text-base text-gray-500 mt-2">Search a product or wait for a store to add a discounted item.</p>
            <Link to="/search" className="inline-block mt-6 text-indigo-600 font-semibold">Go to search</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {flashDeals.map(({ product }) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DealsPage;
