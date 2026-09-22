export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  subcategory: string;
  images: string[];
  brand: string;
  ratings: Rating[];
  listings: StoreListing[];
  specifications: Record<string, string>;
  tags: string[];
  priceHistory: PriceHistoryEntry[];
  masterProductId?: string;
  variants?: ProductVariant[];
  lastVerified: string;
  totalClicks: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  attributes: Record<string, string>;
  priceModifier: number;
}

export interface StoreListing {
  store: Store;
  price: number;
  originalPrice: number;
  currency: string;
  shippingCost: number;
  shippingMethod: string;
  totalCost: number;
  deliveryDays: string;
  deliveryDate: string;
  inStock: boolean;
  stockLevel: 'in-stock' | 'low-stock' | 'pre-order' | 'out-of-stock';
  rating: number;
  reviews: number;
  affiliateUrl: string;
  affiliateTag: string;
  discount: number;
  lastUpdated: string;
  lastVerified: string;
  seller: string;
  sellerId: string;
  condition: 'new' | 'refurbished' | 'used';
  warranty: string;
  returnPolicy: string;
  freshnessHours: number;
}

export interface Store {
  id: string;
  name: string;
  logo: string;
  color: string;
  commissionRate: number;
  affiliateBaseUrl: string;
  rating: number;
  country: string;
  website: string;
  verified: boolean;
  responseTime: string;
}

export interface Rating {
  user: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  helpful: number;
}

export interface PriceHistoryEntry {
  date: string;
  storeId: string;
  price: number;
  currency: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  subcategories: string[];
}

export interface Deal {
  id: string;
  product: Product;
  bestPrice: number;
  savings: number;
  store: Store;
  expiresAt: string;
}

export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role?: UserRole;
  storeId?: string;
  storeName?: string;
  storeDetails?: {
    businessName: string;
    logoUrl?: string;
    isVerified?: boolean;
    membershipLevel?: 'free' | 'premium' | 'enterprise';
  };
  watchlist: string[];
  priceAlerts: PriceAlert[];
  clickHistory: ClickLog[];
  preferences: UserPreferences;
  notificationSettings: NotificationSettings;
  createdAt: string;
  membershipTier?: 'free' | 'vip' | 'pro';
  membershipExpiresAt?: string;
  referralCode?: string;
  referralBalance?: number;
  totalReferred?: number;
  adFreeMode?: boolean;
}

export interface PriceAlert {
  id: string;
  productId: string;
  productName: string;
  targetPrice: number;
  alertType: 'below-price' | 'percentage-drop' | 'any-drop';
  percentageThreshold?: number;
  active: boolean;
  createdAt: string;
  lastTriggered?: string;
  channels: ('email' | 'sms' | 'push')[];
}

export interface ClickLog {
  id: string;
  productId: string;
  productName: string;
  storeId: string;
  storeName: string;
  timestamp: string;
  source: string;
  price: number;
  currency: string;
}

export interface UserPreferences {
  defaultCity: string;
  defaultState: string;
  currency: string;
  maxDeliveryDays: number;
  preferredStores: string[];
}

export interface NotificationSettings {
  emailEnabled: boolean;
  emailFrequency: 'instant' | 'daily' | 'weekly';
  smsEnabled: boolean;
  pushEnabled: boolean;
  priceDropAlerts: boolean;
  dealAlerts: boolean;
  backInStockAlerts: boolean;
}

export interface OutboundRedirect {
  clickId: string;
  productId: string;
  storeId: string;
  userId?: string;
  affiliateTag: string;
  subId: string;
  timestamp: string;
  source: string;
  originalUrl: string;
  redirectUrl: string;
}

export interface PricePrediction {
  recommendation: 'BUY_NOW' | 'WAIT' | 'FAIR_PRICE';
  confidence: number;
  expectedPriceChangePct: number;
  daysToWait?: number;
  volatility: 'LOW' | 'MODERATE' | 'HIGH';
  trend: 'FALLING' | 'STABLE' | 'RISING';
  rationale: string;
  targetBuyPrice?: number;
}

export interface RegionalMarket {
  countryCode: 'NG' | 'GH' | 'KE' | 'ZA' | 'US';
  countryName: string;
  currencyCode: string;
  currencySymbol: string;
  exchangeRateToNGN: number; // 1 NGN * exchangeRateToNGN = target currency
  flag: string;
  cities: string[];
}

export interface CollaborativeList {
  id: string;
  title: string;
  description: string;
  creatorName: string;
  creatorEmail: string;
  productIds: string[];
  createdAt: string;
  isPublic: boolean;
  shareCode: string;
}

export interface ReferralRecord {
  id: string;
  friendName: string;
  date: string;
  status: 'completed' | 'pending';
  rewardAmount: number;
}

export interface AdminBankSettings {
  bankName: string;
  accountNumber: string;
  accountName: string;
  autoPayout: boolean;
  payoutSchedule: 'instant' | 'daily' | 'weekly' | 'monthly';
}

export interface AdminFinanceWallet {
  totalCommissionEarned: number;
  membershipRevenue: number;
  storeAdCreditRevenue: number;
  availableBalance: number;
  totalWithdrawn: number;
  pendingPayouts: number;
  bankSettings: AdminBankSettings;
}

export interface AffiliatePartnerConfig {
  storeId: string;
  storeName: string;
  affiliateTag: string;
  commissionRatePct: number;
  totalClicks: number;
  estimatedGMV: number;
  commissionEarned: number;
  active: boolean;
  lastSync: string;
}

export interface PlatformPayoutTransaction {
  id: string;
  timestamp: string;
  amount: number;
  type: 'affiliate_commission' | 'membership_fee' | 'merchant_ad_credit' | 'developer_withdrawal';
  source: string;
  description: string;
  status: 'completed' | 'processing' | 'pending';
  reference: string;
}

export interface MerchantKYCRecord {
  id: string;
  storeName: string;
  ownerEmail: string;
  contactPhone: string;
  registeredDate: string;
  isVerified: boolean;
  status: 'approved' | 'pending' | 'rejected';
  productsCount: number;
  adBudgetSpent: number;
  cacNumber?: string;
}

