import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, MapPin, Mail, Phone, Globe, Upload, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

const StoreRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, registerSellerStore, login } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    logoUrl: '',
    description: '',
    address: '',
    city: '',
    state: '',
    deliveryAreas: '',
    contactEmail: user?.email || '',
    contactPhone: '',
    website: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.registerStore({
        ...formData,
        deliveryAreas: formData.deliveryAreas.split(',').map(area => area.trim()),
      });

      if (user) {
        registerSellerStore({
          businessName: formData.businessName,
          logoUrl: formData.logoUrl,
          description: formData.description,
        });
      } else {
        login(formData.contactEmail || 'merchant@store.com', 'password', 'seller', formData.businessName);
      }

      addToast(`🎉 Store "${formData.businessName}" registered! Welcome to the Merchant Portal.`, 'success');
      navigate('/store/dashboard');
    } catch (error: any) {
      addToast(error.message || 'Failed to register store', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-10 px-3 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-5 sm:mb-8">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-2 text-indigo-600">
            <Store size={24} />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">Register Your Store</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Join PriceWise and reach thousands of shoppers</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-sm border border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4">
          <div className="mb-5">
            <h2 className="text-sm sm:text-base font-bold text-gray-900 mb-3 pb-1.5 border-b border-gray-100">Business Information</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="sm:col-span-2">
                <label className="block text-gray-700 text-xs font-semibold mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  className="border border-gray-200 rounded-lg w-full py-2 px-3 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-indigo-500"
                  placeholder="Your Store Name"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gray-700 text-xs font-semibold mb-1">
                  Logo URL
                </label>
                <input
                  type="url"
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleChange}
                  className="border border-gray-200 rounded-lg w-full py-2 px-3 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-indigo-500"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gray-700 text-xs font-semibold mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  className="border border-gray-200 rounded-lg w-full py-2 px-3 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-indigo-500"
                  placeholder="Tell shoppers about your store..."
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gray-700 text-xs font-semibold mb-1">
                  <MapPin size={13} className="inline mr-1" />
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="border border-gray-200 rounded-lg w-full py-2 px-3 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-indigo-500"
                  placeholder="123 Business Street"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-xs font-semibold mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="border border-gray-200 rounded-lg w-full py-2 px-3 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-indigo-500"
                  placeholder="Lagos"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-xs font-semibold mb-1">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="border border-gray-200 rounded-lg w-full py-2 px-3 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-indigo-500"
                  placeholder="Lagos State"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gray-700 text-xs font-semibold mb-1">
                  Delivery Areas (comma-separated)
                </label>
                <input
                  type="text"
                  name="deliveryAreas"
                  value={formData.deliveryAreas}
                  onChange={handleChange}
                  className="border border-gray-200 rounded-lg w-full py-2 px-3 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-indigo-500"
                  placeholder="Lagos, Abuja, Port Harcourt"
                />
              </div>
            </div>
          </div>

          <div className="mb-5">
            <h2 className="text-sm sm:text-base font-bold text-gray-900 mb-3 pb-1.5 border-b border-gray-100">Contact Information</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-gray-700 text-xs font-semibold mb-1">
                  <Mail size={13} className="inline mr-1" />
                  Contact Email *
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  required
                  className="border border-gray-200 rounded-lg w-full py-2 px-3 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-indigo-500"
                  placeholder="store@example.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-xs font-semibold mb-1">
                  <Phone size={13} className="inline mr-1" />
                  Contact Phone
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="border border-gray-200 rounded-lg w-full py-2 px-3 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-indigo-500"
                  placeholder="+234 800 000 0000"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gray-700 text-xs font-semibold mb-1">
                  <Globe size={13} className="inline mr-1" />
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="border border-gray-200 rounded-lg w-full py-2 px-3 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-indigo-500"
                  placeholder="https://yourstore.com"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-2 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-lg text-xs sm:text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Registering...' : 'Register Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoreRegistrationPage;
