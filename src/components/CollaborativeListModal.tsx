import React, { useState } from 'react';
import { Users, Share2, Copy, Check, Plus, Trash2, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { products, getBestDeal } from '../data/products';
import { useRegion } from '../context/RegionContext';

interface CollaborativeListModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProductId?: string;
}

export const CollaborativeListModal: React.FC<CollaborativeListModalProps> = ({
  isOpen,
  onClose,
  initialProductId,
}) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { formatPrice } = useRegion();

  const [listTitle, setListTitle] = useState('Lagos Smart Setup');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(() => {
    if (initialProductId) return [initialProductId, '2', '3'];
    return ['1', '2', '3'];
  });
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const listItems = products.filter(p => selectedProductIds.includes(p.id));
  const totalBestPrice = listItems.reduce((sum, item) => {
    const { listing } = getBestDeal(item);
    return sum + listing.price;
  }, 0);

  const shareCode = `LIST-${Math.abs(listTitle.length * 1337).toString(36).toUpperCase()}`;
  const shareUrl = `${window.location.origin}/shared-list/${shareCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    addToast('Shared list link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveItem = (id: string) => {
    setSelectedProductIds(prev => prev.filter(item => item !== id));
    addToast('Item removed from list', 'info');
  };

  const handleShareWhatsApp = () => {
    const msg = encodeURIComponent(
      `Check out our shopping list "${listTitle}" on PriceWise. Lowest combined basket price is ${formatPrice(totalBestPrice, '₦')}: ${shareUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative border border-gray-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
              <Users size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900">Collaborative Shopping List</h3>
              <p className="text-[11px] text-gray-500">Plan purchases and compare total basket cost with friends</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">
            ✕
          </button>
        </div>

        {/* List Title Input */}
        <div className="mb-4">
          <label className="block text-[11px] font-medium text-gray-600 mb-1">List Name</label>
          <input
            type="text"
            value={listTitle}
            onChange={(e) => setListTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:border-indigo-500"
            placeholder="e.g. Creator Setup, Wedding Registry"
          />
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-1">
          {listItems.length === 0 ? (
            <p className="text-xs text-center text-gray-400 py-6">No items in list</p>
          ) : (
            listItems.map(prod => {
              const { listing } = getBestDeal(prod);
              return (
                <div key={prod.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={prod.images[0]} alt={prod.name} className="w-10 h-10 object-cover rounded-lg shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{prod.name}</p>
                      <p className="text-[11px] text-gray-500">
                        Best: <strong className="text-green-600">{formatPrice(listing.price, listing.currency)}</strong> at {listing.store.name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(prod.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-white"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Total Cost Summary */}
        <div className="p-3 bg-indigo-50 rounded-xl mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-indigo-700">Combined Lowest Basket Price</p>
            <p className="text-xs text-indigo-900 font-medium">Auto-calculated across best store prices</p>
          </div>
          <p className="text-base sm:text-lg font-extrabold text-indigo-700">
            {formatPrice(totalBestPrice, '₦')}
          </p>
        </div>

        {/* Share Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
          <button
            onClick={handleCopyLink}
            className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
            <span>{copied ? 'Link Copied' : 'Copy Share Link'}</span>
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Share2 size={14} />
            <span>Share via WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
