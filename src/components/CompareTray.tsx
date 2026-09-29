import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, X } from 'lucide-react';
import { useShopFlow } from '../context/ShopFlowContext';

const CompareTray: React.FC = () => {
  const { compareIds, clearCompare } = useShopFlow();
  if (compareIds.length === 0) return null;

  return (
    <div className="fixed bottom-16 md:bottom-4 left-0 right-0 z-40 px-3 pointer-events-none">
      <div className="max-w-xl mx-auto pointer-events-auto bg-gray-900 text-white rounded-2xl shadow-lg px-4 py-3 flex items-center justify-between gap-3">
        <p className="text-sm font-medium">
          {compareIds.length} item{compareIds.length === 1 ? '' : 's'} ready to compare
        </p>
        <div className="flex items-center gap-2">
          <Link
            to={`/compare?ids=${compareIds.join(',')}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 rounded-full text-sm font-semibold"
          >
            <Scale size={14} /> Compare
          </Link>
          <button
            onClick={clearCompare}
            className="p-1.5 rounded-full hover:bg-white/10"
            aria-label="Clear compare list"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompareTray;
