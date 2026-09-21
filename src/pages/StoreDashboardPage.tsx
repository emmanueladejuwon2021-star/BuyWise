import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, TrendingUp, Eye, MousePointer, DollarSign, Award, Plus, BarChart3, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

interface StoreProfile {
  _id: string;
  businessName: string;
  logoUrl: string;
  membershipLevel: 'free' | 'premium' | 'enterprise';
  membershipStatus: string;
  membershipExpiry: string;
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
  const { user } = useAuth();
  const { addToast } = useToast();
  const [store, setStore] = useState<StoreProfile | null>(null);
  const [campaignStats, setCampaignStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    try {
      const [storeResponse, statsResponse] = await Promise.all([
        api.getStoreProfile(),
        api.getCampaignStats(),
      ]);

      setStore(storeResponse.data);
      setCampaignStats(statsResponse.data);
    } catch (error: any) {
      addToast('Failed to load store data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Store size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Store Found</h2>
          <p className="text-gray-500 mb-6">Register your store to get started</p>
          <Link to="/store/register" className="px-6 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700">
            Register Store
          </Link>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  const getMembershipBadge = (level: string) => {
    const badges = {
      free: { color: 'bg-gray-100 text-gray-700', label: 'Free' },
      premium: { color: 'bg-indigo-100 text-indigo-700', label: 'Premium' },
      enterprise: { color: 'bg-purple-100 text-purple-700', label: 'Enterprise' },
    };
    return badges[level as keyof typeof badges] || badges.free;
  };

  const badge = getMembershipBadge(store.membershipLevel);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.businessName} className="w-16 h-16 rounded-xl object-cover" />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                  {store.businessName.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{store.businessName}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                    {badge.label}
                  </span>
                  {store.isVerified && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      ✓ Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/store/settings" className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <Settings size={16} /> Settings
              </Link>
              <Link to="/store/campaigns" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
                <Plus size={16} /> New Campaign
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Ad Credits</span>
              <DollarSign size={20} className="text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{store.adCreditsBalance.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">credits available</p>
            <Link to="/store/payment" className="text-xs text-indigo-600 font-medium mt-2 hover:underline">
              Buy more credits →
            </Link>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Total Clicks</span>
              <MousePointer size={20} className="text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{store.totalClicks.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">all-time clicks</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Active Campaigns</span>
              <BarChart3 size={20} className="text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{campaignStats?.activeCampaigns || 0}</p>
            <p className="text-xs text-gray-500 mt-1">of {campaignStats?.totalCampaigns || 0} total</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Store Rating</span>
              <Award size={20} className="text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{store.rating.toFixed(1)}</p>
            <p className="text-xs text-gray-500 mt-1">out of 5.0</p>
          </div>
        </div>

        {/* Campaign Performance */}
        {campaignStats && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Campaign Performance</h2>
              <Link to="/store/campaigns" className="text-sm text-indigo-600 font-medium hover:underline">
                View all campaigns →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(campaignStats.totalBudget)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(campaignStats.totalSpent)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Impressions</p>
                <p className="text-2xl font-bold text-gray-900">{campaignStats.totalImpressions.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Average CTR</p>
                <p className="text-2xl font-bold text-gray-900">{campaignStats.averageCTR.toFixed(2)}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link to="/store/campaigns" className="bg-white rounded-xl p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
            <BarChart3 size={32} className="text-indigo-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Manage Campaigns</h3>
            <p className="text-sm text-gray-500">Create and manage your ad campaigns</p>
          </Link>

          {store.membershipLevel === 'free' && (
            <Link to="/store/payment" className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl p-6 hover:shadow-lg transition-all">
              <TrendingUp size={32} className="text-white mb-3" />
              <h3 className="text-lg font-semibold text-white mb-1">Upgrade to Premium</h3>
              <p className="text-sm text-white/80">Get verified badge, analytics, and 500 free credits</p>
            </Link>
          )}

          {store.membershipLevel !== 'free' && (
            <Link to="/store/analytics" className="bg-white rounded-xl p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
              <Eye size={32} className="text-indigo-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">View Analytics</h3>
              <p className="text-sm text-gray-500">Market insights and performance reports</p>
            </Link>
          )}

          <Link to="/store/payment" className="bg-white rounded-xl p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
            <DollarSign size={32} className="text-green-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Buy Credits</h3>
            <p className="text-sm text-gray-500">Purchase ad credits for campaigns</p>
          </Link>
        </div>

        {/* Membership Info */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Membership Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Plan</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">{store.membershipLevel}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">{store.membershipStatus}</p>
            </div>
            {store.membershipExpiry && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Expires On</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(store.membershipExpiry).toLocaleDateString()}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Credits Purchased</p>
              <p className="text-lg font-semibold text-gray-900">{store.totalAdCreditsPurchased.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreDashboardPage;
