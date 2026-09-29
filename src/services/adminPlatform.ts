import { 
  AdminFinanceWallet, AffiliatePartnerConfig, PlatformPayoutTransaction, MerchantKYCRecord 
} from '../types';

const STORAGE_KEYS = {
  WALLET: 'pricewise_admin_wallet_v2',
  AFFILIATES: 'pricewise_admin_affiliates_v2',
  TRANSACTIONS: 'pricewise_admin_transactions_v2',
  MERCHANTS: 'pricewise_admin_merchants_v2',
};

const initialWallet: AdminFinanceWallet = {
  totalCommissionEarned: 0,
  membershipRevenue: 0,
  storeAdCreditRevenue: 0,
  availableBalance: 0,
  totalWithdrawn: 0,
  pendingPayouts: 0,
  bankSettings: {
    bankName: 'Access Bank',
    accountNumber: '0812345678',
    accountName: 'Emmanuel Adejuwon',
    autoPayout: true,
    payoutSchedule: 'weekly',
  },
};

const initialAffiliates: AffiliatePartnerConfig[] = [
  {
    storeId: 'jumia',
    storeName: 'Jumia Nigeria',
    affiliateTag: 'pricewise-jumia-234-aff',
    commissionRatePct: 4.5,
    totalClicks: 0,
    estimatedGMV: 0,
    commissionEarned: 0,
    active: true,
    lastSync: '2 mins ago',
  },
  {
    storeId: 'konga',
    storeName: 'Konga Online',
    affiliateTag: 'pw_konga_aff_9982',
    commissionRatePct: 3.8,
    totalClicks: 0,
    estimatedGMV: 0,
    commissionEarned: 0,
    active: true,
    lastSync: '5 mins ago',
  },
  {
    storeId: 'slot',
    storeName: 'Slot Systems',
    affiliateTag: 'slot-partner-pricewise',
    commissionRatePct: 3.0,
    totalClicks: 0,
    estimatedGMV: 0,
    commissionEarned: 0,
    active: true,
    lastSync: '10 mins ago',
  },
  {
    storeId: 'amazon',
    storeName: 'Amazon Global',
    affiliateTag: 'pricewise0b-20',
    commissionRatePct: 5.0,
    totalClicks: 0,
    estimatedGMV: 0,
    commissionEarned: 0,
    active: true,
    lastSync: '1 hour ago',
  },
];

const initialTransactions: PlatformPayoutTransaction[] = [];
const initialMerchants: MerchantKYCRecord[] = [];

export const getAdminWallet = (): AdminFinanceWallet => {
  const saved = localStorage.getItem(STORAGE_KEYS.WALLET);
  if (saved) {
    try { return JSON.parse(saved); } catch {}
  }
  localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(initialWallet));
  return initialWallet;
};

export const saveAdminWallet = (wallet: AdminFinanceWallet): void => {
  localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(wallet));
};

export const getAffiliatePartners = (): AffiliatePartnerConfig[] => {
  const saved = localStorage.getItem(STORAGE_KEYS.AFFILIATES);
  if (saved) {
    try { return JSON.parse(saved); } catch {}
  }
  localStorage.setItem(STORAGE_KEYS.AFFILIATES, JSON.stringify(initialAffiliates));
  return initialAffiliates;
};

export const saveAffiliatePartners = (affiliates: AffiliatePartnerConfig[]): void => {
  localStorage.setItem(STORAGE_KEYS.AFFILIATES, JSON.stringify(affiliates));
};

export const getAdminTransactions = (): PlatformPayoutTransaction[] => {
  const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  if (saved) {
    try { return JSON.parse(saved); } catch {}
  }
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(initialTransactions));
  return initialTransactions;
};

