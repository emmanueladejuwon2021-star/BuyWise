import { 
  AdminFinanceWallet, AffiliatePartnerConfig, PlatformPayoutTransaction, MerchantKYCRecord 
} from '../types';

const STORAGE_KEYS = {
  WALLET: 'pricewise_admin_wallet',
  AFFILIATES: 'pricewise_admin_affiliates',
  TRANSACTIONS: 'pricewise_admin_transactions',
  MERCHANTS: 'pricewise_admin_merchants',
};

const initialWallet: AdminFinanceWallet = {
  totalCommissionEarned: 2480500, // ₦2.48M from Jumia, Konga, Slot affiliate conversions
  membershipRevenue: 890000,      // ₦890k from Shopper VIP/Pro plans
  storeAdCreditRevenue: 1650000,  // ₦1.65M from Merchant CPC Ad prepaid wallets
  availableBalance: 4120500,      // ₦4.12M net available for Emmanuel Adejuwon withdrawal
  totalWithdrawn: 900000,
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
    totalClicks: 24890,
    estimatedGMV: 32400000,
    commissionEarned: 1458000,
    active: true,
    lastSync: '2 mins ago',
  },
  {
    storeId: 'konga',
    storeName: 'Konga Online',
    affiliateTag: 'pw_konga_aff_9982',
    commissionRatePct: 3.8,
    totalClicks: 14200,
    estimatedGMV: 18200000,
    commissionEarned: 691600,
    active: true,
    lastSync: '5 mins ago',
  },
  {
    storeId: 'slot',
    storeName: 'Slot Systems',
    affiliateTag: 'slot-partner-pricewise',
    commissionRatePct: 3.0,
    totalClicks: 8400,
    estimatedGMV: 11030000,
    commissionEarned: 330900,
    active: true,
    lastSync: '10 mins ago',
  },
  {
    storeId: 'amazon',
    storeName: 'Amazon Global',
    affiliateTag: 'pricewise0b-20',
    commissionRatePct: 5.0,
    totalClicks: 3200,
    estimatedGMV: 9500000,
    commissionEarned: 475000,
    active: true,
    lastSync: '1 hour ago',
  },
];

const initialTransactions: PlatformPayoutTransaction[] = [
  {
    id: 'tx_9981',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    amount: 14500,
    type: 'affiliate_commission',
    source: 'Jumia Nigeria',
    description: 'Outbound sale conversion: Apple iPhone 15 Pro Max (3.5% commission)',
    status: 'completed',
    reference: 'AFF-JUM-99128',
  },
  {
    id: 'tx_9980',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    amount: 3500,
    type: 'membership_fee',
    source: 'Shopper Subscription',
    description: 'Shopper Upgrade: VIP Club Annual Membership Plan (User: Tunde B.)',
    status: 'completed',
    reference: 'MEM-VIP-4401',
  },
  {
    id: 'tx_9979',
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    amount: 50000,
    type: 'merchant_ad_credit',
    source: 'Merchant Ad Topup',
    description: 'Prepaid CPC ad credits purchased: Apex Electronics Ltd',
    status: 'completed',
    reference: 'CPC-TOP-8812',
  },
  {
    id: 'tx_9978',
    timestamp: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
    amount: 8200,
    type: 'affiliate_commission',
    source: 'Konga Online',
    description: 'Outbound sale conversion: Samsung 55" 4K Smart TV',
    status: 'completed',
    reference: 'AFF-KNG-2091',
  },
  {
    id: 'tx_9977',
    timestamp: new Date(Date.now() - 1000 * 60 * 2880).toISOString(),
    amount: 250000,
    type: 'developer_withdrawal',
    source: 'Developer Bank Payout',
    description: 'Settlement transferred to Access Bank (Emmanuel Adejuwon - 0812345678)',
    status: 'completed',
    reference: 'PAY-ACC-0044',
  },
];

const initialMerchants: MerchantKYCRecord[] = [
  {
    id: 'mer_1',
    storeName: 'Apex Electronics Nigeria',
    ownerEmail: 'support@apexelectronics.ng',
    contactPhone: '+234 803 111 2233',
    registeredDate: '2026-02-14',
    isVerified: true,
    status: 'approved',
    productsCount: 142,
    adBudgetSpent: 120000,
    cacNumber: 'RC-1849201',
  },
  {
    id: 'mer_2',
    storeName: 'GadgetZone Ikeja',
    ownerEmail: 'sales@gadgetzone.com.ng',
    contactPhone: '+234 814 990 4422',
    registeredDate: '2026-03-01',
    isVerified: true,
    status: 'approved',
    productsCount: 89,
    adBudgetSpent: 65000,
    cacNumber: 'RC-992144',
  },
  {
    id: 'mer_3',
    storeName: 'Naija Fashion Hub',
    ownerEmail: 'info@naijafashion.ng',
    contactPhone: '+234 902 443 1120',
    registeredDate: '2026-03-18',
    isVerified: false,
    status: 'pending',
    productsCount: 45,
    adBudgetSpent: 0,
  },
];

export const getAdminWallet = (): AdminFinanceWallet => {
  const saved = localStorage.getItem(STORAGE_KEYS.WALLET);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
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
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
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
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
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
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
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
  if (existing) {
    return existing;
  }
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

// Developer withdrawal mechanism for Emmanuel Adejuwon
export const executeDeveloperWithdrawal = async (amount: number, note?: string): Promise<{ success: boolean; message: string }> => {
  const wallet = getAdminWallet();
  if (amount <= 0) {
    return { success: false, message: 'Withdrawal amount must be greater than ₦0' };
  }
  if (wallet.availableBalance < amount) {
    return { success: false, message: 'Insufficient available balance' };
  }

  // Simulate instant bank clearing
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

// Credit affiliate commission or membership fee into admin platform wallet
export const recordPlatformRevenue = (
  amount: number, 
  type: 'affiliate_commission' | 'membership_fee' | 'merchant_ad_credit', 
  source: string, 
  description: string
): void => {
  const wallet = getAdminWallet();
  wallet.availableBalance += amount;
  if (type === 'affiliate_commission') {
    wallet.totalCommissionEarned += amount;
  } else if (type === 'membership_fee') {
    wallet.membershipRevenue += amount;
  } else if (type === 'merchant_ad_credit') {
    wallet.storeAdCreditRevenue += amount;
  }
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
