export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  brand: string;
  ratings: Rating[];
  listings: StoreListing[];
  specifications: Record<string, string>;
  tags: string[];
}

export interface StoreListing {
  store: Store;
  price: number;
  originalPrice: number;
  currency: string;
  shippingCost: number;
  deliveryDays: string;
  inStock: boolean;
  rating: number;
  reviews: number;
  affiliateUrl: string;
  discount: number;
  lastUpdated: string;
  seller: string;
  condition: 'new' | 'refurbished' | 'used';
  warranty: string;
}

export interface Store {
  id: string;
  name: string;
  logo: string;
  color: string;
  commissionRate: number;
  rating: number;
  country: string;
}

export interface Rating {
  user: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
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
}

export interface PriceAlert {
  id: string;
  productId: string;
  targetPrice: number;
  active: boolean;
  createdAt: string;
}
