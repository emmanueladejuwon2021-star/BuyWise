import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Store, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuth, isPlatformOwnerEmail } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserRole } from '../types';

const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('type') === 'seller' ? 'seller' : 'buyer';
  const [role, setRole] = useState<UserRole>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      addToast('Please enter your email address', 'warning');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      login(email, password, role, role === 'seller' ? (storeName || email.split('@')[0] + ' Store') : undefined);
      setLoading(false);
      
      if (role === 'seller') {
        addToast('Welcome back to your Merchant Portal!', 'success');
        navigate('/store/dashboard');
      } else {
        addToast('Welcome back! You are now signed in.', 'success');
        navigate('/');
      }
    }, 450);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-3 sm:px-4 py-6 sm:py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-5">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">P</span>
            </div>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {role === 'seller' ? 'Merchant Portal Sign In' : 'Welcome back'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {role === 'seller' 
              ? 'Manage your store listings, campaigns, and click analytics' 
              : 'Sign in to track prices, watch items, and save more'}
          </p>
        </div>

        {/* Account Role Tabs */}
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
            <span>Shopper</span>
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
            <span>Store Merchant</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {role === 'seller' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Store / Business Name (Optional)</label>
                <div className="relative">
                  <Store size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. Apex Electronics"
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-orange-500 text-xs"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'seller' ? 'merchant@store.com' : 'you@example.com'}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 text-xs text-gray-800"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 text-xs text-gray-800"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-gray-600 text-[11px]">Remember me</span>
              </label>
              <a href="#" className="text-indigo-600 text-[11px] font-medium hover:underline">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white font-semibold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-xs ${
                role === 'seller'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-95'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95'
              }`}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>{role === 'seller' ? 'Access Merchant Portal' : 'Sign In'}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center text-xs text-gray-500 mt-3.5">
          {role === 'seller' ? (
            <p>
              Want to register a new store?{' '}
              <Link to="/store/register" className="text-orange-600 font-semibold hover:underline">
                Register Store
              </Link>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="text-indigo-600 font-semibold hover:underline">
                Sign up free
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
