import { Product, Store, Category, PriceHistoryEntry } from '../types';
import { PLATFORM_STORES, getAllAvailableStores, injectSellerStoreListings } from '../services/storeRegistry';

// Helper to generate price history
const generatePriceHistory = (basePrice: number, currency: string, storeId: string, days: number = 180): PriceHistoryEntry[] => {
  const history: PriceHistoryEntry[] = [];
  const now = new Date();
  for (let i = days; i >= 0; i -= 7) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const variance = (Math.sin(i / 10) * 0.08);
    const price = Math.round(basePrice * (1 + variance));
    history.push({
      date: date.toISOString().split('T')[0],
      storeId,
      price,
      currency,
    });
  }
  return history;
};

// Helper to generate delivery date
const getDeliveryDate = (days: string): string => {
  const d = new Date();
  const maxDays = parseInt(days.split('-')[1] || days.split('-')[0]) || 2;
  d.setDate(d.getDate() + maxDays);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

export const stores: Store[] = getAllAvailableStores();

export const categories: Category[] = [
  { id: 'phones', name: 'Phones & Tablets', icon: '📱', count: 12450, subcategories: ['Smartphones', 'Tablets', 'Phone Accessories', 'Feature Phones'] },
  { id: 'laptops', name: 'Laptops & Computers', icon: '💻', count: 8320, subcategories: ['Laptops', 'Desktops', 'Monitors', 'Computer Accessories'] },
  { id: 'electronics', name: 'Electronics & Audio', icon: '🔌', count: 15670, subcategories: ['Audio', 'TV & Video', 'Cameras', 'Wearables'] },
  { id: 'fashion', name: 'Fashion & Apparel', icon: '👗', count: 23100, subcategories: ['Men', 'Women', 'Kids', 'Shoes', 'Accessories'] },
  { id: 'home', name: 'Home & Office', icon: '🏠', count: 9870, subcategories: ['Furniture', 'Kitchen', 'Decor', 'Office Supplies'] },
  { id: 'health', name: 'Beauty & Health', icon: '💄', count: 11200, subcategories: ['Skincare', 'Makeup', 'Hair Care', 'Personal Care'] },
  { id: 'gaming', name: 'Gaming', icon: '🎮', count: 4560, subcategories: ['Consoles', 'Games', 'Accessories', 'PC Gaming'] },
  { id: 'appliances', name: 'Home Appliances', icon: '🏗️', count: 6780, subcategories: ['Kitchen Appliances', 'Cleaning', 'Cooling', 'Laundry'] },
  { id: 'groceries', name: 'Groceries & FMCG', icon: '🛒', count: 18900, subcategories: ['Food', 'Beverages', 'Household', 'Baby'] },
  { id: 'books', name: 'Books & Education', icon: '📚', count: 7650, subcategories: ['Fiction', 'Non-Fiction', 'Academic', 'Children'] },
  { id: 'sports', name: 'Sporting Goods', icon: '⚽', count: 5430, subcategories: ['Fitness', 'Outdoor', 'Team Sports', 'Water Sports'] },
  { id: 'automobile', name: 'Automobile', icon: '🚗', count: 3210, subcategories: ['Car Accessories', 'Motorcycle', 'Tools', 'Electronics'] },
];

export const trendingSearches: string[] = [
  'iPhone 15 Pro Max',
  'Samsung Galaxy S24 Ultra',
  'MacBook Pro M3',
  'PS5 Console',
  'Sony WH-1000XM5',
  'LG 55" OLED TV',
  'Apex Electronics Deals',
  'AirPods Pro 2',
  'Dell XPS 15',
  'iPad Air M2',
];

export const getBestDeal = (product: Product) => {
  if (!product.listings || product.listings.length === 0) {
    return { 
      listing: { 
        price: 0, 
        originalPrice: 0, 
        discount: 0, 
        currency: '₦', 
        store: stores[0] 
      } as any, 
      savings: 0, 
      savingsPercent: 0 
    };
  }
  const sorted = [...product.listings].sort((a, b) => a.price - b.price);
  const best = sorted[0];
  const highest = sorted[sorted.length - 1];
  const savings = Math.max(0, highest.price - best.price);
  const savingsPercent = highest.price > 0 ? Math.round((savings / highest.price) * 100) : 0;
  return {
    listing: best,
    savings,
    savingsPercent,
  };
};

const makeListing = (
  storeId: string, 
  price: number, 
  origPrice: number, 
  currency: string, 
  shipping: number, 
  delivery: string, 
  rating: number, 
  reviews: number, 
  seller: string, 
  discount: number, 
  updated: string, 
  condition: 'new'|'refurbished'|'used' = 'new', 
  warranty: string = '1 year manufacturer warranty'
) => {
  const store = stores.find(s => s.id === storeId) || stores[0];
  return {
    store,
    price,
    originalPrice: origPrice,
    currency,
    shippingCost: shipping,
    shippingMethod: shipping === 0 ? 'Free Standard Delivery' : 'Standard Courier Delivery',
    totalCost: price + shipping,
    deliveryDays: delivery,
    deliveryDate: getDeliveryDate(delivery),
    inStock: true,
    stockLevel: reviews > 150 ? 'in-stock' as const : reviews > 50 ? 'low-stock' as const : 'in-stock' as const,
    rating,
    reviews,
    affiliateUrl: `${store.affiliateBaseUrl}?tag=pricewise_${store.id}&product=prod_live`,
    affiliateTag: `pricewise_${store.id}`,
    discount,
    lastUpdated: updated,
    lastVerified: updated,
    seller,
    sellerId: `seller_${store.id}`,
    condition,
    warranty,
    returnPolicy: '30-day verified buyer protection',
    freshnessHours: 1,
  };
};

const rawProducts: Product[] = [];

// Ensure all products are wrapped to integrate any registered seller store items
export const products: Product[] = rawProducts.map(p => injectSellerStoreListings(p));
