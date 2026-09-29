import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Copy, Check, ExternalLink, ShieldCheck, Clock, Sparkles, Filter } from 'lucide-react';
import { stores } from '../data/products';
import { useToast } from '../context/ToastContext';

interface Coupon {
  id: string;
  storeId: string;
  storeName: string;
  code: string;
  discount: string;
  description: string;
  minSpend?: string;
  expires: string;
  verified: boolean;
  successRate: number;
  category: string;
  storeUrl: string;
}

const mockCoupons: Coupon[] = [];

const CouponsPage: React.FC = () => {
  const { addToast } = useToast();
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCode = (coupon: Coupon) => {
    navigator.clipboard.writeText(coupon.code);
    setCopiedId(coupon.id);
    addToast(`Coupon code ${coupon.code} copied!`, 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredCoupons = selectedStore === 'all'
    ? mockCoupons
    : mockCoupons.filter(c => c.storeId === selectedStore);

  return (
    <div className="min-h-screen bg-gray-50 py-3 sm:py-6 px-2.5 sm:px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-white mb-4 shadow-sm">
          <h1 className="text-lg sm:text-2xl font-black mb-1">Store coupons</h1>
          <p className="text-xs sm:text-sm text-white/90">Codes appear only after a store adds them. We do not show sample promo codes.</p>
        </div>
        {filteredCoupons.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl px-6 py-14 text-center">
            <p className="text-lg font-semibold text-gray-800">No promo codes on file</p>
            <p className="text-base text-gray-500 mt-2">Search a product and compare prices instead.</p>
            <Link to="/search" className="inline-block mt-6 text-indigo-600 font-semibold">Go to search</Link>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CouponsPage;
