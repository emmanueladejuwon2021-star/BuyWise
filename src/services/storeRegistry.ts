import { Store, StoreListing, Product } from '../types';

/**
 * STORE REGISTRY SERVICE
 * 
 * Manages all supported e-commerce marketplaces, physical retail chains, 
 * and direct registered seller stores on PriceWise.
 */

export interface RegisteredSellerStore extends Store {
  isSellerStore: boolean;
  sellerType: 'direct_merchant' | 'retail_chain' | 'marketplace' | 'authorized_dealer';
  ownerId?: string;
  ownerEmail?: string;
  cacNumber?: string;
  physicalAddress?: string;
  state?: string;
  city?: string;
  phone?: string;
  totalInventoryCount?: number;
  deliveryCoverage?: string[];
}

export const PLATFORM_STORES: RegisteredSellerStore[] = [
  {
    id: 'jumia',
    name: 'Jumia Nigeria',
    logo: '🟠',
    color: '#F68B1E',
    commissionRate: 0.045,
    affiliateBaseUrl: 'https://jumia.com.ng/affiliate',
    rating: 4.3,
    country: 'Nigeria',
    website: 'jumia.com.ng',
    verified: true,
    responseTime: '< 24hrs',
    isSellerStore: false,
    sellerType: 'marketplace',
  },
  {
    id: 'konga',
    name: 'Konga Online',
    logo: '🔴',
    color: '#E31837',
    commissionRate: 0.038,
    affiliateBaseUrl: 'https://konga.com/affiliate',
    rating: 4.1,
    country: 'Nigeria',
    website: 'konga.com',
    verified: true,
    responseTime: '< 24hrs',
    isSellerStore: false,
    sellerType: 'marketplace',
  },
  {
    id: 'slot',
    name: 'Slot Systems',
    logo: '🔵',
    color: '#0066CC',
    commissionRate: 0.030,
    affiliateBaseUrl: 'https://slot.ng/affiliate',
    rating: 4.6,
    country: 'Nigeria',
    website: 'slot.ng',
    verified: true,
    responseTime: '< 12hrs',
    isSellerStore: false,
    sellerType: 'retail_chain',
  },
  {
    id: 'kara',
    name: 'Kara Nigeria',
    logo: '🟡',
    color: '#EAB308',
    commissionRate: 0.040,
    affiliateBaseUrl: 'https://kara.com.ng',
    rating: 4.2,
    country: 'Nigeria',
    website: 'kara.com.ng',
    verified: true,
    responseTime: '< 24hrs',
    isSellerStore: false,
    sellerType: 'retail_chain',
  },
  {
    id: 'jiji',
    name: 'Jiji Nigeria',
    logo: '🟢',
    color: '#1DB954',
    commissionRate: 0.025,
    affiliateBaseUrl: 'https://jiji.ng',
    rating: 3.9,
    country: 'Nigeria',
    website: 'jiji.ng',
    verified: false,
    responseTime: '< 48hrs',
    isSellerStore: false,
    sellerType: 'marketplace',
  },
  {
    id: 'yudala',
    name: 'Yudala Electronics',
    logo: '🟣',
    color: '#9333EA',
    commissionRate: 0.035,
    affiliateBaseUrl: 'https://yudala.com',
    rating: 4.0,
    country: 'Nigeria',
    website: 'yudala.com',
    verified: true,
    responseTime: '< 24hrs',
    isSellerStore: false,
    sellerType: 'retail_chain',
  },
  {
    id: 'computervillage',
    name: 'Computer Village Hub',
    logo: '🖲️',
    color: '#0D9488',
    commissionRate: 0.030,
    affiliateBaseUrl: 'https://computervillage.ng',
    rating: 4.4,
    country: 'Nigeria',
    website: 'computervillage.ng',
    verified: true,
    responseTime: '< 6hrs',
    isSellerStore: false,
    sellerType: 'marketplace',
  },
  {
    id: 'gadgetlounge',
    name: 'Gadget Lounge NG',
    logo: '📱',
    color: '#2563EB',
    commissionRate: 0.032,
    affiliateBaseUrl: 'https://gadgetlounge.ng',
    rating: 4.5,
    country: 'Nigeria',
    website: 'gadgetlounge.ng',
    verified: true,
    responseTime: '< 12hrs',
    isSellerStore: false,
    sellerType: 'authorized_dealer',
  },
  {
    id: 'payportmall',
    name: 'PayPorte Mall',
    logo: '🟣',
    color: '#7B2D8E',
    commissionRate: 0.040,
    affiliateBaseUrl: 'https://payporte.com/affiliate',
    rating: 3.9,
    country: 'Nigeria',
    website: 'payporte.com',
    verified: true,
    responseTime: '< 24hrs',
    isSellerStore: false,
    sellerType: 'marketplace',
  },
  {
    id: 'amazon',
    name: 'Amazon Global',
    logo: '📦',
    color: '#FF9900',
    commissionRate: 0.050,
    affiliateBaseUrl: 'https://amazon.com/dp',
    rating: 4.8,
    country: 'Global',
    website: 'amazon.com',
    verified: true,
    responseTime: '< 12hrs',
    isSellerStore: false,
    sellerType: 'marketplace',
  },
  {
    id: 'aliexpress',
    name: 'AliExpress',
    logo: '🔶',
    color: '#FF4747',
    commissionRate: 0.060,
    affiliateBaseUrl: 'https://aliexpress.com/item',
    rating: 4.1,
    country: 'Global',
    website: 'aliexpress.com',
    verified: true,
    responseTime: '< 48hrs',
    isSellerStore: false,
    sellerType: 'marketplace',
  },
  {
    id: 'ebay',
    name: 'eBay Global',
    logo: '🟡',
    color: '#E53238',
    commissionRate: 0.040,
    affiliateBaseUrl: 'https://ebay.com/itm',
    rating: 4.4,
    country: 'Global',
    website: 'ebay.com',
    verified: true,
    responseTime: '< 24hrs',
    isSellerStore: false,
    sellerType: 'marketplace',
  },
  // Default verified registered seller store on PriceWise
  {
    id: 'apex_electronics',
    name: 'Apex Electronics Hub',
    logo: '🏪',
    color: '#059669',
    commissionRate: 0.025,
    affiliateBaseUrl: '/store/apex_electronics',
    rating: 4.9,
    country: 'Nigeria',
    website: 'apexelectronics.ng',
    verified: true,
    responseTime: '< 2hrs',
    isSellerStore: true,
    sellerType: 'direct_merchant',
    ownerEmail: 'merchant@apex.ng',
    cacNumber: 'RC-1849204',
    physicalAddress: 'Suite 44, Medical Road, Ikeja Computer Village, Lagos',
    state: 'Lagos',
    city: 'Ikeja',
    phone: '+234 803 456 7890',
    totalInventoryCount: 84,
    deliveryCoverage: ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Nationwide'],
  },
];

