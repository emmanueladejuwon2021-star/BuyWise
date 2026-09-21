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

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  watchlist: string[];
  priceAlerts: PriceAlert[];
  clickHistory: ClickLog[];
  preferences: UserPreferences;
  notificationSettings: NotificationSettings;
  createdAt: string;
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
