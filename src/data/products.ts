import { Product, Store, Category, PriceHistoryEntry } from '../types';

// Helper to generate price history
const generatePriceHistory = (basePrice: number, currency: string, storeId: string, days: number = 180): PriceHistoryEntry[] => {
  const history: PriceHistoryEntry[] = [];
  const now = new Date();
  for (let i = days; i >= 0; i -= 3) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const variance = (Math.random() - 0.5) * 0.15;
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
  const maxDays = parseInt(days.split('-')[1] || days.split('-')[0]);
  d.setDate(d.getDate() + maxDays);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

export const stores: Store[] = [
  { id: 'jumia', name: 'Jumia', logo: '🟠', color: '#F68B1E', commissionRate: 0.08, affiliateBaseUrl: 'https://jumia.com.ng/affiliate', rating: 4.2, country: 'Nigeria', website: 'jumia.com.ng', verified: true, responseTime: '< 24hrs' },
  { id: 'konga', name: 'Konga', logo: '🔴', color: '#E31837', commissionRate: 0.07, affiliateBaseUrl: 'https://konga.com/affiliate', rating: 4.0, country: 'Nigeria', website: 'konga.com', verified: true, responseTime: '< 24hrs' },
  { id: 'amazon', name: 'Amazon', logo: '📦', color: '#FF9900', commissionRate: 0.05, affiliateBaseUrl: 'https://amazon.com/dp', rating: 4.7, country: 'Global', website: 'amazon.com', verified: true, responseTime: '< 12hrs' },
  { id: 'aliexpress', name: 'AliExpress', logo: '🔶', color: '#FF4747', commissionRate: 0.09, affiliateBaseUrl: 'https://aliexpress.com/item', rating: 4.1, country: 'Global', website: 'aliexpress.com', verified: true, responseTime: '< 48hrs' },
  { id: 'jiji', name: 'Jiji', logo: '🟢', color: '#1DB954', commissionRate: 0.06, affiliateBaseUrl: 'https://jiji.ng/affiliate', rating: 3.8, country: 'Nigeria', website: 'jiji.ng', verified: false, responseTime: '< 48hrs' },
  { id: 'slot', name: 'Slot', logo: '🔵', color: '#0066CC', commissionRate: 0.06, affiliateBaseUrl: 'https://slot.ng/affiliate', rating: 4.3, country: 'Nigeria', website: 'slot.ng', verified: true, responseTime: '< 12hrs' },
  { id: 'payportmall', name: 'PayPorte Mall', logo: '🟣', color: '#7B2D8E', commissionRate: 0.07, affiliateBaseUrl: 'https://payporte.com/affiliate', rating: 3.9, country: 'Nigeria', website: 'payporte.com', verified: true, responseTime: '< 24hrs' },
  { id: 'ebay', name: 'eBay', logo: '🟡', color: '#E53238', commissionRate: 0.05, affiliateBaseUrl: 'https://ebay.com/itm', rating: 4.4, country: 'Global', website: 'ebay.com', verified: true, responseTime: '< 24hrs' },
];

export const categories: Category[] = [
  { id: 'phones', name: 'Phones & Tablets', icon: '📱', count: 12450, subcategories: ['Smartphones', 'Tablets', 'Phone Accessories', 'Feature Phones'] },
  { id: 'laptops', name: 'Laptops & Computers', icon: '💻', count: 8320, subcategories: ['Laptops', 'Desktops', 'Monitors', 'Computer Accessories'] },
  { id: 'electronics', name: 'Electronics', icon: '🔌', count: 15670, subcategories: ['Audio', 'TV & Video', 'Cameras', 'Wearables'] },
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

const makeListing = (storeIdx: number, price: number, origPrice: number, currency: string, shipping: number, delivery: string, rating: number, reviews: number, seller: string, discount: number, updated: string, condition: 'new'|'refurbished'|'used' = 'new', warranty: string = '1 year manufacturer warranty') => {
  const store = stores[storeIdx];
  return {
    store,
    price,
    originalPrice: origPrice,
    currency,
    shippingCost: shipping,
    shippingMethod: shipping === 0 ? 'Free Standard' : 'Standard Delivery',
    totalCost: price + shipping,
    deliveryDays: delivery,
    deliveryDate: getDeliveryDate(delivery),
    inStock: true,
    stockLevel: reviews > 200 ? 'in-stock' as const : reviews > 100 ? 'low-stock' as const : 'in-stock' as const,
    rating,
    reviews,
    affiliateUrl: `${store.affiliateBaseUrl}?tag=pricewise_${store.id}&product=prod_${Math.random().toString(36).slice(2, 8)}`,
    affiliateTag: `pricewise_${store.id}`,
    discount,
    lastUpdated: updated,
    lastVerified: updated,
    seller,
    sellerId: `seller_${store.id}_${Math.random().toString(36).slice(2, 6)}`,
    condition,
    warranty,
    returnPolicy: '30-day return policy',
    freshnessHours: Math.floor(Math.random() * 12) + 1,
  };
};

export const products: Product[] = [
  {
    id: 'iphone-15-pro',
    name: 'Apple iPhone 15 Pro Max 256GB',
    slug: 'apple-iphone-15-pro-max-256gb',
    description: 'The most powerful iPhone ever. Features the A17 Pro chip, a titanium design, and the most advanced camera system on iPhone. With Action button, USB-C, and the longest battery life on iPhone.',
    category: 'phones',
    subcategory: 'Smartphones',
    images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&h=600&fit=crop'],
    brand: 'Apple',
    ratings: [
      { user: 'John D.', rating: 5, comment: 'Best phone I have ever owned. The camera is incredible!', date: '2024-01-15', verified: true, helpful: 45 },
      { user: 'Sarah M.', rating: 4, comment: 'Great phone but expensive. Battery life could be better.', date: '2024-01-10', verified: true, helpful: 23 },
      { user: 'Mike T.', rating: 5, comment: 'The titanium body feels premium. Worth every penny.', date: '2024-01-08', verified: true, helpful: 31 },
    ],
    listings: [
      makeListing(0, 1250000, 1400000, '₦', 0, '2-4', 4.5, 234, 'Apple Official Store', 11, '2 hours ago'),
      makeListing(1, 1275000, 1380000, '₦', 2500, '3-5', 4.2, 189, 'Konga Direct', 8, '1 hour ago'),
      makeListing(2, 1199, 1299, '$', 0, '5-7', 4.8, 1250, 'Amazon US', 8, '30 min ago'),
      makeListing(3, 1150, 1350, '$', 15, '15-25', 4.0, 567, 'Global Tech Store', 15, '4 hours ago'),
      makeListing(5, 1280000, 1350000, '₦', 0, '1-2', 4.6, 98, 'Slot Nigeria', 5, '45 min ago'),
    ],
    specifications: { 'Display': '6.7" Super Retina XDR OLED', 'Processor': 'A17 Pro', 'RAM': '8GB', 'Storage': '256GB', 'Camera': '48MP + 12MP + 12MP', 'Battery': '4441 mAh', 'OS': 'iOS 17', 'Weight': '221g', 'Water Resistance': 'IP68', 'Connectivity': '5G, WiFi 6E, Bluetooth 5.3' },
    tags: ['bestseller', 'new', 'premium'],
    priceHistory: [...generatePriceHistory(1300000, '₦', 'jumia'), ...generatePriceHistory(1350000, '₦', 'konga'), ...generatePriceHistory(1250, '$', 'amazon')],
    lastVerified: '30 min ago',
    totalClicks: 12450,
  },
  {
    id: 'samsung-s24-ultra',
    name: 'Samsung Galaxy S24 Ultra 512GB',
    slug: 'samsung-galaxy-s24-ultra-512gb',
    description: 'The ultimate Galaxy experience with Galaxy AI, S Pen, and the most powerful Snapdragon processor. Features a 200MP camera and titanium frame.',
    category: 'phones',
    subcategory: 'Smartphones',
    images: ['https://images.unsplash.com/photo-1610945415292-d4f7889a9468?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=600&h=600&fit=crop'],
    brand: 'Samsung',
    ratings: [
      { user: 'Alex K.', rating: 5, comment: 'The AI features are mind-blowing. Best Android phone!', date: '2024-02-01', verified: true, helpful: 67 },
      { user: 'Grace O.', rating: 4, comment: 'Amazing camera and display. S Pen is a nice bonus.', date: '2024-01-28', verified: true, helpful: 34 },
    ],
    listings: [
      makeListing(0, 1150000, 1300000, '₦', 0, '2-4', 4.4, 312, 'Samsung Official', 12, '1 hour ago'),
      makeListing(1, 1180000, 1280000, '₦', 1500, '3-5', 4.1, 156, 'Samsung Hub', 8, '2 hours ago'),
      makeListing(2, 1099, 1299, '$', 0, '5-7', 4.7, 890, 'Amazon US', 15, '20 min ago'),
      makeListing(5, 1200000, 1300000, '₦', 0, '1-2', 4.5, 78, 'Slot Nigeria', 8, '3 hours ago'),
    ],
    specifications: { 'Display': '6.8" Dynamic AMOLED 2X', 'Processor': 'Snapdragon 8 Gen 3', 'RAM': '12GB', 'Storage': '512GB', 'Camera': '200MP + 12MP + 50MP + 10MP', 'Battery': '5000 mAh', 'OS': 'Android 14', 'Weight': '232g', 'S Pen': 'Built-in', 'AI Features': 'Galaxy AI' },
    tags: ['bestseller', 'new', 'ai-powered'],
    priceHistory: [...generatePriceHistory(1200000, '₦', 'jumia'), ...generatePriceHistory(1250000, '₦', 'konga'), ...generatePriceHistory(1150, '$', 'amazon')],
    lastVerified: '20 min ago',
    totalClicks: 9870,
  },
  {
    id: 'macbook-pro-m3',
    name: 'Apple MacBook Pro 14" M3 Pro',
    slug: 'apple-macbook-pro-14-m3-pro',
    description: 'Supercharged by M3 Pro chip with up to 18 hours of battery life. Stunning Liquid Retina XDR display with ProMotion technology.',
    category: 'laptops',
    subcategory: 'Laptops',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&h=600&fit=crop'],
    brand: 'Apple',
    ratings: [
      { user: 'David L.', rating: 5, comment: 'The M3 Pro is insanely fast. Perfect for development work.', date: '2024-01-20', verified: true, helpful: 89 },
      { user: 'Nina P.', rating: 5, comment: 'Best laptop for creative professionals. The display is gorgeous.', date: '2024-01-18', verified: true, helpful: 56 },
    ],
    listings: [
      makeListing(0, 1850000, 2100000, '₦', 0, '3-5', 4.6, 89, 'Apple Store Nigeria', 12, '1 hour ago'),
      makeListing(2, 1999, 2399, '$', 0, '5-8', 4.9, 2100, 'Amazon US', 17, '15 min ago'),
      makeListing(3, 1850, 2200, '$', 25, '15-30', 3.9, 345, 'Tech World', 16, '5 hours ago'),
      makeListing(7, 1950, 2300, '$', 30, '7-14', 4.3, 456, 'eBay Global', 15, '2 hours ago'),
    ],
    specifications: { 'Display': '14.2" Liquid Retina XDR', 'Processor': 'Apple M3 Pro', 'RAM': '18GB Unified', 'Storage': '512GB SSD', 'Battery': 'Up to 18 hours', 'Weight': '1.61 kg', 'OS': 'macOS Sonoma', 'Ports': '3x Thunderbolt 4, HDMI, SD Card, MagSafe' },
    tags: ['bestseller', 'premium', 'professional'],
    priceHistory: [...generatePriceHistory(1950000, '₦', 'jumia'), ...generatePriceHistory(2100, '$', 'amazon'), ...generatePriceHistory(2000, '$', 'ebay')],
    lastVerified: '15 min ago',
    totalClicks: 5430,
  },
  {
    id: 'ps5-console',
    name: 'PlayStation 5 Console (Slim)',
    slug: 'playstation-5-console-slim',
    description: 'Experience lightning-fast loading, deeper immersion with haptic feedback, adaptive triggers, and 3D Audio with the slim PS5.',
    category: 'gaming',
    subcategory: 'Consoles',
    images: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=600&h=600&fit=crop'],
    brand: 'Sony',
    ratings: [
      { user: 'Chris B.', rating: 5, comment: 'Next-gen gaming at its finest. The slim design is perfect.', date: '2024-01-25', verified: true, helpful: 78 },
      { user: 'Tom R.', rating: 4, comment: 'Great console but wish more games were available.', date: '2024-01-22', verified: true, helpful: 23 },
    ],
    listings: [
      makeListing(0, 580000, 650000, '₦', 0, '2-4', 4.5, 456, 'Sony Official', 11, '30 min ago'),
      makeListing(1, 595000, 640000, '₦', 3000, '3-5', 4.3, 234, 'Gaming Hub', 7, '1 hour ago'),
      makeListing(2, 449, 499, '$', 0, '5-7', 4.8, 3400, 'Amazon US', 10, '10 min ago'),
      makeListing(4, 550000, 620000, '₦', 5000, '1-3', 3.9, 89, 'GameZone Lagos', 11, '4 hours ago'),
    ],
    specifications: { 'CPU': 'AMD Zen 2, 8 cores', 'GPU': 'AMD RDNA 2, 10.28 TFLOPs', 'RAM': '16GB GDDR6', 'Storage': '1TB SSD', 'Resolution': 'Up to 8K', 'Disc': 'Ultra HD Blu-ray', 'Weight': '3.2 kg', 'Controllers': 'DualSense included' },
    tags: ['gaming', 'bestseller', 'new'],
    priceHistory: [...generatePriceHistory(600000, '₦', 'jumia'), ...generatePriceHistory(470, '$', 'amazon')],
    lastVerified: '10 min ago',
    totalClicks: 15600,
  },
  {
    id: 'sony-wh1000xm5',
    name: 'Sony WH-1000XM5 Wireless Headphones',
    slug: 'sony-wh1000xm5-wireless-headphones',
    description: 'Industry-leading noise cancellation with Auto NC Optimizer. Crystal clear hands-free calling with 4 beamforming microphones.',
    category: 'electronics',
    subcategory: 'Audio',
    images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop'],
    brand: 'Sony',
    ratings: [
      { user: 'Emma W.', rating: 5, comment: 'Best noise cancellation I have ever experienced. Perfect for flights!', date: '2024-01-30', verified: true, helpful: 92 },
      { user: 'James A.', rating: 4, comment: 'Great sound quality but a bit tight on the head initially.', date: '2024-01-27', verified: true, helpful: 15 },
    ],
    listings: [
      makeListing(0, 285000, 320000, '₦', 0, '2-4', 4.6, 178, 'Sony Official', 11, '1 hour ago'),
      makeListing(2, 328, 399, '$', 0, '5-7', 4.8, 5600, 'Amazon US', 18, '20 min ago'),
      makeListing(3, 295, 380, '$', 10, '15-25', 4.1, 890, 'Audio World', 22, '3 hours ago'),
      makeListing(7, 310, 370, '$', 15, '7-14', 4.4, 234, 'eBay Audio', 16, '2 hours ago'),
    ],
    specifications: { 'Driver': '30mm', 'Frequency': '4Hz-40,000Hz', 'Battery': '30 hours', 'Charging': 'USB-C, 3min = 3hrs', 'Weight': '250g', 'Bluetooth': '5.2', 'ANC': 'Auto NC Optimizer', 'Codecs': 'LDAC, AAC, SBC' },
    tags: ['bestseller', 'audio', 'premium'],
    priceHistory: [...generatePriceHistory(300000, '₦', 'jumia'), ...generatePriceHistory(350, '$', 'amazon'), ...generatePriceHistory(320, '$', 'ebay')],
    lastVerified: '20 min ago',
    totalClicks: 8900,
  },
  {
    id: 'lg-oled-tv',
    name: 'LG C3 55" OLED 4K Smart TV',
    slug: 'lg-c3-55-oled-4k-smart-tv',
    description: 'Perfect blacks, infinite contrast, and over a billion colors with the α9 Gen6 AI Processor 4K. Dolby Vision and Dolby Atmos support.',
    category: 'electronics',
    subcategory: 'TV & Video',
    images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=600&h=600&fit=crop'],
    brand: 'LG',
    ratings: [
      { user: 'Peter N.', rating: 5, comment: 'The picture quality is absolutely stunning. Best TV I have owned.', date: '2024-01-12', verified: true, helpful: 54 },
      { user: 'Lisa M.', rating: 5, comment: 'Gaming on this TV is incredible. 120Hz OLED perfection.', date: '2024-01-10', verified: true, helpful: 38 },
    ],
    listings: [
      makeListing(0, 850000, 950000, '₦', 0, '3-5', 4.7, 234, 'LG Official', 11, '2 hours ago'),
      makeListing(1, 870000, 930000, '₦', 5000, '4-6', 4.4, 156, 'Electronics Hub', 6, '3 hours ago'),
      makeListing(2, 1096, 1299, '$', 0, '5-8', 4.8, 4500, 'Amazon US', 16, '45 min ago'),
    ],
    specifications: { 'Display': '55" OLED evo', 'Resolution': '4K UHD (3840x2160)', 'Processor': 'α9 Gen6 AI Processor 4K', 'HDR': 'Dolby Vision IQ, HDR10', 'Refresh Rate': '120Hz', 'Smart TV': 'webOS 23', 'HDMI': '4x HDMI 2.1', 'Audio': '40W with Dolby Atmos' },
    tags: ['premium', 'smart-tv', 'gaming'],
    priceHistory: [...generatePriceHistory(900000, '₦', 'jumia'), ...generatePriceHistory(1150, '$', 'amazon')],
    lastVerified: '45 min ago',
    totalClicks: 6700,
  },
  {
    id: 'nike-air-max',
    name: 'Nike Air Max 270 React',
    slug: 'nike-air-max-270-react',
    description: 'Combining two of Nike\'s best technologies, the Air Max 270 React delivers visible cushioning and responsive comfort for all-day wear.',
    category: 'fashion',
    subcategory: 'Shoes',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&h=600&fit=crop'],
    brand: 'Nike',
    ratings: [
      { user: 'Kola A.', rating: 5, comment: 'Super comfortable! I wear them every day.', date: '2024-01-18', verified: true, helpful: 41 },
      { user: 'Funke B.', rating: 4, comment: 'Great shoes but sizing runs a bit large.', date: '2024-01-15', verified: true, helpful: 19 },
    ],
    listings: [
      makeListing(0, 95000, 120000, '₦', 1500, '2-4', 4.3, 567, 'Nike Nigeria', 21, '1 hour ago'),
      makeListing(2, 130, 160, '$', 0, '5-7', 4.6, 2300, 'Amazon US', 19, '30 min ago'),
      makeListing(3, 95, 140, '$', 8, '15-25', 3.8, 1200, 'Sneaker World', 32, '6 hours ago'),
      makeListing(7, 110, 150, '$', 12, '7-14', 4.2, 456, 'eBay Sneakers', 27, '4 hours ago'),
    ],
    specifications: { 'Material': 'Mesh & Synthetic', 'Sole': 'Rubber', 'Closure': 'Lace-up', 'Technology': 'Air Max 270 + React', 'Weight': '340g', 'Drop': '10mm', 'Style': 'Athletic/Casual' },
    tags: ['fashion', 'bestseller', 'sports'],
    priceHistory: [...generatePriceHistory(100000, '₦', 'jumia'), ...generatePriceHistory(140, '$', 'amazon')],
    lastVerified: '30 min ago',
    totalClicks: 11200,
  },
  {
    id: 'ipad-pro-m2',
    name: 'Apple iPad Pro 12.9" M2 Chip',
    slug: 'apple-ipad-pro-12-9-m2-chip',
    description: 'The ultimate iPad experience with M2 chip, Liquid Retina XDR display, and Apple Pencil hover for precision digital art.',
    category: 'phones',
    subcategory: 'Tablets',
    images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=600&h=600&fit=crop'],
    brand: 'Apple',
    ratings: [
      { user: 'Tunde O.', rating: 5, comment: 'Replaced my laptop with this. The M2 is incredibly fast.', date: '2024-01-22', verified: true, helpful: 56 },
      { user: 'Amara C.', rating: 4, comment: 'Great for digital art. Apple Pencil hover is a game changer.', date: '2024-01-20', verified: true, helpful: 29 },
    ],
    listings: [
      makeListing(0, 980000, 1100000, '₦', 0, '2-4', 4.7, 145, 'Apple Store Nigeria', 11, '1 hour ago'),
      makeListing(2, 1049, 1199, '$', 0, '5-7', 4.9, 3200, 'Amazon US', 13, '25 min ago'),
      makeListing(3, 980, 1150, '$', 15, '15-25', 4.0, 678, 'Tablet World', 15, '4 hours ago'),
      makeListing(5, 1000000, 1080000, '₦', 0, '1-2', 4.5, 67, 'Slot Nigeria', 7, '2 hours ago'),
    ],
    specifications: { 'Display': '12.9" Liquid Retina XDR', 'Chip': 'Apple M2', 'RAM': '8GB', 'Storage': '256GB', 'Camera': '12MP Wide + 10MP Ultra Wide', 'Battery': 'Up to 10 hours', 'Connector': 'Thunderbolt / USB 4', 'Weight': '682g' },
    tags: ['premium', 'creative', 'professional'],
    priceHistory: [...generatePriceHistory(1050000, '₦', 'jumia'), ...generatePriceHistory(1100, '$', 'amazon')],
    lastVerified: '25 min ago',
    totalClicks: 7300,
  },
  {
    id: 'dyson-v15',
    name: 'Dyson V15 Detect Absolute Vacuum',
    slug: 'dyson-v15-detect-absolute-vacuum',
    description: 'Dyson\'s most powerful intelligent cordless vacuum. Reveals microscopic dust with a laser slim fluffy cleaner head.',
    category: 'appliances',
    subcategory: 'Cleaning',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&h=600&fit=crop'],
    brand: 'Dyson',
    ratings: [
      { user: 'Bola S.', rating: 5, comment: 'The laser detection is amazing. I can see dust I never knew existed!', date: '2024-01-28', verified: true, helpful: 73 },
      { user: 'Chidi N.', rating: 4, comment: 'Powerful suction but battery could last longer on max.', date: '2024-01-25', verified: true, helpful: 18 },
    ],
    listings: [
      makeListing(0, 520000, 600000, '₦', 0, '3-5', 4.5, 89, 'Dyson Nigeria', 13, '2 hours ago'),
      makeListing(2, 649, 749, '$', 0, '5-7', 4.7, 1800, 'Amazon US', 13, '40 min ago'),
      makeListing(1, 540000, 590000, '₦', 5000, '4-6', 4.2, 56, 'Home Appliances Hub', 8, '3 hours ago'),
    ],
    specifications: { 'Power': '240AW', 'Runtime': 'Up to 60 minutes', 'Dust Capacity': '0.76L', 'Weight': '3.1 kg', 'Filtration': 'Whole-machine HEPA', 'Display': 'LCD screen', 'Laser': 'Green laser dust detection' },
    tags: ['home', 'premium', 'smart'],
    priceHistory: [...generatePriceHistory(550000, '₦', 'jumia'), ...generatePriceHistory(680, '$', 'amazon')],
    lastVerified: '40 min ago',
    totalClicks: 4200,
  },
  {
    id: 'airpods-pro-2',
    name: 'Apple AirPods Pro 2nd Generation (USB-C)',
    slug: 'apple-airpods-pro-2-usb-c',
    description: 'Rebuilt from the sound up with the H2 chip. Active Noise Cancellation up to 2x more powerful with Adaptive Transparency.',
    category: 'electronics',
    subcategory: 'Audio',
    images: ['https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1600294037683-c3abd15e55a6?w=600&h=600&fit=crop'],
    brand: 'Apple',
    ratings: [
      { user: 'Segun A.', rating: 5, comment: 'Best earbuds on the market. The ANC is incredible.', date: '2024-02-01', verified: true, helpful: 88 },
      { user: 'Ngozi E.', rating: 4, comment: 'Great sound but wish the battery lasted longer.', date: '2024-01-29', verified: true, helpful: 12 },
    ],
    listings: [
      makeListing(0, 195000, 220000, '₦', 0, '2-4', 4.6, 345, 'Apple Store Nigeria', 11, '30 min ago'),
      makeListing(1, 200000, 215000, '₦', 1000, '3-5', 4.3, 234, 'Konga Direct', 7, '1 hour ago'),
      makeListing(2, 229, 249, '$', 0, '5-7', 4.8, 8900, 'Amazon US', 8, '15 min ago'),
      makeListing(5, 198000, 218000, '₦', 0, '1-2', 4.5, 123, 'Slot Nigeria', 9, '2 hours ago'),
    ],
    specifications: { 'Chip': 'Apple H2', 'ANC': 'Active Noise Cancellation', 'Battery': '6hrs (30hrs with case)', 'Charging': 'USB-C, MagSafe, Qi', 'Water Resistance': 'IP54', 'Audio': 'Adaptive Transparency, Personalized Spatial Audio', 'Connectivity': 'Bluetooth 5.3' },
    tags: ['bestseller', 'audio', 'apple'],
    priceHistory: [...generatePriceHistory(205000, '₦', 'jumia'), ...generatePriceHistory(235, '$', 'amazon')],
    lastVerified: '15 min ago',
    totalClicks: 18900,
  },
  {
    id: 'gaming-chair',
    name: 'Secretlab TITAN Evo 2022 Gaming Chair',
    slug: 'secretlab-titan-evo-2022-gaming-chair',
    description: 'The world\'s best gaming chair. Built for multi-tilt functionality with integrated adjustable lumbar support and magnetic head pillow.',
    category: 'home',
    subcategory: 'Furniture',
    images: ['https://images.unsplash.com/photo-1598550473359-435731e11090?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop'],
    brand: 'Secretlab',
    ratings: [
      { user: 'Ade K.', rating: 5, comment: 'Worth every penny. My back pain is gone after switching to this.', date: '2024-01-20', verified: true, helpful: 95 },
    ],
    listings: [
      makeListing(2, 519, 599, '$', 0, '5-10', 4.7, 3400, 'Secretlab Official', 13, '1 hour ago'),
      makeListing(3, 389, 500, '$', 35, '20-35', 3.9, 234, 'Furniture World', 22, '5 hours ago'),
      makeListing(7, 450, 550, '$', 40, '10-18', 4.3, 567, 'eBay Furniture', 18, '3 hours ago'),
    ],
    specifications: { 'Material': 'NEO Hybrid Leatherette', 'Recline': 'Multi-tilt (85°-165°)', 'Weight Capacity': '180 kg', 'Seat Height': '44-54 cm', 'Armrests': '4D Adjustable', 'Lumbar': 'Integrated adjustable', 'Headrest': 'Magnetic memory foam' },
    tags: ['gaming', 'ergonomic', 'premium'],
    priceHistory: [...generatePriceHistory(540, '$', 'amazon'), ...generatePriceHistory(470, '$', 'ebay')],
    lastVerified: '1 hour ago',
    totalClicks: 3800,
  },
  {
    id: 'kindle-paperwhite',
    name: 'Amazon Kindle Paperwhite (2023)',
    slug: 'amazon-kindle-paperwhite-2023',
    description: 'The thinnest, lightest Kindle Paperwhite yet with a flush-front design and 300 ppi glare-free display. Waterproof for reading anywhere.',
    category: 'electronics',
    subcategory: 'Wearables',
    images: ['https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop'],
    brand: 'Amazon',
    ratings: [
      { user: 'Yemi F.', rating: 5, comment: 'Perfect for reading. The screen is so easy on the eyes.', date: '2024-01-15', verified: true, helpful: 67 },
      { user: 'Ada O.', rating: 4, comment: 'Love it! Battery lasts weeks.', date: '2024-01-12', verified: true, helpful: 23 },
    ],
    listings: [
      makeListing(2, 139, 159, '$', 0, '5-7', 4.7, 12000, 'Amazon US', 13, '10 min ago'),
      makeListing(0, 125000, 140000, '₦', 0, '3-5', 4.4, 234, 'Amazon via Jumia', 11, '2 hours ago'),
      makeListing(3, 115, 150, '$', 8, '15-25', 4.0, 567, 'Gadget World', 23, '6 hours ago'),
    ],
    specifications: { 'Display': '6.8" 300 ppi', 'Storage': '16GB', 'Battery': 'Up to 10 weeks', 'Waterproof': 'IPX8', 'Weight': '205g', 'Light': 'Adjustable warm light', 'Connectivity': 'WiFi, USB-C' },
    tags: ['reading', 'bestseller', 'portable'],
    priceHistory: [...generatePriceHistory(145, '$', 'amazon'), ...generatePriceHistory(130000, '₦', 'jumia')],
    lastVerified: '10 min ago',
    totalClicks: 22000,
  },
];

export const trendingSearches = [
  'iPhone 15 Pro', 'Samsung S24 Ultra', 'PS5 Console', 'MacBook Pro M3',
  'AirPods Pro', 'Nike Air Max', 'Gaming Chair', 'Smart TV 55 inch',
  'Laptop under 500k', 'Wireless Earbuds', 'iPad Pro', 'Dyson Vacuum'
];

export const getBestDeal = (product: Product) => {
  const listings = product.listings.filter(l => l.inStock);
  if (listings.length === 0) return { listing: product.listings[0], savings: 0 };
  const normalized = listings.map(l => ({
    ...l,
    normalizedPrice: l.currency === '$' ? l.price * 1500 : l.price,
    normalizedTotal: l.currency === '$' ? l.totalCost * 1500 : l.totalCost,
  }));
  const best = normalized.reduce((min, curr) => curr.normalizedTotal < min.normalizedTotal ? curr : min);
  const worst = normalized.reduce((max, curr) => curr.normalizedTotal > max.normalizedTotal ? curr : max);
  return { listing: best, savings: worst.normalizedTotal - best.normalizedTotal };
};

export const getBestValueScore = (listing: typeof products[0]['listings'][0]): number => {
  const priceScore = 100 - (listing.totalCost / 10000);
  const ratingScore = listing.rating * 20;
  const deliveryDays = parseInt(listing.deliveryDays.split('-')[0]);
  const deliveryScore = Math.max(0, 100 - deliveryDays * 10);
  return (priceScore * 0.4) + (ratingScore * 0.35) + (deliveryScore * 0.25);
};
