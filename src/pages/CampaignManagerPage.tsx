import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BarChart3, Pause, Play, Trash2, Eye, MousePointer, DollarSign, Calendar } from 'lucide-react';
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
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchCampaigns();
  }, [filter]);

  const fetchCampaigns = async () => {
    try {
      const status = filter === 'all' ? undefined : filter;
      const response = await api.getStoreCampaigns(status);
      setCampaigns(response.data);
    } catch (error: any) {
      addToast('Failed to load campaigns', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePauseResume = async (campaignId: string, currentStatus: string) => {
    try {
      if (currentStatus === 'active') {
        await api.pauseCampaign(campaignId);
        addToast('Campaign paused', 'success');
      } else {
        await api.resumeCampaign(campaignId);
        addToast('Campaign resumed', 'success');
      }
      fetchCampaigns();
    } catch (error: any) {
      addToast(error.message || 'Failed to update campaign', 'error');
    }
  };

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { color: 'bg-green-100 text-green-700', label: 'Active' },
      paused: { color: 'bg-yellow-100 text-yellow-700', label: 'Paused' },
      out_of_credits: { color: 'bg-red-100 text-red-700', label: 'Out of Credits' },
      completed: { color: 'bg-gray-100 text-gray-700', label: 'Completed' },
      draft: { color: 'bg-blue-100 text-blue-700', label: 'Draft' },
    };
    return badges[status as keyof typeof badges] || badges.draft;
  };

  const getPlacementLabel = (placement: string) => {
    const labels = {
      search_top: 'Top of Search',
      comparison_top: 'Top of Comparison',
      homepage_banner: 'Homepage Banner',
    };
    return labels[placement as keyof typeof labels] || placement;
  };

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campaign Manager</h1>
            <p className="text-gray-600 mt-1">Create and manage your sponsored listing campaigns</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus size={20} /> New Campaign
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['all', 'active', 'paused', 'completed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Campaigns List */}
        {campaigns.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-500 mb-6">Create your first campaign to start promoting your products</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
            >
              Create Campaign
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map(campaign => {
              const badge = getStatusBadge(campaign.status);
              const budgetUsed = (campaign.spentAmount / campaign.totalBudget) * 100;

              return (
                <div key={campaign._id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{campaign.campaignName}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {getPlacementLabel(campaign.placementLocation)} • 
                        {campaign.productId ? ` Product: ${campaign.productId}` : ` Category: ${campaign.targetCategory}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {campaign.status === 'active' && (
                        <button
                          onClick={() => handlePauseResume(campaign._id, campaign.status)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Pause campaign"
                        >
                          <Pause size={20} />
                        </button>
                      )}
                      {(campaign.status === 'paused' || campaign.status === 'out_of_credits') && (
                        <button
                          onClick={() => handlePauseResume(campaign._id, campaign.status)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Resume campaign"
                        >
                          <Play size={20} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Budget Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Budget Progress</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(campaign.spentAmount)} / {formatCurrency(campaign.totalBudget)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          budgetUsed >= 90 ? 'bg-red-500' : budgetUsed >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Eye size={16} className="text-gray-400" />
                        <span className="text-xs text-gray-500">Impressions</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{campaign.totalImpressions.toLocaleString()}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <MousePointer size={16} className="text-gray-400" />
                        <span className="text-xs text-gray-500">Clicks</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{campaign.totalClicks.toLocaleString()}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <BarChart3 size={16} className="text-gray-400" />
                        <span className="text-xs text-gray-500">CTR</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{campaign.clickThroughRate.toFixed(2)}%</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign size={16} className="text-gray-400" />
                        <span className="text-xs text-gray-500">CPC</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{formatCurrency(campaign.costPerClick)}</p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={14} />
                      <span>Started: {new Date(campaign.startDate).toLocaleDateString()}</span>
                    </div>
                    {campaign.endDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar size={14} />
                        <span>Ends: {new Date(campaign.endDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <CreateCampaignModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchCampaigns();
          }}
        />
      )}
    </div>
  );
};

interface CreateCampaignModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({ onClose, onSuccess }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    campaignName: '',
    productId: '',
    targetCategory: '',
    totalBudget: '',
    costPerClick: '',
    placementLocation: 'search_top' as 'search_top' | 'comparison_top' | 'homepage_banner',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.createCampaign({
        campaignName: formData.campaignName,
        productId: formData.productId || undefined,
        targetCategory: formData.targetCategory || undefined,
        totalBudget: parseFloat(formData.totalBudget),
        costPerClick: parseFloat(formData.costPerClick),
        placementLocation: formData.placementLocation,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
      });

      addToast('Campaign created successfully!', 'success');
      onSuccess();
    } catch (error: any) {
      addToast(error.message || 'Failed to create campaign', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create New Campaign</h2>
          <p className="text-gray-600 mt-1">Set up a sponsored listing campaign</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name *</label>
            <input
              type="text"
              value={formData.campaignName}
              onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Summer Sale Campaign"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product ID (optional)</label>
              <input
                type="text"
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="product_123"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Category (optional)</label>
              <input
                type="text"
                value={formData.targetCategory}
                onChange={(e) => setFormData({ ...formData, targetCategory: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="phones"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Placement Location *</label>
            <select
              value={formData.placementLocation}
              onChange={(e) => setFormData({ ...formData, placementLocation: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="search_top">Top of Search Results</option>
              <option value="comparison_top">Top of Comparison Table</option>
              <option value="homepage_banner">Homepage Banner</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Budget (₦) *</label>
              <input
                type="number"
                value={formData.totalBudget}
                onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
                required
                min="100"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="10000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cost Per Click (₦) *</label>
              <input
                type="number"
                value={formData.costPerClick}
                onChange={(e) => setFormData({ ...formData, costPerClick: e.target.value })}
                required
                min="10"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date (optional)</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CampaignManagerPage;
