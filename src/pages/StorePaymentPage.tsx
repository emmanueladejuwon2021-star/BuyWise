import React, { useState, useEffect } from 'react';
import { CreditCard, Check, Crown, Zap, DollarSign } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'membership' | 'credits'>('membership');
  const [plans, setPlans] = useState<Record<string, MembershipPlan>>({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [creditsAmount, setCreditsAmount] = useState(100);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.getMembershipPlans();
      setPlans(response.data);
    } catch (error: any) {
      addToast('Failed to load membership plans', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMembershipCheckout = async (level: 'premium' | 'enterprise') => {
    setProcessing(true);
    try {
      const response = await api.initializeMembershipCheckout(level);
      // In production, redirect to payment gateway
      // window.location.href = response.data.paymentUrl;
      addToast(`Redirecting to payment gateway...`, 'info');
      console.log('Payment URL:', response.data.paymentUrl);
    } catch (error: any) {
      addToast(error.message || 'Failed to initialize checkout', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleCreditsCheckout = async () => {
    setProcessing(true);
    try {
      const response = await api.initializeCreditsCheckout(creditsAmount);
      // In production, redirect to payment gateway
      // window.location.href = response.data.paymentUrl;
      addToast(`Redirecting to payment gateway...`, 'info');
      console.log('Payment URL:', response.data.paymentUrl);
    } catch (error: any) {
      addToast(error.message || 'Failed to initialize checkout', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment & Billing</h1>
          <p className="text-gray-600 mt-1">Upgrade your membership or purchase ad credits</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('membership')}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'membership'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Crown size={16} className="inline mr-2" />
            Membership Plans
          </button>
          <button
            onClick={() => setActiveTab('credits')}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'credits'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Zap size={16} className="inline mr-2" />
            Buy Ad Credits
          </button>
        </div>

        {/* Membership Plans */}
        {activeTab === 'membership' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                <p className="text-4xl font-bold text-gray-900 mb-2">
                  ₦0<span className="text-lg text-gray-500">/month</span>
                </p>
                <p className="text-gray-500">Perfect for getting started</p>
              </div>
              <ul className="space-y-3 mb-8">
                {plans.free?.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check size={20} className="text-green-500 mt-0.5" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                disabled
                className="w-full px-6 py-3 bg-gray-100 text-gray-500 rounded-lg font-medium cursor-not-allowed"
              >
                Current Plan
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
                POPULAR
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Premium</h3>
                <p className="text-4xl font-bold mb-2">
                  {formatCurrency(plans.premium?.price || 25000)}<span className="text-lg opacity-80">/month</span>
                </p>
                <p className="opacity-80">For growing businesses</p>
              </div>
              <ul className="space-y-3 mb-8">
                {plans.premium?.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check size={20} className="mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleMembershipCheckout('premium')}
                disabled={processing}
                className="w-full px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-100 disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Upgrade to Premium'}
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-2xl p-8 border-2 border-purple-200">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <p className="text-4xl font-bold text-gray-900 mb-2">
                  {formatCurrency(plans.enterprise?.price || 100000)}<span className="text-lg text-gray-500">/month</span>
                </p>
                <p className="text-gray-500">For large businesses</p>
              </div>
              <ul className="space-y-3 mb-8">
                {plans.enterprise?.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check size={20} className="text-purple-500 mt-0.5" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleMembershipCheckout('enterprise')}
                disabled={processing}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Upgrade to Enterprise'}
              </button>
            </div>
          </div>
        )}

        {/* Ad Credits */}
        {activeTab === 'credits' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <div className="text-center mb-8">
                <DollarSign size={48} className="mx-auto text-green-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Purchase Ad Credits</h3>
                <p className="text-gray-600">Buy credits to run sponsored campaigns</p>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Credits
                </label>
                <input
                  type="number"
                  value={creditsAmount}
                  onChange={(e) => setCreditsAmount(Math.max(10, Number(e.target.value)))}
                  min="10"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Cost: <span className="font-semibold text-gray-900">{formatCurrency(creditsAmount * 50)}</span>
                  {' '}({formatCurrency(50)} per credit)
                </p>
              </div>

              {/* Quick Select Buttons */}
              <div className="grid grid-cols-4 gap-3 mb-8">
                {[100, 500, 1000, 2000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setCreditsAmount(amount)}
                    className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                      creditsAmount === amount
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {amount}
                  </button>
                ))}
              </div>

              <button
                onClick={handleCreditsCheckout}
                disabled={processing}
                className="w-full px-6 py-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CreditCard size={20} />
                {processing ? 'Processing...' : `Pay ${formatCurrency(creditsAmount * 50)}`}
              </button>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>How credits work:</strong> Each credit equals ₦50. Credits are deducted when shoppers click on your sponsored listings. 
                  Unused credits never expire.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Methods */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-4">Secure payment powered by</p>
          <div className="flex items-center justify-center gap-6">
            <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg">
              <span className="font-semibold text-gray-700">Paystack</span>
            </div>
            <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg">
              <span className="font-semibold text-gray-700">Flutterwave</span>
            </div>
            <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg">
              <span className="font-semibold text-gray-700">Stripe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorePaymentPage;
