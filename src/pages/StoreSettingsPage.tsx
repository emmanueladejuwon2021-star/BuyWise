import React, { useState, useEffect } from 'react';
import { Store, MapPin, Mail, Phone, Globe, Save, Building, ShieldCheck, Key } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const StoreSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    businessName: user?.storeDetails?.businessName || 'Verified Electronics Hub',
    logoUrl: user?.storeDetails?.logoUrl || '',
    description: 'Direct retailer and distributor for original mobile phones, laptops and home electronics with full manufacturer warranty.',
    address: '14 Computer Village, Otigba Street, Ikeja',
    city: 'Ikeja',
    state: 'Lagos',
    deliveryAreas: 'Lagos Island, Ikeja, Lekki, Victoria Island, Surulere, Abuja Central, Port Harcourt',
    contactEmail: user?.email || 'sales@electronicshub.ng',
    contactPhone: '+234 803 123 4567',
    website: 'https://electronicshub.ng',
    bankName: 'Guaranty Trust Bank (GTB)',
    accountNumber: '0123456789',
    accountName: 'Electronics Hub Nigeria Ltd',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      addToast('Store settings, delivery regions and payout credentials updated successfully!', 'success');
    }, 600);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            <Store size={20} className="text-orange-600" />
            Merchant Profile & Settings
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure your store identity, shipping coverage areas, contact details, and payout accounts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <ShieldCheck size={13} /> Verified Merchant
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Business Info */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs space-y-3">
          <h2 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <Building size={16} className="text-orange-600" />
            Store Identification
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Business Name</label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Official Website / Link</label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Store Description & Warranty Guarantee</label>
            <textarea
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Location & Coverage */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs space-y-3">
          <h2 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <MapPin size={16} className="text-orange-600" />
            Physical Address & Supported Delivery Regions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Physical Store Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">State / Province</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Active Delivery Areas (Comma separated)
            </label>
            <input
              type="text"
              name="deliveryAreas"
              value={formData.deliveryAreas}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-orange-500"
            />
            <p className="text-[10px] text-gray-400 mt-0.5">
              Shoppers in these zones will see your store highlighted with fast delivery badges
            </p>
          </div>
        </div>

        {/* Contact & Notifications */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs space-y-3">
          <h2 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <Phone size={16} className="text-orange-600" />
            Direct Shopper Inquiries & Contact
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Direct Phone / WhatsApp</label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Support Email</label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Payout Details */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs space-y-3">
          <h2 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <Key size={16} className="text-orange-600" />
            Direct Settlement Bank Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Bank Name</label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Account Number</label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Account Holder Name</label>
              <input
                type="text"
                name="accountName"
                value={formData.accountName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-xs font-semibold hover:opacity-95 shadow-xs flex items-center gap-1.5 transition-opacity"
          >
            <Save size={14} />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default StoreSettingsPage;
