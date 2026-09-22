import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, BarChart3, Pause, Play, Trash2, Eye, MousePointer, 
  DollarSign, Calendar, Sparkles, AlertCircle, ArrowUpRight 
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

interface Campaign {
  _id: string;
  campaignName: string;
  productId?: string;
  targetCategory?: string;
  totalBudget: number;
  spentAmount: number;
  costPerClick: number;
  placementLocation: 'search_top' | 'comparison_top' | 'homepage_banner';
  status: 'active' | 'paused' | 'out_of_credits' | 'completed' | 'draft';
  startDate: string;
  endDate?: string;
  totalImpressions: number;
  totalClicks: number;
  clickThroughRate: number;
  isActive: boolean;
}

const CampaignManagerPage: React.FC = () => {
  const { addToast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      _id: 'camp-1',
      campaignName: 'Samsung S24 Ultra Search Dominance',
      productId: 'Samsung Galaxy S24 Ultra',
      targetCategory: 'smartphones',
      totalBudget: 25000,
      spentAmount: 11200,
      costPerClick: 45,
      placementLocation: 'search_top',
      status: 'active',
      startDate: '2026-09-01',
      totalImpressions: 18400,
      totalClicks: 840,
      clickThroughRate: 4.56,
      isActive: true,
    },
    {
      _id: 'camp-2',
      campaignName: 'iPhone 15 Pro Comparison Top Bid',
      productId: 'Apple iPhone 15 Pro Max',
      targetCategory: 'smartphones',
      totalBudget: 35000,
      spentAmount: 19800,
      costPerClick: 50,
      placementLocation: 'comparison_top',
      status: 'active',
      startDate: '2026-09-05',
      totalImpressions: 24500,
      totalClicks: 1250,
      clickThroughRate: 5.1,
      isActive: true,
    },
    {
      _id: 'camp-3',
      campaignName: 'MacBook Pro High-End Workstation CPC',
      productId: 'Apple MacBook Pro 14" M3',
      targetCategory: 'laptops',
      totalBudget: 20000,
      spentAmount: 18500,
      costPerClick: 60,
      placementLocation: 'search_top',
      status: 'active',
      startDate: '2026-09-10',
      totalImpressions: 11200,
      totalClicks: 620,
      clickThroughRate: 5.53,
      isActive: true,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    placement: 'search_top' as const,
    category: 'smartphones',
    budget: '20000',
    cpc: '40',
  });

  const handlePauseResume = (campaignId: string, currentStatus: string) => {
    setCampaigns(campaigns.map(c => {
      if (c._id === campaignId) {
        const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
        return { ...c, status: nextStatus, isActive: nextStatus === 'active' };
      }
      return c;
    }));
    addToast(currentStatus === 'active' ? 'Campaign paused' : 'Campaign resumed and bidding active', 'success');
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.name) {
      addToast('Please enter a campaign name', 'warning');
      return;
    }

    const created: Campaign = {
      _id: `camp-${Date.now()}`,
      campaignName: newCampaign.name,
      targetCategory: newCampaign.category,
      totalBudget: parseFloat(newCampaign.budget) || 15000,
      spentAmount: 0,
      costPerClick: parseFloat(newCampaign.cpc) || 35,
      placementLocation: newCampaign.placement,
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      totalImpressions: 0,
      totalClicks: 0,
      clickThroughRate: 0,
      isActive: true,
    };

    setCampaigns([created, ...campaigns]);
    setShowCreateModal(false);
    setNewCampaign({
      name: '',
      placement: 'search_top',
      category: 'smartphones',
      budget: '20000',
      cpc: '40',
    });
    addToast('CPC campaign launched! Ads will be prioritized in real-time comparison tables.', 'success');
  };

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { color: 'bg-emerald-100 text-emerald-800', label: 'Active & Bidding' },
      paused: { color: 'bg-amber-100 text-amber-800', label: 'Paused' },
      out_of_credits: { color: 'bg-rose-100 text-rose-800', label: 'Out of Credits' },
      completed: { color: 'bg-gray-100 text-gray-700', label: 'Completed' },
      draft: { color: 'bg-blue-100 text-blue-700', label: 'Draft' },
    };
    return badges[status as keyof typeof badges] || badges.draft;
  };

  const getPlacementLabel = (placement: string) => {
    const labels = {
      search_top: 'Top of Search Placement',
      comparison_top: 'Featured Comparison Slot',
      homepage_banner: 'Category Top Header',
    };
    return labels[placement as keyof typeof labels] || placement;
  };

  const filtered = campaigns.filter(c => filter === 'all' || c.status === filter);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles size={20} className="text-orange-600" />
            CPC Ad Campaigns & Bids
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Boost your product rankings on search results, category tables, and store comparison cards
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/store/payment"
            className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
          >
            <DollarSign size={13} /> Add Ad Credits
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-xs font-semibold hover:opacity-95 flex items-center gap-1.5 shadow-xs transition-opacity"
          >
            <Plus size={14} /> New Campaign
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {['all', 'active', 'paused', 'completed'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-colors ${
              filter === status
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {status === 'all' ? 'All Campaigns' : status}
          </button>
        ))}
      </div>

      {/* Campaigns Grid / List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-200/80 shadow-xs">
          <BarChart3 size={36} className="mx-auto text-gray-300 mb-2" />
          <h3 className="text-sm font-bold text-gray-900">No campaigns found</h3>
          <p className="text-xs text-gray-500 mt-1 mb-4">Launch a new CPC campaign to win buyer leads.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-xs font-semibold"
          >
            + Create Campaign
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(campaign => {
            const badge = getStatusBadge(campaign.status);
            const budgetUsed = (campaign.spentAmount / (campaign.totalBudget || 1)) * 100;

            return (
              <div key={campaign._id} className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs hover:border-orange-200 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-bold text-gray-900">{campaign.campaignName}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {getPlacementLabel(campaign.placementLocation)} • Target: {campaign.targetCategory || 'All'} • CPC Bid: <strong className="text-orange-600">{formatCurrency(campaign.costPerClick)}</strong>/click
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handlePauseResume(campaign._id, campaign.status)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
                        campaign.status === 'active'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {campaign.status === 'active' ? (
                        <>
                          <Pause size={12} /> Pause
                        </>
                      ) : (
                        <>
                          <Play size={12} /> Resume
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Budget Progress Bar */}
                <div className="mb-3.5 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500">Budget Consumed:</span>
                    <span className="font-bold text-gray-900">
                      {formatCurrency(campaign.spentAmount)} / {formatCurrency(campaign.totalBudget)} ({budgetUsed.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        budgetUsed >= 90 ? 'bg-rose-500' : budgetUsed >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-400 text-[11px] block">Impressions</span>
                    <span className="font-bold text-gray-900 text-sm">{campaign.totalImpressions.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[11px] block">Clicks Generated</span>
                    <span className="font-bold text-blue-600 text-sm">{campaign.totalClicks.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[11px] block">Click-Through (CTR)</span>
                    <span className="font-bold text-emerald-600 text-sm">{campaign.clickThroughRate.toFixed(2)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[11px] block">Avg. Cost / Lead</span>
                    <span className="font-bold text-gray-900 text-sm">{formatCurrency(campaign.costPerClick)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-1">Create CPC Ad Campaign</h3>
            <p className="text-xs text-gray-500 mb-4">
              Set your target placement, category, budget, and bid amount.
            </p>

            <form onSubmit={handleCreateCampaign} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Campaign Name</label>
                <input
                  type="text"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  placeholder="e.g. Flagship Smartphone Promo"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Ad Placement</label>
                <select
                  value={newCampaign.placement}
                  onChange={(e) => setNewCampaign({ ...newCampaign, placement: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-orange-500 bg-white"
                >
                  <option value="search_top">Top of Search Results (Highest CTR)</option>
                  <option value="comparison_top">Featured Comparison Table Slot</option>
                  <option value="homepage_banner">Category Header Spotlight</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Target Category</label>
                  <select
                    value={newCampaign.category}
                    onChange={(e) => setNewCampaign({ ...newCampaign, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-orange-500 bg-white"
                  >
                    <option value="smartphones">Smartphones</option>
                    <option value="laptops">Laptops</option>
                    <option value="audio">Audio</option>
                    <option value="appliances">Appliances</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Total Budget (₦)</label>
                  <input
                    type="number"
                    value={newCampaign.budget}
                    onChange={(e) => setNewCampaign({ ...newCampaign, budget: e.target.value })}
                    placeholder="25000"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Cost Per Click (CPC) Bid (₦)
                </label>
                <input
                  type="number"
                  value={newCampaign.cpc}
                  onChange={(e) => setNewCampaign({ ...newCampaign, cpc: e.target.value })}
                  placeholder="40"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-orange-500"
                  required
                />
                <p className="text-[10px] text-gray-400 mt-0.5">Higher bids secure rank #1 on comparison queries</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-xs font-semibold hover:opacity-95 shadow-xs"
                >
                  Launch Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignManagerPage;
