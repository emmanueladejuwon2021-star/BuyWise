import React, { useState, useEffect } from 'react';
import { CreditCard, Check, Crown, Zap, DollarSign, ShieldCheck, ArrowRight, Receipt } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

interface MembershipPlan {
  level: string;
  name: string;
  price: number;
  duration: number;
  features: string[];
  adCreditsIncluded: number;
}

const StorePaymentPage: React.FC = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'credits' | 'membership'>('credits');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [creditsAmount, setCreditsAmount] = useState(25000);

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  const handleCreditsCheckout = async () => {
    setProcessing(true);
    try {
      // Direct merchant top up simulation / api
      setTimeout(() => {
        setProcessing(false);
        addToast(`Successfully purchased ₦${creditsAmount.toLocaleString()} Ad Credits! Added to your campaign wallet.`, 'success');
      }, 1000);
    } catch (error: any) {
      addToast(error.message || 'Failed to initialize checkout', 'error');
      setProcessing(false);
    }
  };

  const plans = {
    free: {
      name: 'Starter Merchant',
      price: 0,
      features: [
        'Sync up to 50 active store listings',
        'Standard organic comparison rankings',
        'Basic weekly traffic reports',
        'Direct store phone & WhatsApp contact badge',
      ],
    },
    premium: {
      name: 'Professional Seller',
      price: 25000,
      features: [
        'Unlimited catalog listings sync',
        'Priority index refresh every 15 minutes',
        'CPC Sponsored ad bidding enabled',
        '₦10,000 Free CPC ad credits included',
        'Verified Seller Gold Badge',
        'Competitor price alert webhook notifications',
      ],
    },
    enterprise: {
      name: 'Enterprise Multi-Branch',
      price: 75000,
      features: [
        'Everything in Professional',
        'Multi-city warehouse inventory sync',
        'Dedicated account manager',
        '₦35,000 Free CPC ad credits included',
        'Custom API price feed ingest endpoint',
        'Zero commission on direct checkout leads',
      ],
    },
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard size={20} className="text-orange-600" />
            Ad Wallet, Invoices & Merchant Tier
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Top up your prepaid CPC campaign balance or upgrade your merchant seller level
          </p>
        </div>

        <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100">
          <span className="text-xs text-gray-600 font-medium">Current Balance:</span>
          <span className="text-sm font-bold text-orange-600">₦25,000</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5">
        <button
          onClick={() => setActiveTab('credits')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === 'credits'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Zap size={14} /> Buy Ad Credits
        </button>
        <button
          onClick={() => setActiveTab('membership')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === 'membership'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Crown size={14} /> Merchant Subscription Tiers
        </button>
      </div>

      {/* Buy Credits Tab */}
      {activeTab === 'credits' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Select Ad Credits Amount (Prepaid)</h3>
            <p className="text-xs text-gray-500">
              Ad credits deduct only when a verified shopper clicks on your sponsored products (average CPC ₦30–₦50).
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[10000, 25000, 50000, 100000].map(amount => (
                <button
                  key={amount}
                  onClick={() => setCreditsAmount(amount)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    creditsAmount === amount
                      ? 'border-orange-500 bg-orange-50/50 text-orange-950 font-bold shadow-xs'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <p className="text-sm font-bold">{formatCurrency(amount)}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">~{(amount / 40).toFixed(0)} Leads</p>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Custom Amount (₦)</label>
              <input
                type="number"
                value={creditsAmount}
                onChange={(e) => setCreditsAmount(Math.max(1000, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-orange-500 font-bold"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={handleCreditsCheckout}
                disabled={processing}
                className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-xs font-semibold hover:opacity-95 shadow-xs flex items-center justify-center gap-2 transition-opacity"
              >
                {processing ? (
                  <span>Processing Payment...</span>
                ) : (
                  <>
                    <CreditCard size={14} />
                    <span>Pay {formatCurrency(creditsAmount)} & Top Up Ad Wallet</span>
                  </>
                )}
              </button>
              <p className="text-[10px] text-center text-gray-400 mt-2">
                Instant credit via Nigerian Debit Cards, Bank Transfer, USSD, or Paystack
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <Receipt size={14} className="text-orange-600" />
              Recent Invoices & Receipts
            </h4>
            <div className="space-y-2">
              {[
                { ref: 'INV-8892', date: 'Sep 12, 2026', amount: 25000, status: 'Paid' },
                { ref: 'INV-8120', date: 'Aug 28, 2026', amount: 50000, status: 'Paid' },
                { ref: 'INV-7901', date: 'Aug 14, 2026', amount: 25000, status: 'Paid' },
              ].map(inv => (
                <div key={inv.ref} className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-gray-900 block">{inv.ref}</span>
                    <span className="text-[10px] text-gray-400">{inv.date}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900 block">{formatCurrency(inv.amount)}</span>
                    <span className="text-[9px] text-emerald-600 font-bold bg-emerald-100 px-1.5 py-0.2 rounded">
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Membership Tiers Tab */}
      {activeTab === 'membership' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {Object.entries(plans).map(([key, plan]) => {
            const isCurrent = key === 'premium';
            return (
              <div
                key={key}
                className={`bg-white rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'border-orange-500 shadow-sm ring-2 ring-orange-500/20'
                    : 'border-gray-200/80 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-gray-900">{plan.name}</h3>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-orange-100 text-orange-800 uppercase">
                        Current Tier
                      </span>
                    )}
                  </div>
                  <div className="mb-3">
                    <span className="text-xl font-bold text-gray-900">{formatCurrency(plan.price)}</span>
                    <span className="text-xs text-gray-500"> / month</span>
                  </div>

                  <ul className="space-y-2 mb-4 text-xs text-gray-600">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => addToast(`Merchant tier ${plan.name} selected`, 'success')}
                  className={`w-full py-2 rounded-xl text-xs font-semibold transition-all ${
                    isCurrent
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-95 shadow-xs'
                  }`}
                >
                  {isCurrent ? 'Active Plan' : `Upgrade to ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StorePaymentPage;
