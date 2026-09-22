import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Store, Package, Sparkles, BarChart3, CreditCard, Settings, 
  ArrowLeftRight, LogOut, Plus, ShieldCheck, ChevronRight, Bell 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface MerchantLayoutProps {
  children: React.ReactNode;
}

const MerchantLayout: React.FC<MerchantLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, switchRole } = useAuth();
  const { addToast } = useToast();

  const storeName = user?.storeDetails?.businessName || user?.name || 'Verified Merchant Store';

  const navItems = [
    { to: '/store/dashboard', label: 'Overview', icon: Store },
    { to: '/store/products', label: 'Catalog & Inventory', icon: Package },
    { to: '/store/campaigns', label: 'CPC Ad Campaigns', icon: Sparkles },
    { to: '/store/analytics', label: 'Traffic & Analytics', icon: BarChart3 },
    { to: '/store/payment', label: 'Billing & Ad Wallet', icon: CreditCard },
    { to: '/store/settings', label: 'Store Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Merchant Top Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200/80 shadow-xs">
        {/* Top status line */}
        <div className="bg-slate-900 text-white px-3 py-1.5 text-[11px]">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold text-orange-400">PriceWise B2B Merchant Suite:</span>
              <span className="hidden sm:inline text-slate-300">Live price comparison sync & CPC ad bidding active</span>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/store/payment" className="flex items-center gap-1 text-orange-300 hover:text-white font-semibold transition-colors">
                <span>Ad Wallet: ₦25,000</span>
                <span className="px-1.5 py-0.2 rounded bg-orange-500/30 text-[10px]">+ Add Funds</span>
              </Link>
              <span className="text-slate-700">|</span>
              <button
                onClick={() => {
                  switchRole('buyer');
                  addToast('Switched to Shopper Mode', 'info');
                  navigate('/');
                }}
                className="text-slate-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                title="Browse consumer marketplace"
              >
                <ArrowLeftRight size={12} />
                <span className="hidden sm:inline">Shopper Portal</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Merchant Navigation Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link to="/store/dashboard" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-xs">
                <Store size={18} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm sm:text-base text-gray-900 leading-none">
                    Merchant Hub
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-orange-100 text-orange-800 text-[10px] font-bold">
                    PRO
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 truncate max-w-[140px] sm:max-w-xs">{storeName}</p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav aria-label="Merchant Navigation" className="hidden lg:flex items-center gap-1">
              {navItems.map(item => {
                const isActive = location.pathname === item.to;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isActive
                        ? 'bg-orange-500/10 text-orange-600 font-bold'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={14} className={isActive ? 'text-orange-600' : 'text-gray-400'} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/store/products"
              className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-xs font-semibold hover:opacity-95 flex items-center gap-1 shadow-xs transition-opacity"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Add Product</span>
            </Link>

            <button
              onClick={() => {
                logout();
                addToast('Merchant signed out', 'info');
                navigate('/login');
              }}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Sub Navigation Bar for Medium screens */}
        <div className="lg:hidden flex items-center gap-1 px-3 py-1.5 overflow-x-auto border-t border-gray-100 scrollbar-none bg-gray-50/60">
          {navItems.map(item => {
            const isActive = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon size={12} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-20 md:pb-8">
        {children}
      </main>

      {/* Mobile Merchant Bottom Navigation */}
      <nav aria-label="Mobile Merchant Navigation" className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 lg:hidden flex items-center justify-around py-1.5 px-2 shadow-lg">
        {[
          { to: '/store/dashboard', label: 'Overview', icon: Store },
          { to: '/store/products', label: 'Catalog', icon: Package },
          { to: '/store/campaigns', label: 'Ads', icon: Sparkles },
          { to: '/store/analytics', label: 'Analytics', icon: BarChart3 },
          { to: '/store/payment', label: 'Wallet', icon: CreditCard },
          { to: '/store/settings', label: 'Settings', icon: Settings },
        ].map(item => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center py-0.5 px-1 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-orange-600 font-bold' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Merchant Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-4 px-4 border-t border-slate-800 hidden md:block">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">PriceWise Merchant Infrastructure</span>
            <span>•</span>
            <span className="text-[11px] text-slate-400">High-intent shopper price comparisons</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link to="/help" className="hover:text-orange-300">Merchant Help & Docs</Link>
            <Link to="/store/settings" className="hover:text-orange-300">API Webhooks</Link>
            <Link to="/terms" className="hover:text-orange-300">Seller Agreement</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MerchantLayout;
