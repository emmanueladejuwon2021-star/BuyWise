import React, { useState } from 'react';
import { Truck, Calculator, MapPin, DollarSign, Info, Shield, CheckCircle, Package } from 'lucide-react';
import { useRegion } from '../context/RegionContext';
import { stores } from '../data/products';

interface DestinationState {
  id: string;
  name: string;
  zone: 'lagos' | 'south-west' | 'abuja' | 'south-south' | 'north' | 'east';
  deliveryDaysLocal: string;
  deliveryDaysInternational: string;
}

const states: DestinationState[] = [
  { id: 'lagos-island', name: 'Lagos (Island - Lekki, VI, Ikoyi)', zone: 'lagos', deliveryDaysLocal: '1-2 Days', deliveryDaysInternational: '7-12 Days' },
  { id: 'lagos-mainland', name: 'Lagos (Mainland - Ikeja, Yaba, Surulere)', zone: 'lagos', deliveryDaysLocal: '1-2 Days', deliveryDaysInternational: '7-12 Days' },
  { id: 'abuja', name: 'Abuja (FCT)', zone: 'abuja', deliveryDaysLocal: '2-3 Days', deliveryDaysInternational: '8-14 Days' },
  { id: 'rivers', name: 'Rivers (Port Harcourt)', zone: 'south-south', deliveryDaysLocal: '2-4 Days', deliveryDaysInternational: '9-15 Days' },
  { id: 'oyo', name: 'Oyo (Ibadan)', zone: 'south-west', deliveryDaysLocal: '2-3 Days', deliveryDaysInternational: '8-14 Days' },
  { id: 'kano', name: 'Kano (Kano Metro)', zone: 'north', deliveryDaysLocal: '3-5 Days', deliveryDaysInternational: '10-18 Days' },
  { id: 'enugu', name: 'Enugu (Enugu Capital)', zone: 'east', deliveryDaysLocal: '3-5 Days', deliveryDaysInternational: '9-16 Days' },
  { id: 'delta', name: 'Delta (Asaba, Warri)', zone: 'south-south', deliveryDaysLocal: '2-4 Days', deliveryDaysInternational: '9-15 Days' },
  { id: 'ogun', name: 'Ogun (Abeokuta, Ota)', zone: 'south-west', deliveryDaysLocal: '2-3 Days', deliveryDaysInternational: '8-14 Days' },
];

const categories = [
  { id: 'phones', name: 'Smartphone / Tablet (Light, < 1kg)', baseShipping: 1800, amazonDutyRate: 0.10 },
  { id: 'laptops', name: 'Laptop / PC Tech (Medium, 1-3kg)', baseShipping: 3200, amazonDutyRate: 0.12 },
  { id: 'appliances', name: 'Large Appliance / TV (Heavy, > 5kg)', baseShipping: 7500, amazonDutyRate: 0.15 },
  { id: 'accessories', name: 'Small Gadget / Earbuds (< 0.5kg)', baseShipping: 1200, amazonDutyRate: 0.08 },
];

