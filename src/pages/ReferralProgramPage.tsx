import React, { useState } from 'react';
import { Users, Gift, Share2, Copy, Check, ArrowRight, DollarSign, Wallet, Building2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useRegion } from '../context/RegionContext';

const NIGERIAN_BANKS = [
  'Access Bank',
  'Guaranty Trust Bank (GTBank)',
  'Zenith Bank',
  'United Bank for Africa (UBA)',
  'First Bank of Nigeria',
  'Kuda Microfinance Bank',
  'OPay Digital Services',
  'PalmPay',
  'Moniepoint Microfinance Bank',
  'Stanbic IBTC Bank',
];

const ReferralProgramPage: React.FC = () => {
  const { user, requestPayout } = useAuth();
  const { addToast } = useToast();
  const { formatPrice } = useRegion();

  const [copied, setCopied] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState(NIGERIAN_BANKS[0]);
  const [accountNumber, setAccountNumber] = useState('0123456789');
  const [accountName, setAccountName] = useState(user?.name || 'Emmanuel Adejuwon');
  const [withdrawAmount, setWithdrawAmount] = useState('2000');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const referralCode = user?.referralCode || 'PW-SAVE500';
  const referralUrl = `https://pricewise.ng/r/${referralCode.toLowerCase()}`;
  const referralBalance = user?.referralBalance || 2500;
  const totalReferred = user?.totalReferred || 2;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    addToast('Referral link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Stop overpaying online in Nigeria! Compare prices across Jumia, Konga, Slot, and Amazon using PriceWise. Sign up with my link and get ₦500 welcome credit: ${referralUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum < 1000) {
      addToast('Minimum withdrawal amount is ₦1,000', 'error');
      return;
    }
    if (amountNum > referralBalance) {
      addToast('Insufficient referral balance', 'error');
      return;
    }

    setIsSubmitting(true);
    const success = await requestPayout(selectedBank, accountNumber, amountNum);
    setIsSubmitting(false);

    if (success) {
      setShowWithdrawModal(false);
      addToast(`₦${amountNum.toLocaleString()} payout initiated to ${selectedBank}! Arrives in 5-15 mins.`, 'success');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-10">
      <div className="max-w-5xl mx-auto px-3 sm:px-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden mb-6 sm:mb-8">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-3">
              <Gift size={14} className="text-amber-300" />
              <span>PRICEWISE REWARDS PROGRAM</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
              Give ₦500, Earn ₦1,000 per Referral
            </h1>
            <p className="text-xs sm:text-base text-purple-100 mb-6">
              Invite friends, family, and colleagues to shop smarter. Every time someone signs up with your link and makes their first price comparison, you earn cash deposited straight into your bank account.
            </p>

            {/* Referral Link Box */}
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20 flex flex-col sm:flex-row items-stretch gap-2">
              <div className="flex-1 bg-white/90 text-gray-800 px-3 py-2 rounded-lg text-xs sm:text-sm font-mono truncate flex items-center">
                {referralUrl}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex-1 sm:flex-none px-4 py-2 bg-white text-indigo-700 hover:bg-purple-50 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
                <button
                  onClick={handleShareWhatsApp}
                  className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Share2 size={14} />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats and Wallet */}
        <div className="grid sm:grid-cols-3 gap-3 sm:gap-6 mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 font-medium">Available Balance</span>
              <Wallet size={18} className="text-indigo-600" />
            </div>
            <p className="text-xl sm:text-3xl font-extrabold text-gray-900">
              {formatPrice(referralBalance, '₦')}
            </p>
            <div className="mt-3">
              <button
                onClick={() => setShowWithdrawModal(true)}
                disabled={referralBalance < 1000}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
              >
                <span>Withdraw to Bank</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 font-medium">Successful Referrals</span>
              <Users size={18} className="text-purple-600" />
            </div>
            <p className="text-xl sm:text-3xl font-extrabold text-gray-900">{totalReferred}</p>
            <p className="text-[11px] text-green-600 font-medium mt-1">2 friends signed up this week</p>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 font-medium">Lifetime Earnings</span>
              <DollarSign size={18} className="text-emerald-600" />
            </div>
            <p className="text-xl sm:text-3xl font-extrabold text-gray-900">
              {formatPrice(referralBalance + 5000, '₦')}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">₦5,000 successfully disbursed</p>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-8 mb-8">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-6">How the Referral Program Works</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-sm">
                1
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-gray-900 mb-1">Share Your Custom Link</h4>
                <p className="text-xs text-gray-500">
                  Send your link to friends via WhatsApp, Twitter, Instagram or Telegram groups.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0 text-sm">
                2
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-gray-900 mb-1">Friend Compares & Saves</h4>
                <p className="text-xs text-gray-500">
                  They register and click through to any retailer to compare or purchase an item.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center shrink-0 text-sm">
                3
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-gray-900 mb-1">Get Instant Cash Payout</h4>
                <p className="text-xs text-gray-500">
                  ₦1,000 is credited automatically to your wallet. Cash out directly to any Nigerian bank.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <div className="flex items-center gap-2">
                <Building2 size={20} className="text-indigo-600" />
                <h3 className="font-bold text-sm text-gray-900">Withdraw Referral Earnings</h3>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Select Nigerian Bank</label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm bg-gray-50 outline-none"
                >
                  {NIGERIAN_BANKS.map(bank => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Account Number (10 Digits)</label>
                <input
                  type="text"
                  maxLength={10}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm bg-gray-50 outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Account Name</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm bg-gray-50 outline-none"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-gray-700">Withdrawal Amount (₦)</label>
                  <span className="text-[10px] text-indigo-600 font-semibold">
                    Max: ₦{referralBalance.toLocaleString()}
                  </span>
                </div>
                <input
                  type="number"
                  min="1000"
                  max={referralBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm bg-gray-50 outline-none font-bold text-gray-900"
                  required
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl text-[11px] text-amber-800 flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>NIBSS Instant Payment (NIP) transfers are processed within 5-15 minutes 24/7.</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Processing NIP Transfer...</span>
                  </>
                ) : (
                  <span>Confirm Withdrawal of ₦{Number(withdrawAmount || 0).toLocaleString()}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralProgramPage;
