import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Store, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuth, isPlatformOwnerEmail } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserRole } from '../types';

const SignupPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('type') === 'seller' ? 'seller' : 'buyer';
  const [role, setRole] = useState<UserRole>(initialRole);
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      addToast('Please fill in all fields', 'warning');
      return;
    }
    if (password.length < 8) {
      addToast('Password must be at least 8 characters', 'warning');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      signup(name, email, password, role, role === 'seller' ? (storeName || `${name}'s Store`) : undefined);
      setLoading(false);
      if (role === 'seller') {
        addToast(`🎉 Welcome to PriceWise Merchant! Your store account is ready.`, 'success');
        navigate('/store/dashboard');
      } else {
        addToast(`Welcome to PriceWise, ${name}! Your account is ready.`, 'success');
        navigate('/');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">P</span>
            </div>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {role === 'seller' ? 'Register Merchant Account' : 'Create your account'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {role === 'seller' ? 'Start listing your products and receiving high-intent shopper traffic' : 'Start saving money with verified price tracking and deals'}
          </p>
        </div>

        {/* Role Selector */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setRole('buyer')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              role === 'buyer'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShoppingBag size={14} />
            <span>Shopper Account</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('seller')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              role === 'seller'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-xs font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Store size={14} />
            <span>Store / Merchant</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {role === 'seller' ? 'Contact / Owner Name' : 'Full Name'}
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Samuel Ade"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 text-xs sm:text-sm"
                  required
                />
              </div>
            </div>

            {role === 'seller' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Store / Business Name</label>
                <div className="relative">
                  <Store size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. Prime Gadgets Lagos"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-orange-500 text-xs sm:text-sm"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Work / Personal Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 text-xs sm:text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 text-xs sm:text-sm"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" className="w-3.5 h-3.5 mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" required />
              <span className="text-[11px] text-gray-500">
                I agree to the <Link to="/terms" className="text-indigo-600 hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white font-semibold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-xs sm:text-sm ${
                role === 'seller'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-95'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95'
              }`}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>{role === 'seller' ? 'Register Store & Open Portal' : 'Create Free Account'}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Benefits */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
              {role === 'seller' ? 'MERCHANT BENEFITS:' : 'FREE ACCOUNT BENEFITS:'}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {(role === 'seller'
                ? ['Direct Store Listings', 'CPC Sponsored Ads', 'Live Click Telemetry', 'Verified Seller Badge']
                : ['Instant Price Drop Alerts', 'Multi-Store Watchlist', 'Price History Analytics', 'VIP Coupon Vault']
              ).map((benefit, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[11px] text-gray-600 font-medium">
                  <span className="text-green-500 font-bold">✓</span> {benefit}
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to={`/login?type=${role}`} className="text-indigo-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