const ShippingCalculatorPage: React.FC = () => {
  const { formatPrice } = useRegion();
  const [selectedStateId, setSelectedStateId] = useState<string>('lagos-mainland');
  const [selectedCategory, setSelectedCategory] = useState<string>('phones');
  const [itemPrice, setItemPrice] = useState<number>(250000);

  const currentState = states.find(s => s.id === selectedStateId) || states[0];
  const currentCat = categories.find(c => c.id === selectedCategory) || categories[0];

  // Calculate fees per store
  const calculateStoreEstimate = (storeId: string) => {
    let zoneMultiplier = 1.0;
    if (currentState.zone === 'lagos') zoneMultiplier = 1.0;
    else if (currentState.zone === 'abuja' || currentState.zone === 'south-west') zoneMultiplier = 1.35;
    else zoneMultiplier = 1.65;

    if (storeId === 'jumia') {
      const shipping = Math.round(currentCat.baseShipping * zoneMultiplier);
      const doorstep = shipping + 600;
      return {
        storeName: 'Jumia Nigeria',
        pickupPrice: shipping,
        doorstepPrice: doorstep,
        customsFee: 0,
        deliveryTime: currentState.deliveryDaysLocal,
        totalWithItem: itemPrice + doorstep,
        notes: 'Free pickup available at select Hubs in Lagos & Abuja',
      };
    } else if (storeId === 'konga') {
      const shipping = Math.round((currentCat.baseShipping + 300) * zoneMultiplier);
      return {
        storeName: 'Konga Express',
        pickupPrice: shipping - 500,
        doorstepPrice: shipping,
        customsFee: 0,
        deliveryTime: currentState.deliveryDaysLocal,
        totalWithItem: itemPrice + shipping,
        notes: 'Doorstep express delivery via Konga Logistics',
      };
    } else if (storeId === 'slot') {
      const shipping = currentState.zone === 'lagos' ? 1500 : 3500;
      return {
        storeName: 'Slot Systems',
        pickupPrice: 0, // Free store pickup
        doorstepPrice: shipping,
        customsFee: 0,
        deliveryTime: currentState.deliveryDaysLocal,
        totalWithItem: itemPrice + shipping,
        notes: 'Free store pickup at 60+ physical Slot shops nationwide',
      };
    } else {
      // Amazon (Global Import)
      const airFreight = Math.round(18500 * (currentCat.id === 'appliances' ? 3.5 : 1));
      const importDuty = Math.round(itemPrice * currentCat.amazonDutyRate);
      const totalDelivery = airFreight + importDuty;
      return {
        storeName: 'Amazon (International Direct to NG)',
        pickupPrice: totalDelivery,
        doorstepPrice: totalDelivery,
        customsFee: importDuty,
        deliveryTime: currentState.deliveryDaysInternational,
        totalWithItem: itemPrice + totalDelivery,
        notes: 'Includes international courier + Nigerian customs pre-clearance',
      };
    }
  };

  const storeCalculations = ['jumia', 'konga', 'slot', 'amazon'].map(id => ({
    id,
    ...calculateStoreEstimate(id),
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-3 sm:py-6 px-2.5 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-xs mb-4">
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1.5">
            <Calculator size={13} /> Total Cost Calculator
          </div>
          <h1 className="text-lg sm:text-2xl font-black text-gray-900 mb-1">
            Shipping & Doorstep Delivery Calculator
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-2xl leading-relaxed">
            Never be surprised by delivery charges or customs duty. Choose your state and product category to see the true landed price across all top stores.
          </p>
        </div>

        {/* Inputs Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3.5 sm:p-5 shadow-xs mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* State selection */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                <MapPin size={12} className="text-indigo-600" /> Delivery Destination
              </label>
              <select
                value={selectedStateId}
                onChange={(e) => setSelectedStateId(e.target.value)}
                className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:border-indigo-500"
              >
                {states.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Product Category */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                <Package size={12} className="text-indigo-600" /> Item Size / Weight
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:border-indigo-500"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Approximate Price */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                <DollarSign size={12} className="text-indigo-600" /> Item Price (₦)
              </label>
              <input
                type="number"
                min="5000"
                step="5000"
                value={itemPrice}
                onChange={(e) => setItemPrice(Number(e.target.value) || 0)}
                className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Store Comparison Cards */}
        <div className="space-y-3">
          <h2 className="text-sm sm:text-base font-bold text-gray-900">
            Delivery Fee & Total Landed Cost Comparison
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {storeCalculations.map(store => (
              <div
                key={store.id}
                className="bg-white rounded-xl border border-gray-200 p-3.5 sm:p-4 shadow-xs hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 mb-2.5">
                  <h3 className="font-bold text-xs sm:text-sm text-gray-900">{store.storeName}</h3>
                  <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {store.deliveryTime}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs mb-3">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Base Item Price:</span>
                    <span className="font-semibold text-gray-900">{formatPrice(itemPrice, '₦')}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Doorstep Shipping:</span>
                    <span className="font-semibold text-gray-900">{formatPrice(store.doorstepPrice, '₦')}</span>
                  </div>
                  {store.customsFee > 0 && (
                    <div className="flex items-center justify-between text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                      <span>Estimated Customs / Duty:</span>
                      <span className="font-bold">{formatPrice(store.customsFee, '₦')}</span>
                    </div>
                  )}
                  <div className="pt-1.5 border-t border-gray-100 flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-gray-800">Final Total Cost:</span>
                    <span className="font-black text-indigo-600 text-sm sm:text-base">
                      {formatPrice(store.totalWithItem, '₦')}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] sm:text-[11px] text-gray-500 bg-gray-50 p-2 rounded-lg flex items-start gap-1.5">
                  <Info size={12} className="text-indigo-500 shrink-0 mt-0.5" />
                  <span>{store.notes}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingCalculatorPage;
