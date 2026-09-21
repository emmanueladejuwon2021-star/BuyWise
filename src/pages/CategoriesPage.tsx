import React from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../data/products';

const CategoriesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Categories</h1>
          <p className="text-gray-500 mt-2">Explore products across all categories from top e-commerce stores</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {categories.map(category => (
            <Link
              key={category.id}
              to={`/search?category=${category.id}`}
              className="bg-white rounded-3xl border border-gray-100 p-6 text-center hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 transition-all group"
            >
              <span className="text-5xl mb-4 block group-hover:scale-110 transition-transform duration-300">
                {category.icon}
              </span>
              <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                {category.name}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                {category.count.toLocaleString()} products
              </p>
              <div className="mt-3 inline-flex items-center gap-1 text-xs text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Browse <span>→</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Popular Brands */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Brands</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {['Apple', 'Samsung', 'Sony', 'Nike', 'LG', 'Dyson', 'HP', 'Lenovo', 'Adidas', 'Xiaomi', 'Google', 'Microsoft', 'Canon', 'Bose', 'Dell', 'JBL'].map((brand, i) => (
              <Link
                key={i}
                to={`/search?q=${brand.toLowerCase()}`}
                className="bg-white rounded-2xl border border-gray-100 p-4 text-center hover:shadow-md hover:border-indigo-200 transition-all"
              >
                <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-lg font-bold text-gray-600">{brand.charAt(0)}</span>
                </div>
                <p className="text-xs font-medium text-gray-700">{brand}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
