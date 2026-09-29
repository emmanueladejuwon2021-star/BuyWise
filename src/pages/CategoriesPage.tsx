import React from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../data/products';

const CategoriesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">Browse categories</h1>
          <p className="text-base text-gray-500 mt-2">
            These are search groups only. Item counts stay at zero until products are added.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
          {categories.map(category => (
            <Link
              key={category.id}
              to={`/search?q=${encodeURIComponent(category.name)}&category=${category.id}`}
              className="bg-white rounded-2xl border border-gray-100 p-6 text-center hover:shadow-md hover:border-indigo-200 transition-all"
            >
              <span className="text-4xl mb-3 block">{category.icon}</span>
              <h3 className="font-semibold text-gray-900 text-base">{category.name}</h3>
              <p className="text-sm text-gray-400 mt-1">No products yet</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