export const addAdminTransaction = (tx: Omit<PlatformPayoutTransaction, 'id' | 'timestamp'>): PlatformPayoutTransaction => {
  const all = getAdminTransactions();
  const newTx: PlatformPayoutTransaction = {
    ...tx,
    id: `tx_${Math.random().toString(36).slice(2, 9)}`,
    timestamp: new Date().toISOString(),
  };
  const updated = [newTx, ...all];
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
  return newTx;
};

export const getMerchantsKYC = (): MerchantKYCRecord[] => {
  const saved = localStorage.getItem(STORAGE_KEYS.MERCHANTS);
  if (saved) {
    try { return JSON.parse(saved); } catch {}
  }
  localStorage.setItem(STORAGE_KEYS.MERCHANTS, JSON.stringify(initialMerchants));
  return initialMerchants;
};

export const registerMerchantKYC = (merchant: {
  storeName: string;
  ownerEmail: string;
  contactPhone?: string;
  cacNumber?: string;
}): MerchantKYCRecord => {
  const all = getMerchantsKYC();
  const existing = all.find(m => m.ownerEmail.toLowerCase() === merchant.ownerEmail.toLowerCase());
  if (existing) return existing;
  const newRecord: MerchantKYCRecord = {
    id: `mer_${Date.now().toString(36)}`,
    storeName: merchant.storeName,
    ownerEmail: merchant.ownerEmail,
    contactPhone: merchant.contactPhone || '+234 800 000 0000',
    registeredDate: new Date().toISOString().split('T')[0],
    isVerified: true,
    status: 'approved',
    productsCount: 0,
    adBudgetSpent: 0,
    cacNumber: merchant.cacNumber,
  };
  const updated = [newRecord, ...all];
  localStorage.setItem(STORAGE_KEYS.MERCHANTS, JSON.stringify(updated));
  return newRecord;
};

export const updateMerchantStatus = (
  id: string, 
  status: 'approved' | 'pending' | 'rejected', 
  isVerified: boolean
): MerchantKYCRecord[] => {
  const all = getMerchantsKYC();
  const updated = all.map(m => m.id === id ? { ...m, status, isVerified } : m);
  localStorage.setItem(STORAGE_KEYS.MERCHANTS, JSON.stringify(updated));
  return updated;
};

export const executeDeveloperWithdrawal = async (amount: number, note?: string): Promise<{ success: boolean; message: string }> => {
  const wallet = getAdminWallet();
  if (amount <= 0) return { success: false, message: 'Withdrawal amount must be greater than ₦0' };
  if (wallet.availableBalance < amount) return { success: false, message: 'Insufficient available balance' };
  await new Promise(resolve => setTimeout(resolve, 800));
  wallet.availableBalance -= amount;
  wallet.totalWithdrawn += amount;
  saveAdminWallet(wallet);
  addAdminTransaction({
    amount,
    type: 'developer_withdrawal',
    source: `${wallet.bankSettings.bankName} Settlement`,
    description: `Direct Developer Payout to ${wallet.bankSettings.accountName} (${wallet.bankSettings.accountNumber}) ${note ? `• ${note}` : ''}`,
    status: 'completed',
    reference: `PW-WD-${Math.floor(100000 + Math.random() * 900000)}`,
  });
  return { success: true, message: `₦${amount.toLocaleString()} paid out to ${wallet.bankSettings.accountName} (${wallet.bankSettings.bankName})` };
};

export const recordPlatformRevenue = (
  amount: number, 
  type: 'affiliate_commission' | 'membership_fee' | 'merchant_ad_credit', 
  source: string, 
  description: string
): void => {
  const wallet = getAdminWallet();
  wallet.availableBalance += amount;
  if (type === 'affiliate_commission') wallet.totalCommissionEarned += amount;
  else if (type === 'membership_fee') wallet.membershipRevenue += amount;
  else if (type === 'merchant_ad_credit') wallet.storeAdCreditRevenue += amount;
  saveAdminWallet(wallet);
  addAdminTransaction({
    amount,
    type,
    source,
    description,
    status: 'completed',
    reference: `REV-${type.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
  });
};
