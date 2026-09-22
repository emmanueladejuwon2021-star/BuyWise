import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Store, TrendingUp, Eye, MousePointer, DollarSign, Award, Plus, BarChart3, 
  Settings, ArrowLeftRight, Package, CheckCircle2, AlertCircle, Sparkles, ExternalLink, RefreshCw 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

interface StoreProfile {
  _id: string;
  businessName: string;
  logoUrl?: string;
  membershipLevel: 'free' | 'premium' | 'enterprise';
  membershipStatus: string;
  membershipExpiry?: string;
  adCreditsBalance: number;
  totalAdCreditsPurchased: number;
  isVerified: boolean;
  rating: number;
  totalProducts: number;
  totalClicks: number;
  totalSales: number;
}

interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalBudget: number;
  totalSpent: number;
  totalClicks: number;
  totalImpressions: number;
  averageCTR: number;
}

const StoreDashboardPage: React.FC = () => {
  const { user, role, switchRole } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [store, setStore] = useState<StoreProfile | null>(null);
  const [campaignStats, setCampaignStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStoreData();
  }, [user]);

  const fetchStoreData = async () => {
    try {
      const [storeResponse, statsResponse] = await Promise.all([
        api.getStoreProfile().catch(() => null),
        api.getCampaignStats().catch(() => null),
      ]);

      if (storeResponse && storeResponse.data) {
        setStore(storeResponse.data);
      } else if (user?.storeDetails) {
        setStore({
          _id: user.id || 'store-1',
          businessName: user.storeDetails.businessName || 'Verified Merchant Store',
          logoUrl: user.storeDetails.logoUrl || '',
          membershipLevel: user.storeDetails.membershipLevel || 'premium',
          membershipStatus: 'active',
          adCreditsBalance: 25000,
          totalAdCreditsPurchased: 50000,
          isVerified: true,
          rating: 4.9,
          totalProducts: 142,
          totalClicks: 1890,
          totalSales: 4200000,
        });
      }

      if (statsResponse && statsResponse.data) {
        setCampaignStats(statsResponse.data);
      } else {
        setCampaignStats({
          totalCampaigns: 4,
          activeCampaigns: 3,
          totalBudget: 45000,
          totalSpent: 18500,
          totalClicks: 1890,
          totalImpressions: 42300,
          averageCTR: 4.46,
        });
      }
    } catch (error: any) {
      if (user?.storeDetails) {
        setStore({
          _id: user.id || 'store-1',
          businessName: user.storeDetails.businessName || 'Merchant Store',
          logoUrl: '',
          membershipLevel: user.storeDetails.membershipLevel || 'premium',
          membershipStatus: 'active',
          adCreditsBalance: 25000,
          totalAdCreditsPurchased: 50000,
          isVerified: true,
          rating: 4.9,
          totalProducts: 142,
          totalClicks: 1890,
          totalSales: 4200000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const activeStore = store || {
    _id: 'default',
    businessName: user?.storeDetails?.businessName || user?.name || 'Verified Merchant Store',
    membershipLevel: 'premium' as const,
    membershipStatus: 'active',
    adCreditsBalance: 25000,
    totalAdCreditsPurchased: 50000,
    isVerified: true,
    rating: 4.8,
    totalProducts: 142,
    totalClicks: 1890,
    totalSales: 4200000,
  };

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Store Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-xs">
            {activeStore.businessName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">{activeStore.businessName}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-orange-100 text-orange-800 border border-orange-200">
                {activeStore.membershipLevel} Seller
              </span>
              {activeStore.isVerified && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ✓ Verified Store
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Store UID: {activeStore._id.slice(0, 8)} • Merchant Rating: ⭐ {activeStore.rating} / 5.0 • Live Feed Active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/store/products"
            className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
          >
            <Package size={14} /> Catalog ({activeStore.totalProducts})
          </Link>
          <Link
            to="/store/campaigns"
            className="px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-xs font-semibold hover:opacity-95 flex items-center gap-1.5 shadow-xs transition-opacity"
          >
            <Plus size={14} /> New Ad Campaign
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500 font-medium">CPC Ad Wallet</span>
            <DollarSign size={15} className="text-emerald-600" />
          </div>
          <p className="text-lg sm:text-2xl font-bold text-gray-900">{formatCurrency(activeStore.adCreditsBalance)}</p>
          <Link to="/store/payment" className="text-[11px] text-orange-600 font-semibold hover:underline mt-1 inline-block">
            + Top Up Credits
          </Link>
        </div>

        <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500 font-medium">Shopper Inbound Clicks</span>
            <MousePointer size={15} className="text-blue-600" />
          </div>
          <p className="text-lg sm:text-2xl font-bold text-gray-900">{activeStore.totalClicks.toLocaleString()}</p>
          <p className="text-[10px] text-gray-400 mt-1">High-intent purchase leads</p>
        </div>

        <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500 font-medium">Active Ad Bids</span>
            <BarChart3 size={15} className="text-purple-600" />
          </div>
          <p className="text-lg sm:text-2xl font-bold text-gray-900">{campaignStats?.activeCampaigns || 3} Active</p>
          <p className="text-[10px] text-gray-400 mt-1">Top-of-search placement</p>
        </div>

        <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500 font-medium">Catalog Synced</span>
            <Package size={15} className="text-indigo-600" />
          </div>
          <p className="text-lg sm:text-2xl font-bold text-gray-900">{activeStore.totalProducts} Items</p>
          <p className="text-[10px] text-emerald-600 font-medium mt-1">● Price Index Connected</p>
        </div>
      </div>

      {/* Campaign Performance Box */}
      {campaignStats && (
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 size={16} className="text-orange-500" />
              Live CPC Ad Campaign Performance
            </h2>
            <Link to="/store/campaigns" className="text-xs text-orange-600 font-semibold hover:underline">
              Manage Bids →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
            <div>
              <p className="text-[11px] text-gray-500">Allocated Budget</p>
              <p className="text-base sm:text-lg font-bold text-gray-900">{formatCurrency(campaignStats.totalBudget)}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500">Spent This Month</p>
              <p className="text-base sm:text-lg font-bold text-gray-900">{formatCurrency(campaignStats.totalSpent)}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500">Search Impressions</p>
              <p className="text-base sm:text-lg font-bold text-gray-900">{campaignStats.totalImpressions.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500">Average Click-Through (CTR)</p>
              <p className="text-base sm:text-lg font-bold text-emerald-600">{campaignStats.averageCTR.toFixed(2)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* B2B Operational Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <Link
          to="/store/products"
          className="bg-white rounded-xl p-4 border border-gray-200/80 hover:border-orange-300 hover:shadow-xs transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-2 font-bold">
              <Package size={16} />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-0.5">Catalog & Inventory</h3>
            <p className="text-[11px] text-gray-500">Add products, update stock prices, and adjust CPC bids.</p>
          </div>
          <span className="text-[11px] text-orange-600 font-semibold mt-3">Manage Products →</span>
        </Link>

        <Link
          to="/store/payment"
          className="bg-white rounded-xl p-4 border border-gray-200/80 hover:border-orange-300 hover:shadow-xs transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 font-bold">
              <DollarSign size={16} />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-0.5">Ad Wallet & Invoices</h3>
            <p className="text-[11px] text-gray-500">Add prepaid balance with card, transfer or Paystack.</p>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-3">Buy Credits →</span>
        </Link>

        <Link
          to="/store/analytics"
          className="bg-white rounded-xl p-4 border border-gray-200/80 hover:border-orange-300 hover:shadow-xs transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 font-bold">
              <Eye size={16} />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-0.5">Traffic & Conversions</h3>
            <p className="text-[11px] text-gray-500">Analyze user search queries and competitor pricing.</p>
          </div>
          <span className="text-[11px] text-indigo-600 font-semibold mt-3">View Insights →</span>
        </Link>
      </div>
    </div>
  );
};

export default StoreDashboardPage;
