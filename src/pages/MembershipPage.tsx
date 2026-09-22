import React, { useState } from 'react';
import { Check, Zap, Crown, Shield, Bell, Sparkles, TrendingDown, ArrowRight, CreditCard, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useRegion } from '../context/RegionContext';

const MembershipPage: React.FC = () => {
  const { user, isAuthenticated, upgradeMembership } = useAuth();
  const { addToast } = useToast();
  const { formatPrice } = useRegion();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'vip' | 'pro'>('vip');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('5399 •••• •••• 4128');

  const plans = [
    {
      id: 'free',
      name: 'Free Explorer',
      priceMonthly: 0,
      priceAnnual: 0,
      description: 'Essential comparison tools for casual shoppers',
      badge: 'Current Basic',
      features: [
        'Compare prices across 8+ verified retailers',
        'Standard price drop alerts (Email)',
        'Price updates every 30 minutes',
        'Watchlist up to 10 products',
      ],
      buttonText: 'Current Plan',
      popular: false,
    },
    {
      id: 'vip',
      name: 'VIP Deal Hunter',
      priceMonthly: 1500,
      priceAnnual: 14400, // ₦1,200/mo
      description: 'Ideal for frequent shoppers hunting the lowest price',
      badge: 'Most Popular',
      features: [
        'All Free Explorer features',
        '⚡ Instant SMS & WhatsApp drop alerts (< 60s)',
        '✨ Smart Price Advice (Know when to buy or wait)',
        '🚫 100% Ad-Free Shopping Experience',
        'Unlimited Watchlist & custom alert price targets',
        'Early access to Flash Sales & Store Coupons',
      ],
      buttonText: 'Upgrade to VIP',
      popular: true,
    },
    {
      id: 'pro',
      name: 'Pro Reseller & Super Shopper',
      priceMonthly: 3500,
      priceAnnual: 33600, // ₦2,800/mo
      description: 'For business buyers, shop owners, and serious bargain hunters',
      badge: 'Maximum Savings',
      features: [
        'All VIP Deal Hunter features',
        '📊 Full shopping insights & store price comparisons',
        'Restock alerts when items are back in stock',
        'Download complete price history reports',
        'Priority 24/7 dedicated support via WhatsApp',
        'Exclusive VIP cash reward bonuses',
      ],
      buttonText: 'Upgrade to Pro',
      popular: false,
    },
  ];

  const handleSelectPlan = (tier: 'vip' | 'pro') => {
    setSelectedTier(tier);
    setShowCheckoutModal(true);
  };

  const handleConfirmSubscription = () => {
    setIsProcessing(true);
    setTimeout(() => {
      upgradeMembership(selectedTier, billingCycle === 'annual' ? 12 : 1);
      setIsProcessing(false);
      setShowCheckoutModal(false);
      addToast(`🎉 Welcome to PriceWise ${selectedTier.toUpperCase()} Membership!`, 'success');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-10">
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold mb-3">
            <Crown size={14} className="text-amber-600" />
            <span>PRICEWISE VIP CLUB</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-2 sm:mb-3">
            Unlock Instant Deal Alerts & AI Price Predictions
          </h1>
          <p className="text-xs sm:text-base text-gray-600">
            Never overpay again. Save an estimated ₦15,000 to ₦45,000 every month on electronics, appliances, and daily shopping.
          </p>

          {/* Billing Switcher */}
          <div className="mt-6 inline-flex items-center bg-gray-200 p-1 rounded-xl">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                billingCycle === 'monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annual Billing <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mb-12">
          {plans.map(plan => {
            const isCurrent = (user?.membershipTier || 'free') === plan.id;
            const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl border transition-all flex flex-col p-5 sm:p-7 ${
                  plan.popular
                    ? 'border-indigo-500 shadow-xl ring-2 ring-indigo-200'
                    : 'border-gray-200 hover:border-gray-300 shadow-sm'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-md uppercase tracking-wider">
                    {plan.badge}
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-4xl font-extrabold text-gray-900">
                      {price === 0 ? 'Free' : formatPrice(price, '₦')}
                    </span>
                    {price > 0 && (
                      <span className="text-xs text-gray-500 font-medium">
                        /{billingCycle === 'annual' ? 'year' : 'month'}
                      </span>
                    )}
                  </div>
                  {billingCycle === 'annual' && price > 0 && (
                    <p className="text-[11px] text-green-600 font-medium mt-1">
                      Equates to {formatPrice(Math.round(price / 12), '₦')}/month
                    </p>
                  )}
                </div>

                <ul className="space-y-2.5 mb-6 flex-1 text-xs sm:text-sm text-gray-700">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check size={16} className="text-green-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                {plan.id === 'free' ? (
                  <button
                    disabled
                    className="w-full py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-400 bg-gray-50 cursor-not-allowed"
                  >
                    {isCurrent ? 'Current Free Plan' : 'Basic Tier'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleSelectPlan(plan.id as 'vip' | 'pro')}
                    className={`w-full py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 shadow-md ${
                      plan.popular
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-95'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {isCurrent ? 'Extend Subscription' : plan.buttonText}
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Value Proposition Grid */}
        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-xl mb-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-lg sm:text-2xl font-bold mb-2">Why 10,000+ Nigerian Shoppers Join VIP</h2>
            <p className="text-xs sm:text-sm text-indigo-200">
              According to PDF market research, consumers waste 30-45 minutes comparing prices and face delivery uncertainty. PriceWise VIP eliminates all friction.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
              <Sparkles size={24} className="text-amber-300 mx-auto mb-2" />
              <h4 className="font-bold text-sm mb-1">Instant Arbitrage Alerts</h4>
              <p className="text-xs text-indigo-100">
                When Konga or Jumia drops an iPhone by ₦40,000, VIP members receive WhatsApp notifications within 60 seconds before it sells out.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
              <TrendingDown size={24} className="text-emerald-300 mx-auto mb-2" />
              <h4 className="font-bold text-sm mb-1">AI Price Forecasting</h4>
              <p className="text-xs text-indigo-100">
                Our machine learning models analyze 90-day pricing cycles to advise whether you should buy today or wait for an upcoming promotion.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
              <Shield size={24} className="text-blue-300 mx-auto mb-2" />
              <h4 className="font-bold text-sm mb-1">Ad-Free & Safe Routing</h4>
              <p className="text-xs text-indigo-100">
                Zero clutter, direct verified seller redirects, and guaranteed buyer protection escrow insights.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal (Paystack / Flutterwave Simulation) */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-bold">
                  PW
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">
                    Upgrade to {selectedTier.toUpperCase()}
                  </h3>
                  <p className="text-[10px] text-gray-500">Secured with Paystack 256-bit encryption</p>
                </div>
              </div>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="bg-indigo-50/70 rounded-xl p-3 mb-4 flex justify-between items-center text-xs">
              <div>
                <p className="font-semibold text-gray-900 capitalize">
                  PriceWise {selectedTier} ({billingCycle})
                </p>
                <p className="text-[10px] text-gray-500">Billed {billingCycle === 'annual' ? 'yearly' : 'monthly'}</p>
              </div>
              <p className="font-extrabold text-sm text-indigo-700">
                {formatPrice(
                  selectedTier === 'vip'
                    ? billingCycle === 'annual' ? 14400 : 1500
                    : billingCycle === 'annual' ? 33600 : 3500,
                  '₦'
                )}
              </p>
            </div>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Card Details</label>
                <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-gray-50">
                  <CreditCard size={16} className="text-gray-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="Card Number"
                    className="w-full bg-transparent text-xs sm:text-sm outline-none"
                  />
                  <span className="text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded">VERIFIED</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    defaultValue="09 / 28"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs bg-gray-50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">CVV</label>
                  <input
                    type="password"
                    defaultValue="•••"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs bg-gray-50 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-4">
              <Lock size={12} className="text-green-600" />
              <span>Cancel anytime. Money-back guarantee within 7 days.</span>
            </div>

            <button
              onClick={handleConfirmSubscription}
              disabled={isProcessing}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Authorizing Payment...</span>
                </>
              ) : (
                <span>Pay & Activate Instant Access</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipPage;
