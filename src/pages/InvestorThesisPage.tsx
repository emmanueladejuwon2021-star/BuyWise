import React, { useState } from 'react';
import { DollarSign, TrendingUp, Target, Calculator, PieChart, Shield, Landmark, ArrowRight, Award } from 'lucide-react';
import { useRegion } from '../context/RegionContext';

const InvestorThesisPage: React.FC = () => {
  const { formatPrice } = useRegion();

  // Interactive Calculator State
  const [monthlyClicks, setMonthlyClicks] = useState<number>(500000);
  const [cpcRate, setCpcRate] = useState<number>(120); // ₦120 average store visit fee
  const [conversionRatePct, setConversionRatePct] = useState<number>(3.5);
  const [avgOrderValue, setAvgOrderValue] = useState<number>(65000); // ₦65,000 average order
  const [commissionPct, setCommissionPct] = useState<number>(4.0); // 4% store partner fee
  const [vipSubscribers, setVipSubscribers] = useState<number>(15000);

  // Calculations
  const monthlyCpcRevenue = monthlyClicks * cpcRate;
  const monthlyTransactions = Math.round(monthlyClicks * (conversionRatePct / 100));
  const monthlyGmv = monthlyTransactions * avgOrderValue;
  const monthlyCommissionRevenue = Math.round(monthlyGmv * (commissionPct / 100));
  const monthlyVipRevenue = vipSubscribers * 1500;
  const monthlyB2bDataRevenue = 5500000; // ₦5.5M/mo market research
  const totalMonthlyRevenue = monthlyCpcRevenue + monthlyCommissionRevenue + monthlyVipRevenue + monthlyB2bDataRevenue;
  const annualizedRunRate = totalMonthlyRevenue * 12;

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Hero Section */}
        <div className="bg-slate-900 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-xl mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/30 text-indigo-300 rounded-full text-xs font-bold mb-3 border border-indigo-500/40">
              <Landmark size={14} />
              <span>HOW OUR BUSINESS WORKS & GROWS</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
              Helping Millions of African Shoppers Find the Best Deals
            </h1>
            <p className="text-xs sm:text-base text-slate-300 mb-6">
              PriceWise makes online shopping easy and affordable. By bringing together prices, delivery fees, and verified store ratings in one simple place, we help everyday shoppers save money while earning a fair fee from partner stores whenever a purchase is made.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Value Per User</p>
                <p className="text-lg sm:text-2xl font-black text-emerald-400">260x</p>
                <p className="text-[10px] text-slate-400">₦500 to reach / ₦130k lifetime value</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Year 3 Expected Earnings</p>
                <p className="text-lg sm:text-2xl font-black text-indigo-400">₦6.2 Billion</p>
                <p className="text-[10px] text-slate-400">Healthy 68% profit margin</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Market Size</p>
                <p className="text-lg sm:text-2xl font-black text-purple-400">$14.5B</p>
                <p className="text-[10px] text-slate-400">Online shopping in Africa</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Long-Term Company Value</p>
                <p className="text-lg sm:text-2xl font-black text-amber-400">₦50B - 100B</p>
                <p className="text-[10px] text-slate-400">Estimated acquisition value</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Year P&L Table */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-7 mb-8 shadow-xs">
          <div className="mb-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">3-Year Growth & Earnings Summary</h2>
            <p className="text-xs text-gray-500">Estimated growth and earnings based on real shopping trends in Nigeria.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Growth Area</th>
                  <th className="py-2.5 px-3">Year 1 (Launch)</th>
                  <th className="py-2.5 px-3">Year 2 (Expansion)</th>
                  <th className="py-2.5 px-3 font-bold text-indigo-900">Year 3 (Market Leader)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                <tr>
                  <td className="py-3 px-3 text-gray-900">Active Monthly Shoppers</td>
                  <td className="py-3 px-3 text-gray-600">350,000</td>
                  <td className="py-3 px-3 text-gray-600">1,400,000</td>
                  <td className="py-3 px-3 font-bold text-indigo-700">4,200,000</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 text-gray-900">Total Shopper Purchases Handled</td>
                  <td className="py-3 px-3 text-gray-600">₦15.2 Billion</td>
                  <td className="py-3 px-3 text-gray-600">₦65.4 Billion</td>
                  <td className="py-3 px-3 font-bold text-indigo-700">₦172.8 Billion</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 text-gray-900 font-semibold">Total Platform Earnings</td>
                  <td className="py-3 px-3 font-semibold text-gray-900">₦508 Million</td>
                  <td className="py-3 px-3 font-semibold text-gray-900">₦2.41 Billion</td>
                  <td className="py-3 px-3 font-bold text-emerald-600">₦6.24 Billion</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 text-gray-500 pl-6">↳ Store Visit Clicks (40%)</td>
                  <td className="py-3 px-3 text-gray-500">₦203M</td>
                  <td className="py-3 px-3 text-gray-500">₦964M</td>
                  <td className="py-3 px-3 text-gray-500">₦2.50B</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 text-gray-500 pl-6">↳ Partner Store Rewards (30%)</td>
                  <td className="py-3 px-3 text-gray-500">₦152M</td>
                  <td className="py-3 px-3 text-gray-500">₦723M</td>
                  <td className="py-3 px-3 text-gray-500">₦1.87B</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 text-gray-500 pl-6">↳ VIP Club & Market Reports (30%)</td>
                  <td className="py-3 px-3 text-gray-500">₦153M</td>
                  <td className="py-3 px-3 text-gray-500">₦723M</td>
                  <td className="py-3 px-3 text-gray-500">₦1.87B</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-3 px-3 font-bold text-gray-900">Operating Profit Margin</td>
                  <td className="py-3 px-3 font-bold text-gray-700">32% (₦162M)</td>
                  <td className="py-3 px-3 font-bold text-gray-700">54% (₦1.30B)</td>
                  <td className="py-3 px-3 font-bold text-emerald-700">68% (₦4.24B)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Interactive Run-Rate Calculator */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-7 mb-8 shadow-xs">
          <div className="flex items-center gap-2 mb-6">
            <Calculator size={20} className="text-indigo-600" />
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Interactive Earnings & Growth Calculator</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Input Controls */}
            <div className="space-y-4 lg:col-span-2">
              <div>
                <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                  <span>Monthly Store Visits Generated</span>
                  <span className="font-bold text-indigo-600">{monthlyClicks.toLocaleString()} visits</span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="3000000"
                  step="50000"
                  value={monthlyClicks}
                  onChange={(e) => setMonthlyClicks(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                    <span>Fee Per Store Visit</span>
                    <span className="font-bold text-indigo-600">₦{cpcRate}</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="250"
                    step="10"
                    value={cpcRate}
                    onChange={(e) => setCpcRate(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                    <span>Shoppers Who Buy (%)</span>
                    <span className="font-bold text-indigo-600">{conversionRatePct}%</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="8.0"
                    step="0.5"
                    value={conversionRatePct}
                    onChange={(e) => setConversionRatePct(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                    <span>Average Shopper Order Amount</span>
                    <span className="font-bold text-indigo-600">₦{avgOrderValue.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="25000"
                    max="200000"
                    step="5000"
                    value={avgOrderValue}
                    onChange={(e) => setAvgOrderValue(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                    <span>VIP Club Members</span>
                    <span className="font-bold text-indigo-600">{vipSubscribers.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="100000"
                    step="1000"
                    value={vipSubscribers}
                    onChange={(e) => setVipSubscribers(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Calculated Output Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">PROJECTED EARNINGS</span>
                <div className="mt-2 mb-4">
                  <p className="text-xs text-gray-500">Estimated Monthly Earnings</p>
                  <p className="text-2xl sm:text-3xl font-black text-gray-900">
                    {formatPrice(totalMonthlyRevenue, '₦')}
                  </p>
                  <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                    Yearly Pace: {formatPrice(annualizedRunRate, '₦')}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 pt-3 border-t border-indigo-100">
                  <div className="flex justify-between">
                    <span>Monthly Shopping Volume:</span>
                    <strong className="text-gray-900">{formatPrice(monthlyGmv, '₦')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Store Visit Earnings:</span>
                    <strong className="text-gray-900">{formatPrice(monthlyCpcRevenue, '₦')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Store Partner Bonuses:</span>
                    <strong className="text-gray-900">{formatPrice(monthlyCommissionRevenue, '₦')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>VIP Memberships:</span>
                    <strong className="text-gray-900">{formatPrice(monthlyVipRevenue, '₦')}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-indigo-200">
                <p className="text-[10px] text-gray-500 uppercase font-semibold">Estimated Business Value (8x Annual Earnings)</p>
                <p className="text-lg font-bold text-indigo-900">
                  {formatPrice(annualizedRunRate * 8, '₦')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Exit & Long Term Strategy */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-7 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Award size={20} className="text-amber-500" />
            <h3 className="text-base sm:text-lg font-bold text-gray-900">How Similar Platforms Grow & Partner</h3>
          </div>
          <p className="text-xs text-gray-600 mb-6">
            In global markets, top price comparison services (like Google Shopping, Honey, and Idealo) become essential daily tools. In Africa, strong long-term opportunities include:
          </p>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="font-bold text-sm text-gray-900 mb-1">Major E-Commerce Stores</h4>
              <p className="text-xs text-gray-500">
                Leading stores partner closely or acquire comparison platforms to reach ready-to-buy shoppers directly.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="font-bold text-sm text-gray-900 mb-1">Regional Shopping Networks</h4>
              <p className="text-xs text-gray-500">
                Expanding multi-country store networks looking to give shoppers one seamless place to browse all products.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="font-bold text-sm text-gray-900 mb-1">Digital Banking Apps</h4>
              <p className="text-xs text-gray-500">
                Popular finance and payment apps offering built-in price comparison and special installment payment options.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestorThesisPage;
