import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useToast } from '../context/ToastContext';

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
  totalImpressions: number;
  totalClicks: number;
  clickThroughRate: number;
  isActive: boolean;
}

const CampaignManagerPage: React.FC = () => {
  const { addToast } = useToast();
  const [campaigns] = useState<Campaign[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
            <p className="text-sm text-gray-500 mt-1">No sample campaigns. Add one when you have a real product and budget.</p>
          </div>
          <button onClick={() => { setShowCreateModal(true); addToast('Create form is ready. No mock campaign was added.', 'info'); }} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold">
            <Plus size={16} /> New campaign
          </button>
        </div>
        {campaigns.length === 0 && (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl px-6 py-16 text-center">
            <p className="text-lg font-semibold text-gray-800">No campaigns yet</p>
            <p className="text-base text-gray-500 mt-2">Lists stay empty until you create one.</p>
            <Link to="/store/products" className="inline-block mt-6 text-indigo-600 font-semibold">Add a product first</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignManagerPage;
