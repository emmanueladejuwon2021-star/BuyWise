import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { categories } from '../data/products';

const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight">Browse Categories</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Explore products across all categories from top e-commerce stores</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
          {categories.map(category => (
            <Link
              key={category.id}
              to={`/search?category=${category.id}`}
              className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3.5 sm:p-5 text-center hover:shadow-md hover:border-indigo-200 hover:-translate-y-0.5 transition-all group"
            >
              <span className="text-3xl sm:text-4xl mb-2 block group-hover:scale-110 transition-transform duration-300">
                {category.icon}
              </span>
              <h3 className="font-semibold text-gray-900 text-xs sm:text-sm group-hover:text-indigo-600 transition-colors">
                {category.name}
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
                {category.count.toLocaleString()} products
              </p>
            </Link>
          ))}
        </div>

        {/* Popular Brands */}
        <div className="mt-8 sm:mt-12">
          <h2 className="text-base sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Popular Brands</h2>
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
            {['Apple', 'Samsung', 'Sony', 'Nike', 'LG', 'Dyson', 'HP', 'Lenovo', 'Adidas', 'Xiaomi', 'Google', 'Microsoft', 'Canon', 'Bose', 'Dell', 'JBL'].map((brand, i) => (
              <Link
                key={i}
                to={`/search?q=${brand.toLowerCase()}`}
                className="bg-white rounded-xl border border-gray-100 p-2 sm:p-3 text-center hover:shadow-sm hover:border-indigo-200 transition-all block"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-1 sm:mb-1.5">
                  <span className="text-xs sm:text-sm font-bold text-gray-600">{brand.charAt(0)}</span>
                </div>
                <p className="text-[10px] sm:text-xs font-medium text-gray-700 truncate">{brand}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
