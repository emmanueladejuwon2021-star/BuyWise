import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface StoreProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  stock: number;
  status: 'active' | 'out_of_stock' | 'draft';
}

const StoreProductsPage: React.FC = () => {
  const { addToast } = useToast();
  const [products] = useState<StoreProduct[]>([]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Store products</h1>
            <p className="text-sm text-gray-500 mt-1">No sample phones or laptops. Add a real item when you have stock.</p>
          </div>
          <button onClick={() => addToast('Use your own product name and price. Nothing is pre-filled.', 'info')} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold">
            <Plus size={16} /> Add product
          </button>
        </div>
        {products.length === 0 && (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl px-6 py-16 text-center">
            <p className="text-lg font-semibold text-gray-800">No products listed</p>
            <p className="text-base text-gray-500 mt-2">The catalog for this store is empty.</p>
            <Link to="/store/dashboard" className="inline-block mt-6 text-indigo-600 font-semibold">Back to store home</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreProductsPage;
