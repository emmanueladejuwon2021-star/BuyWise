import React, { useState } from 'react';
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

const mockCoupons: Coupon[] = [
  {
    id: 'c1',
    storeId: 'jumia',
    storeName: 'Jumia',
    code: 'JUMIAAPP10',
    discount: '10% OFF',
    description: 'Get 10% off your first order on electronics and phones on Jumia App.',
    minSpend: '₦20,000',
    expires: 'Valid until end of month',
    verified: true,
    successRate: 98,
    category: 'electronics',
    storeUrl: 'https://jumia.com.ng',
  },
  {
    id: 'c2',
    storeId: 'konga',
    storeName: 'Konga',
    code: 'KONGAPAY5K',
    discount: '₦5,000 OFF',
    description: 'Instant ₦5,000 discount when paying via KongaPay on orders over ₦50,000.',
    minSpend: '₦50,000',
    expires: 'In 3 days',
    verified: true,
    successRate: 94,
    category: 'all',
    storeUrl: 'https://konga.com',
  },
  {
    id: 'c3',
    storeId: 'jumia',
    storeName: 'Jumia',
    code: 'FREEDELIV-LAG',
    discount: 'FREE DELIVERY',
    description: 'Zero delivery fee to any pickup station across Lagos on select tech items.',
    minSpend: '₦15,000',
    expires: 'Weekly Promo',
    verified: true,
    successRate: 96,
    category: 'all',
    storeUrl: 'https://jumia.com.ng',
  },
  {
    id: 'c4',
    storeId: 'amazon',
    storeName: 'Amazon',
    code: 'GLOBALTECH20',
    discount: '$20 OFF',
    description: 'Save $20 on international tech orders shipped directly to Nigeria.',
    minSpend: '$100',
    expires: 'Limited Redemptions',
    verified: true,
    successRate: 91,
    category: 'electronics',
    storeUrl: 'https://amazon.com',
  },
  {
    id: 'c5',
    storeId: 'aliexpress',
    storeName: 'AliExpress',
    code: 'AFRICASAVE4',
    discount: '$4 OFF',
    description: 'Direct savings on smart gadgets and phone accessories with tracked shipping.',
    minSpend: '$30',
    expires: 'In 5 days',
    verified: true,
    successRate: 95,
    category: 'accessories',
    storeUrl: 'https://aliexpress.com',
  },
  {
    id: 'c6',
    storeId: 'slot',
    storeName: 'Slot Systems',
    code: 'SLOTVIP5000',
    discount: '₦5,000 OFF',
    description: 'Voucher on all certified new flagship smartphones with 1-year warranty.',
    minSpend: '₦100,000',
    expires: 'Active today',
    verified: true,
    successRate: 99,
    category: 'phones',
    storeUrl: 'https://slot.ng',
  },
];

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
        {/* Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-white mb-4 shadow-sm relative overflow-hidden">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-0.5 text-xs font-semibold mb-1.5">
              <Sparkles size={13} className="text-yellow-200" />
              Verified Store Promo Codes
            </div>
            <h1 className="text-lg sm:text-2xl font-black mb-1">
              Save Even More With Store Coupons
            </h1>
            <p className="text-xs sm:text-sm text-white/90">
              Apply these tested promo codes at checkout on Jumia, Konga, Amazon, and Slot for instant discounts and free delivery.
            </p>
          </div>
        </div>

        {/* Store Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 mb-4 scrollbar-hide">
          <button
            onClick={() => setSelectedStore('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
              selectedStore === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            All Stores ({mockCoupons.length})
          </button>
          {stores.map(store => {
            const count = mockCoupons.filter(c => c.storeId === store.id).length;
            if (count === 0) return null;
            return (
              <button
                key={store.id}
                onClick={() => setSelectedStore(store.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                  selectedStore === store.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span>{store.name}</span>
                <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-full text-gray-600">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Coupons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCoupons.map(coupon => {
            const isCopied = copiedId === coupon.id;

            return (
              <div
                key={coupon.id}
                className="bg-white rounded-xl border border-gray-200 p-3.5 sm:p-4 flex flex-col justify-between hover:shadow-xs transition-shadow relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                      {coupon.storeName}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                      <ShieldCheck size={12} /> {coupon.successRate}% Success
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-gray-900 mb-0.5">
                    {coupon.discount}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                    {coupon.description}
                  </p>

                  {coupon.minSpend && (
                    <p className="text-[10px] text-gray-400 mb-2">
                      Minimum order: <strong className="text-gray-700">{coupon.minSpend}</strong>
                    </p>
                  )}
                </div>

                <div className="pt-2.5 border-t border-gray-100 mt-1.5">
                  <div className="flex items-center justify-between gap-2 bg-gray-50 border border-dashed border-gray-300 rounded-lg p-1.5 sm:p-2 mb-2">
                    <span className="font-mono text-xs font-black text-indigo-700 tracking-wider">
                      {coupon.code}
                    </span>
                    <button
                      onClick={() => handleCopyCode(coupon)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all ${
                        isCopied
                          ? 'bg-green-600 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {isCopied ? <Check size={12} /> : <Copy size={12} />}
                      {isCopied ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {coupon.expires}
                    </span>
                    <a
                      href={coupon.storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline flex items-center gap-0.5 font-semibold"
                    >
                      Visit Store <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CouponsPage;