/**
 * Retrieve all registered seller stores from localStorage and memory
 */
export function getRegisteredSellerStores(): RegisteredSellerStore[] {
  const registered: RegisteredSellerStore[] = [];
  
  // 1. Get default apex seller
  const apex = PLATFORM_STORES.find(s => s.id === 'apex_electronics');
  if (apex) registered.push(apex);

  // 2. Check localStorage 'pricewise_store' (active logged-in merchant store)
  try {
    const rawStore = localStorage.getItem('pricewise_store');
    if (rawStore) {
      const parsed = JSON.parse(rawStore);
      if (parsed.name && parsed.name !== 'Apex Electronics Hub') {
        const storeId = parsed.id || `seller_${parsed.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        registered.push({
          id: storeId,
          name: parsed.name,
          logo: parsed.logo || '🏪',
          color: parsed.color || '#10B981',
          commissionRate: 0.025,
          affiliateBaseUrl: `/store/${storeId}`,
          rating: 4.8,
          country: 'Nigeria',
          website: parsed.website || `${storeId}.pricewise.market`,
          verified: parsed.isVerified !== undefined ? parsed.isVerified : true,
          responseTime: '< 3hrs',
          isSellerStore: true,
          sellerType: 'direct_merchant',
          ownerEmail: parsed.email || 'seller@pricewise.market',
          cacNumber: parsed.cacNumber || 'RC-998231',
          physicalAddress: parsed.address || 'Lagos, Nigeria',
          state: parsed.state || 'Lagos',
          city: parsed.city || 'Lagos',
          phone: parsed.phone || '+234 800 000 0000',
          deliveryCoverage: ['Lagos', 'Abuja', 'Nationwide'],
        });
      }
    }
  } catch (e) {
    console.error('Error reading pricewise_store', e);
  }

  // 3. Check localStorage 'pricewise_registered_stores'
  try {
    const rawStores = localStorage.getItem('pricewise_registered_stores');
    if (rawStores) {
      const list: RegisteredSellerStore[] = JSON.parse(rawStores);
      list.forEach(s => {
        if (!registered.some(r => r.id === s.id)) {
          registered.push({ ...s, isSellerStore: true });
        }
      });
    }
  } catch (e) {
    console.error('Error reading pricewise_registered_stores', e);
  }

  return registered;
}

/**
 * Get all stores including standard e-commerce platforms and registered merchant stores
 */
export function getAllAvailableStores(): RegisteredSellerStore[] {
  const base = PLATFORM_STORES.filter(s => !s.isSellerStore);
  const sellers = getRegisteredSellerStores();
  return [...base, ...sellers];
}

/**
 * Get products listed by registered sellers
 */
export function getRegisteredSellerProducts(): any[] {
  try {
    const raw = localStorage.getItem('pricewise_seller_products');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading seller products', e);
  }
  return [];
}

/**
 * Save product listed by a registered seller
 */
export function saveSellerProduct(product: any): void {
  try {
    const existing = getRegisteredSellerProducts();
    const index = existing.findIndex(p => p.id === product.id);
    if (index >= 0) {
      existing[index] = product;
    } else {
      existing.unshift(product);
    }
    localStorage.setItem('pricewise_seller_products', JSON.stringify(existing));
  } catch (e) {
    console.error('Error saving seller product', e);
  }
}

/**
 * Merge registered seller listings into a product comparison
 */
export function injectSellerStoreListings(product: Product): Product {
  const sellerProducts = getRegisteredSellerProducts();
  const sellerStores = getRegisteredSellerStores();

  // Find any seller products that match this product name, slug, or brand
  const matchedSellerItems = sellerProducts.filter(sp => {
    const titleMatch = sp.name?.toLowerCase().includes(product.brand?.toLowerCase() || '') &&
      (sp.name?.toLowerCase().includes(product.name.split(' ')[0].toLowerCase()) ||
       product.name.toLowerCase().includes(sp.name?.toLowerCase() || ''));
    const idMatch = sp.id === product.id || sp.targetProductId === product.id;
    return titleMatch || idMatch;
  });

  if (matchedSellerItems.length === 0) {
    return product;
  }

  // Create listings for each registered seller item
  const newSellerListings: StoreListing[] = matchedSellerItems.map(item => {
    const store = sellerStores.find(s => s.id === item.storeId) || sellerStores[0] || PLATFORM_STORES.find(s => s.id === 'apex_electronics')!;
    const price = Number(item.price) || 100000;
    const origPrice = Number(item.originalPrice) || Math.round(price * 1.12);
    const discount = origPrice > price ? Math.round(((origPrice - price) / origPrice) * 100) : 0;

    return {
      store,
      price,
      originalPrice: origPrice,
      currency: item.currency || '₦',
      shippingCost: Number(item.shippingCost) || 0,
      shippingMethod: item.shippingMethod || 'Direct Merchant Fast Delivery',
      totalCost: price + (Number(item.shippingCost) || 0),
      deliveryDays: item.deliveryDays || '1-2',
      deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      inStock: item.inStock !== false,
      stockLevel: item.stockQuantity > 5 ? 'in-stock' : item.stockQuantity > 0 ? 'low-stock' : 'out-of-stock',
      rating: store.rating || 4.9,
      reviews: item.reviewsCount || 42,
      affiliateUrl: `/store/${store.id}?item=${item.id}`,
      affiliateTag: `pw_seller_${store.id}`,
      discount,
      lastUpdated: 'Just now',
      lastVerified: new Date().toISOString(),
      seller: `${store.name} (Direct Store)`,
      sellerId: store.id,
      condition: item.condition || 'new',
      warranty: item.warranty || '1 Year Store Warranty',
      returnPolicy: '14-Day Money Back Guarantee',
      freshnessHours: 0,
    };
  });

  // Filter out duplicate store listings
  const nonDuplicateExisting = product.listings.filter(
    l => !newSellerListings.some(nl => nl.store.id === l.store.id)
  );

  return {
    ...product,
    listings: [...newSellerListings, ...nonDuplicateExisting],
  };
}
