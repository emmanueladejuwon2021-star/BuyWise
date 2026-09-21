import { Product, Store, Category, Deal } from '../types';

export const stores: Store[] = [
  { id: 'jumia', name: 'Jumia', logo: '🟠', color: '#F68B1E', commissionRate: 0.08, rating: 4.2, country: 'Nigeria' },
  { id: 'konga', name: 'Konga', logo: '🔴', color: '#E31837', commissionRate: 0.07, rating: 4.0, country: 'Nigeria' },
  { id: 'amazon', name: 'Amazon', logo: '📦', color: '#FF9900', commissionRate: 0.05, rating: 4.7, country: 'Global' },
  { id: 'aliexpress', name: 'AliExpress', logo: '🔶', color: '#FF4747', commissionRate: 0.09, rating: 4.1, country: 'Global' },
  { id: 'jiji', name: 'Jiji', logo: '🟢', color: '#1DB954', commissionRate: 0.06, rating: 3.8, country: 'Nigeria' },
  { id: 'slot', name: 'Slot', logo: '🔵', color: '#0066CC', commissionRate: 0.06, rating: 4.3, country: 'Nigeria' },
  { id: 'payportmall', name: 'PayPorte Mall', logo: '🟣', color: '#7B2D8E', commissionRate: 0.07, rating: 3.9, country: 'Nigeria' },
  { id: 'ebay', name: 'eBay', logo: '🟡', color: '#E53238', commissionRate: 0.05, rating: 4.4, country: 'Global' },
];

export const categories: Category[] = [
  { id: 'phones', name: 'Phones & Tablets', icon: '📱', count: 12450 },
  { id: 'laptops', name: 'Laptops & Computers', icon: '💻', count: 8320 },
  { id: 'electronics', name: 'Electronics', icon: '🔌', count: 15670 },
  { id: 'fashion', name: 'Fashion', icon: '👗', count: 23100 },
  { id: 'home', name: 'Home & Office', icon: '🏠', count: 9870 },
  { id: 'health', name: 'Health & Beauty', icon: '💄', count: 11200 },
  { id: 'gaming', name: 'Gaming', icon: '🎮', count: 4560 },
  { id: 'appliances', name: 'Appliances', icon: '🏗️', count: 6780 },
  { id: 'groceries', name: 'Groceries', icon: '🛒', count: 18900 },
  { id: 'baby', name: 'Baby Products', icon: '👶', count: 5430 },
  { id: 'sports', name: 'Sporting Goods', icon: '⚽', count: 7650 },
  { id: 'automobile', name: 'Automobile', icon: '🚗', count: 3210 },
];

export const products: Product[] = [
  {
    id: 'iphone-15-pro',
    name: 'Apple iPhone 15 Pro Max 256GB',
    description: 'The most powerful iPhone ever. Features the A17 Pro chip, a titanium design, and the most advanced camera system on iPhone.',
    category: 'phones',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop',
    brand: 'Apple',
    ratings: [
      { user: 'John D.', rating: 5, comment: 'Best phone I have ever owned. The camera is incredible!', date: '2024-01-15', verified: true },
      { user: 'Sarah M.', rating: 4, comment: 'Great phone but expensive. Battery life could be better.', date: '2024-01-10', verified: true },
      { user: 'Mike T.', rating: 5, comment: 'The titanium body feels premium. Worth every penny.', date: '2024-01-08', verified: true },
    ],
    listings: [
      { store: stores[0], price: 1250000, originalPrice: 1400000, currency: '₦', shippingCost: 0, deliveryDays: '2-4 days', inStock: true, rating: 4.5, reviews: 234, affiliateUrl: '#', discount: 11, lastUpdated: '2 hours ago', seller: 'Apple Official Store', condition: 'new', warranty: '1 year manufacturer warranty' },
      { store: stores[1], price: 1275000, originalPrice: 1380000, currency: '₦', shippingCost: 2500, deliveryDays: '3-5 days', inStock: true, rating: 4.2, reviews: 189, affiliateUrl: '#', discount: 8, lastUpdated: '1 hour ago', seller: 'Konga Direct', condition: 'new', warranty: '1 year manufacturer warranty' },
      { store: stores[2], price: 1199, originalPrice: 1299, currency: '$', shippingCost: 0, deliveryDays: '5-7 days', inStock: true, rating: 4.8, reviews: 1250, affiliateUrl: '#', discount: 8, lastUpdated: '30 min ago', seller: 'Amazon US', condition: 'new', warranty: '1 year manufacturer warranty' },
      { store: stores[3], price: 1150, originalPrice: 1350, currency: '$', shippingCost: 15, deliveryDays: '15-25 days', inStock: true, rating: 4.0, reviews: 567, affiliateUrl: '#', discount: 15, lastUpdated: '4 hours ago', seller: 'Global Tech Store', condition: 'new', warranty: '6 months seller warranty' },
      { store: stores[5], price: 1280000, originalPrice: 1350000, currency: '₦', shippingCost: 0, deliveryDays: '1-2 days', inStock: true, rating: 4.6, reviews: 98, affiliateUrl: '#', discount: 5, lastUpdated: '45 min ago', seller: 'Slot Nigeria', condition: 'new', warranty: '1 year manufacturer warranty' },
    ],
    specifications: { 'Display': '6.7" Super Retina XDR OLED', 'Processor': 'A17 Pro', 'RAM': '8GB', 'Storage': '256GB', 'Camera': '48MP + 12MP + 12MP', 'Battery': '4441 mAh', 'OS': 'iOS 17', 'Weight': '221g' },
    tags: ['bestseller', 'new', 'premium'],
  },
  {
    id: 'samsung-s24-ultra',
    name: 'Samsung Galaxy S24 Ultra 512GB',
    description: 'The ultimate Galaxy experience with Galaxy AI, S Pen, and the most powerful Snapdragon processor.',
    category: 'phones',
    image: 'https://images.unsplash.com/photo-1610945415292-d4f7889a9468?w=400&h=400&fit=crop',
    brand: 'Samsung',
    ratings: [
      { user: 'Alex K.', rating: 5, comment: 'The AI features are mind-blowing. Best Android phone!', date: '2024-02-01', verified: true },
      { user: 'Grace O.', rating: 4, comment: 'Amazing camera and display. S Pen is a nice bonus.', date: '2024-01-28', verified: true },
    ],
    listings: [
      { store: stores[0], price: 1150000, originalPrice: 1300000, currency: '₦', shippingCost: 0, deliveryDays: '2-4 days', inStock: true, rating: 4.4, reviews: 312, affiliateUrl: '#', discount: 12, lastUpdated: '1 hour ago', seller: 'Samsung Official', condition: 'new', warranty: '1 year manufacturer warranty' },
      { store: stores[1], price: 1180000, originalPrice: 1280000, currency: '₦', shippingCost: 1500, deliveryDays: '3-5 days', inStock: true, rating: 4.1, reviews: 156, affiliateUrl: '#', discount: 8, lastUpdated: '2 hours ago', seller: 'Samsung Hub', condition: 'new', warranty: '1 year manufacturer warranty' },
      { store: stores[2], price: 1099, originalPrice: 1299, currency: '$', shippingCost: 0, deliveryDays: '5-7 days', inStock: true, rating: 4.7, reviews: 890, affiliateUrl: '#', discount: 15, lastUpdated: '20 min ago', seller: 'Amazon US', condition: 'new', warranty: '1 year manufacturer warranty' },
      { store: stores[5], price: 1200000, originalPrice: 1300000, currency: '₦', shippingCost: 0, deliveryDays: '1-2 days', inStock: true, rating: 4.5, reviews: 78, affiliateUrl: '#', discount: 8, lastUpdated: '3 hours ago', seller: 'Slot Nigeria', condition: 'new', warranty: '1 year manufacturer warranty' },
    ],
    specifications: { 'Display': '6.8" Dynamic AMOLED 2X', 'Processor': 'Snapdragon 8 Gen 3', 'RAM': '12GB', 'Storage': '512GB', 'Camera': '200MP + 12MP + 50MP + 10MP', 'Battery': '5000 mAh', 'OS': 'Android 14', 'Weight': '232g' },
    tags: ['bestseller', 'new', 'ai-powered'],
  },
  {
    id: 'macbook-pro-m3',
    name: 'Apple MacBook Pro 14" M3 Pro',
    description: 'Supercharged by M3 Pro chip with up to 18 hours of battery life. Stunning Liquid Retina XDR display.',
    category: 'laptops',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
    brand: 'Apple',
    ratings: [
      { user: 'David L.', rating: 5, comment: 'The M3 Pro is insanely fast. Perfect for development work.', date: '2024-01-20', verified: true },
      { user: 'Nina P.', rating: 5, comment: 'Best laptop for creative professionals. The display is gorgeous.', date: '2024-01-18', verified: true },
    ],
    listings: [
      { store: stores[0], price: 1850000, originalPrice: 2100000, currency: '₦', shippingCost: 0, deliveryDays: '3-5 days', inStock: true, rating: 4.6, reviews: 89, affiliateUrl: '#', discount: 12, lastUpdated: '1 hour ago', seller: 'Apple Store Nigeria', condition: 'new', warranty: '1 year Apple warranty' },
      { store: stores[2], price: 1999, originalPrice: 2399, currency: '$', shippingCost: 0, deliveryDays: '5-8 days', inStock: true, rating: 4.9, reviews: 2100, affiliateUrl: '#', discount: 17, lastUpdated: '15 min ago', seller: 'Amazon US', condition: 'new', warranty: '1 year Apple warranty' },
      { store: stores[3], price: 1850, originalPrice: 2200, currency: '$', shippingCost: 25, deliveryDays: '15-30 days', inStock: true, rating: 3.9, reviews: 345, affiliateUrl: '#', discount: 16, lastUpdated: '5 hours ago', seller: 'Tech World', condition: 'new', warranty: '6 months seller warranty' },
      { store: stores[7], price: 1950, originalPrice: 2300, currency: '$', shippingCost: 30, deliveryDays: '7-14 days', inStock: true, rating: 4.3, reviews: 456, affiliateUrl: '#', discount: 15, lastUpdated: '2 hours ago', seller: 'eBay Global', condition: 'new', warranty: '1 year Apple warranty' },
    ],
    specifications: { 'Display': '14.2" Liquid Retina XDR', 'Processor': 'Apple M3 Pro', 'RAM': '18GB Unified', 'Storage': '512GB SSD', 'Battery': 'Up to 18 hours', 'Weight': '1.61 kg', 'OS': 'macOS Sonoma', 'Ports': '3x Thunderbolt 4, HDMI, SD Card, MagSafe' },
    tags: ['bestseller', 'premium', 'professional'],
  },
  {
    id: 'ps5-console',
    name: 'PlayStation 5 Console (Slim)',
    description: 'Experience lightning-fast loading, deeper immersion with haptic feedback, adaptive triggers, and 3D Audio.',
    category: 'gaming',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=400&fit=crop',
    brand: 'Sony',
    ratings: [
      { user: 'Chris B.', rating: 5, comment: 'Next-gen gaming at its finest. The slim design is perfect.', date: '2024-01-25', verified: true },
      { user: 'Tom R.', rating: 4, comment: 'Great console but wish more games were available.', date: '2024-01-22', verified: true },
    ],
    listings: [
      { store: stores[0], price: 580000, originalPrice: 650000, currency: '₦', shippingCost: 0, deliveryDays: '2-4 days', inStock: true, rating: 4.5, reviews: 456, affiliateUrl: '#', discount: 11, lastUpdated: '30 min ago', seller: 'Sony Official', condition: 'new', warranty: '1 year manufacturer warranty' },
      { store: stores[1], price: 595000, originalPrice: 640000, currency: '₦', shippingCost: 3000, deliveryDays: '3-5 days', inStock: true, rating: 4.3, reviews: 234, affiliateUrl: '#', discount: 7, lastUpdated: '1 hour ago', seller: 'Gaming Hub', condition: 'new', warranty: '1 year manufacturer warranty' },
      { store: stores[2], price: 449, originalPrice: 499, currency: '$', shippingCost: 0, deliveryDays: '5-7 days', inStock: true, rating: 4.8, reviews: 3400, affiliateUrl: '#', discount: 10, lastUpdated: '10 min ago', seller: 'Amazon US', condition: 'new', warranty: '1 year manufacturer warranty' },
      { store: stores[4], price: 550000, originalPrice: 620000, currency: '₦', shippingCost: 5000, deliveryDays: '1-3 days', inStock: true, rating: 3.9, reviews: 89, affiliateUrl: '#', discount: 11, lastUpdated: '4 hours ago', seller: 'GameZone Lagos', condition: 'new', warranty: '6 months seller warranty' },
    ],
    specifications: { 'CPU': 'AMD Zen 2, 8 cores', 'GPU': 'AMD RDNA 2, 10.28 TFLOPs', 'RAM': '16GB GDDR6', 'Storage': '1TB SSD', 'Resolution': 'Up to 8K', 'Disc': 'Ultra HD Blu-ray', 'Weight': '3.2 kg' },
    tags: ['gaming', 'bestseller', 'new'],
  },
  {
    id: 'sony-wh1000xm5',
    name: 'Sony WH-1000XM5 Wireless Headphones',
    description: 'Industry-leading noise cancellation with Auto NC Optimizer. Crystal clear hands-free calling with 4 beamforming microphones.',
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=400&fit=crop',
    brand: 'Sony',
    ratings: [
      { user: 'Emma W.', rating: 5, comment: 'Best noise cancellation I have ever experienced. Perfect for flights!', date: '2024-01-30', verified: true },
      { user: 'James A.', rating: 4, comment: 'Great sound quality but a bit tight on the head initially.', date: '2024-01-27', verified: true },
    ],
    listings: [
      { store: stores[0], price: 285000, originalPrice: 320000, currency: '₦', shippingCost: 0, deliveryDays: '2-4 days', inStock: true, rating: 4.6, reviews: 178, affiliateUrl: '#', discount: 11, lastUpdated: '1 hour ago', seller: 'Sony Official', condition: 'new', warranty: '1 year manufacturer warranty' },
      { store: stores[2], price: 328, originalPrice: 399, currency: '$', shippingCost: 0, deliveryDays: '5-7 days', inStock: true, rating: 4.8, reviews: 5600, affiliateUrl: '#', discount: 18, lastUpdated: '20 min ago', seller: 'Amazon US', condition: 'new', warranty: '1 year manufacturer warranty' },
      { store: stores[3], price: 295, originalPrice: 380, currency: '$', shippingCost: 10, deliveryDays: '15-25 days', inStock: true, rating: 4.1, reviews: 890, affiliateUrl: '#', discount: 22, lastUpdated: '3 hours ago', seller: 'Audio World', condition: 'new', warranty: '6 months seller warranty' },
      { store: stores[7], price: 310, originalPrice: 370, currency: '$', shippingCost: 15, deliveryDays: '7-14 days', inStock: true, rating: 4.4, reviews: 234, affiliateUrl: '#', discount: 16, lastUpdated: '2 hours ago', seller: 'eBay Audio', condition: 'new', warranty: '1 year manufacturer warranty' },
    ],
    specifications: { 'Driver': '30mm', 'Frequency': '4Hz-40,000Hz', 'Battery': '30 hours', 'Charging': 'USB-C, 3min = 3hrs', 'Weight': '250g', 'Bluetooth': '5.2', 'ANC': 'Auto NC Optimizer', 'Codecs': 'LDAC, AAC, SBC' },
    tags: ['bestseller', 'audio', 'premium'],
  },
  {
    id: 'lg-oled-tv',
    name: 'LG C3 55" OLED 4K Smart TV',
    description: 'Perfect blacks, infinite contrast, and over a billion colors with the α9 Gen6 AI Processor 4K.',
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop',
    brand: 'LG',
    ratings: [
      { user: 'Peter N.', rating: 5, comment: 'The picture quality is absolutely stunning. Best TV I have owned.', date: '2024-01-12', verified: true },
      { user: 'Lisa M.', rating: 5, comment: 'Gaming on this TV is incredible. 120Hz OLED perfection.', date: '2024-01-10', verified: true },
    ],
    listings: [
      { store: stores[0], price: 850000, originalPrice: 950000, currency: '₦', shippingCost: 0, deliveryDays: '3-5 days', inStock: true, rating: 4.7, reviews: 234, affiliateUrl: '#', discount: 11, lastUpdated: '2 hours ago', seller: 'LG Official', condition: 'new', warranty: '2 years manufacturer warranty' },
      { store: stores[1], price: 870000, originalPrice: 930000, currency: '₦', shippingCost: 5000, deliveryDays: '4-6 days', inStock: true, rating: 4.4, reviews: 156, affiliateUrl: '#', discount: 6, lastUpdated: '3 hours ago', seller: 'Electronics Hub', condition: 'new', warranty: '2 years manufacturer warranty' },
      { store: stores[2], price: 1096, originalPrice: 1299, currency: '$', shippingCost: 0, deliveryDays: '5-8 days', inStock: true, rating: 4.8, reviews: 4500, affiliateUrl: '#', discount: 16, lastUpdated: '45 min ago', seller: 'Amazon US', condition: 'new', warranty: '1 year manufacturer warranty' },
    ],
    specifications: { 'Display': '55" OLED evo', 'Resolution': '4K UHD (3840x2160)', 'Processor': 'α9 Gen6 AI Processor 4K', 'HDR': 'Dolby Vision IQ, HDR10', 'Refresh Rate': '120Hz', 'Smart TV': 'webOS 23', 'HDMI': '4x HDMI 2.1', 'Audio': '40W with Dolby Atmos' },
    tags: ['premium', 'smart-tv', 'gaming'],
  },
  {
    id: 'nike-air-max',
    name: 'Nike Air Max 270 React',
    description: 'Combining two of Nike\'s best technologies, the Air Max 270 React delivers visible cushioning and responsive comfort.',
    category: 'fashion',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    brand: 'Nike',
    ratings: [
      { user: 'Kola A.', rating: 5, comment: 'Super comfortable! I wear them every day.', date: '2024-01-18', verified: true },
      { user: 'Funke B.', rating: 4, comment: 'Great shoes but sizing runs a bit large.', date: '2024-01-15', verified: true },
    ],
    listings: [
      { store: stores[0], price: 95000, originalPrice: 120000, currency: '₦', shippingCost: 1500, deliveryDays: '2-4 days', inStock: true, rating: 4.3, reviews: 567, affiliateUrl: '#', discount: 21, lastUpdated: '1 hour ago', seller: 'Nike Nigeria', condition: 'new', warranty: '30 days return' },
      { store: stores[2], price: 130, originalPrice: 160, currency: '$', shippingCost: 0, deliveryDays: '5-7 days', inStock: true, rating: 4.6, reviews: 2300, affiliateUrl: '#', discount: 19, lastUpdated: '30 min ago', seller: 'Amazon US', condition: 'new', warranty: '30 days return' },
      { store: stores[3], price: 95, originalPrice: 140, currency: '$', shippingCost: 8, deliveryDays: '15-25 days', inStock: true, rating: 3.8, reviews: 1200, affiliateUrl: '#', discount: 32, lastUpdated: '6 hours ago', seller: 'Sneaker World', condition: 'new', warranty: '15 days return' },
      { store: stores[7], price: 110, originalPrice: 150, currency: '$', shippingCost: 12, deliveryDays: '7-14 days', inStock: true, rating: 4.2, reviews: 456, affiliateUrl: '#', discount: 27, lastUpdated: '4 hours ago', seller: 'eBay Sneakers', condition: 'new', warranty: '30 days return' },
    ],
    specifications: { 'Material': 'Mesh & Synthetic', 'Sole': 'Rubber', 'Closure': 'Lace-up', 'Technology': 'Air Max 270 + React', 'Weight': '340g', 'Drop': '10mm', 'Style': 'Athletic/Casual' },
    tags: ['fashion', 'bestseller', 'sports'],
  },
  {
    id: 'ipad-pro-m2',
    name: 'Apple iPad Pro 12.9" M2 Chip',
    description: 'The ultimate iPad experience with M2 chip, Liquid Retina XDR display, and Apple Pencil hover.',
    category: 'phones',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
    brand: 'Apple',
    ratings: [
      { user: 'Tunde O.', rating: 5, comment: 'Replaced my laptop with this. The M2 is incredibly fast.', date: '2024-01-22', verified: true },
      { user: 'Amara C.', rating: 4, comment: 'Great for digital art. Apple Pencil hover is a game changer.', date: '2024-01-20', verified: true },
    ],
    listings: [
      { store: stores[0], price: 980000, originalPrice: 1100000, currency: '₦', shippingCost: 0, deliveryDays: '2-4 days', inStock: true, rating: 4.7, reviews: 145, affiliateUrl: '#', discount: 11, lastUpdated: '1 hour ago', seller: 'Apple Store Nigeria', condition: 'new', warranty: '1 year manufacturer warranty' },
      { store: stores[2], price: 1049, originalPrice: 1199, currency: '$', shippingCost: 0, deliveryDays: '5-7 days', inStock: true, rating: 4.9, reviews: 3200, affiliateUrl: '#', discount: 13, lastUpdated: '25 min ago', seller: 'Amazon US', condition: 'new', warranty: '1 year manufacturer warranty' },
      { store: stores[3], price: 980, originalPrice: 1150, currency: '$', shippingCost: 15, deliveryDays: '15-25 days', inStock: true, rating: 4.0, reviews: 678, affiliateUrl: '#', discount: 15, lastUpdated: '4 hours ago', seller: 'Tablet World', condition: 'new', warranty: '6 months seller warranty' },
      { store: stores[5], price: 1000000, originalPrice: 1080000, currency: '₦', shippingCost: 0, deliveryDays: '1-2 days', inStock: true, rating: 4.5, reviews: 67, affiliateUrl: '#', discount: 7, lastUpdated: '2 hours ago', seller: 'Slot Nigeria', condition: 'new', warranty: '1 year manufacturer warranty' },
    ],
    specifications: { 'Display': '12.9" Liquid Retina XDR', 'Chip': 'Apple M2', 'RAM': '8GB', 'Storage': '256GB', 'Camera': '12MP Wide + 10MP Ultra Wide', 'Battery': 'Up to 10 hours', 'Connector': 'Thunderbolt / USB 4', 'Weight': '682g' },
    tags: ['premium', 'creative', 'professional'],
  },
  {
    id: 'dyson-v15',
    name: 'Dyson V15 Detect Absolute Vacuum',
    description: 'Dyson\'s most powerful intelligent cordless vacuum. Reveals microscopic dust with a laser slim fluffy cleaner head.',
    category: 'appliances',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop',
    brand: 'Dyson',
    ratings: [
      { user: 'Bola S.', rating: 5, comment: 'The laser detection is amazing. I can see dust I never knew existed!', date: '2024-01-28', verified: true },
      { user: 'Chidi N.', rating: 4, comment: 'Powerful suction but battery could last longer on max.', date: '2024-01-25', verified: true },
    ],
    listings: [
      { store: stores[0], price: 520000, originalPrice: 600000, currency: '₦', shippingCost: 0, deliveryDays: '3-5 days', inStock: true, rating: 4.5, reviews: 89, affiliateUrl: '#', discount: 13, lastUpdated: '2 hours ago', seller: 'Dyson Nigeria', condition: 'new', warranty: '2 years manufacturer warranty' },
      { store: stores[2], price: 649, originalPrice: 749, currency: '$', shippingCost: 0, deliveryDays: '5-7 days', inStock: true, rating: 4.7, reviews: 1800, affiliateUrl: '#', discount: 13, lastUpdated: '40 min ago', seller: 'Amazon US', condition: 'new', warranty: '2 years manufacturer warranty' },
      { store: stores[1], price: 540000, originalPrice: 590000, currency: '₦', shippingCost: 5000, deliveryDays: '4-6 days', inStock: true, rating: 4.2, reviews: 56, affiliateUrl: '#', discount: 8, lastUpdated: '3 hours ago', seller: 'Home Appliances Hub', condition: 'new', warranty: '2 years manufacturer warranty' },
    ],
    specifications: { 'Power': '240AW', 'Runtime': 'Up to 60 minutes', 'Dust Capacity': '0.76L', 'Weight': '3.1 kg', 'Filtration': 'Whole-machine HEPA', 'Display': 'LCD screen', 'Laser': 'Green laser dust detection' },
    tags: ['home', 'premium', 'smart'],
  },
  {
    id: 'airpods-pro-2',
    name: 'Apple AirPods Pro 2nd Generation (USB-C)',
    description: 'Rebuilt from the sound up with the H2 chip. Active Noise Cancellation up to 2x more powerful.',
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=400&fit=crop',
    brand: 'Apple',
    ratings: [
      { user: 'Segun A.', rating: 5, comment: 'Best earbuds on the market. The ANC is incredible.', date: '2024-02-01', verified: true },
      { user: 'Ngozi E.', rating: 4, comment: 'Great sound but wish the battery lasted longer.', date: '2024-01-29', verified: true },
    ],
    listings: [
      { store: stores[0], price: 195000, originalPrice: 220000, currency: '₦', shippingCost: 0, deliveryDays: '2-4 days', inStock: true, rating: 4.6, reviews: 345, affiliateUrl: '#', discount: 11, lastUpdated: '30 min ago', seller: 'Apple Store Nigeria', condition: 'new', warranty: '1 year manufacturer warranty' },
      { store: stores[1], price: 200000, originalPrice: 215000, currency: '₦', shippingCost: 1000, deliveryDays: '3-5 days', inStock: true, rating: 4.3, reviews: 234, affiliateUrl: '#', discount: 7, lastUpdated: '1 hour ago', seller: 'Konga Direct', condition: 'new', warranty: '1 year manufacturer warranty' },
      { store: stores[2], price: 229, originalPrice: 249, currency: '$', shippingCost: 0, deliveryDays: '5-7 days', inStock: true, rating: 4.8, reviews: 8900, affiliateUrl: '#', discount: 8, lastUpdated: '15 min ago', seller: 'Amazon US', condition: 'new', warranty: '1 year manufacturer warranty' },
      { store: stores[5], price: 198000, originalPrice: 218000, currency: '₦', shippingCost: 0, deliveryDays: '1-2 days', inStock: true, rating: 4.5, reviews: 123, affiliateUrl: '#', discount: 9, lastUpdated: '2 hours ago', seller: 'Slot Nigeria', condition: 'new', warranty: '1 year manufacturer warranty' },
    ],
    specifications: { 'Chip': 'Apple H2', 'ANC': 'Active Noise Cancellation', 'Battery': '6hrs (30hrs with case)', 'Charging': 'USB-C, MagSafe, Qi', 'Water Resistance': 'IP54', 'Audio': 'Adaptive Transparency, Personalized Spatial Audio', 'Connectivity': 'Bluetooth 5.3' },
    tags: ['bestseller', 'audio', 'apple'],
  },
  {
    id: 'gaming-chair',
    name: 'Secretlab TITAN Evo 2022 Gaming Chair',
    description: 'The world\'s best gaming chair. Built for multi-tilt functionality with integrated adjustable lumbar support.',
    category: 'home',
    image: 'https://images.unsplash.com/photo-1598550473359-435731e11090?w=400&h=400&fit=crop',
    brand: 'Secretlab',
    ratings: [
      { user: 'Ade K.', rating: 5, comment: 'Worth every penny. My back pain is gone after switching to this.', date: '2024-01-20', verified: true },
    ],
    listings: [
      { store: stores[2], price: 519, originalPrice: 599, currency: '$', shippingCost: 0, deliveryDays: '5-10 days', inStock: true, rating: 4.7, reviews: 3400, affiliateUrl: '#', discount: 13, lastUpdated: '1 hour ago', seller: 'Secretlab Official', condition: 'new', warranty: '5 years warranty' },
      { store: stores[3], price: 389, originalPrice: 500, currency: '$', shippingCost: 35, deliveryDays: '20-35 days', inStock: true, rating: 3.9, reviews: 234, affiliateUrl: '#', discount: 22, lastUpdated: '5 hours ago', seller: 'Furniture World', condition: 'new', warranty: '2 years seller warranty' },
      { store: stores[7], price: 450, originalPrice: 550, currency: '$', shippingCost: 40, deliveryDays: '10-18 days', inStock: true, rating: 4.3, reviews: 567, affiliateUrl: '#', discount: 18, lastUpdated: '3 hours ago', seller: 'eBay Furniture', condition: 'new', warranty: '3 years warranty' },
    ],
    specifications: { 'Material': 'NEO Hybrid Leatherette', 'Recline': 'Multi-tilt (85°-165°)', 'Weight Capacity': '180 kg', 'Seat Height': '44-54 cm', 'Armrests': '4D Adjustable', 'Lumbar': 'Integrated adjustable', 'Headrest': 'Magnetic memory foam' },
    tags: ['gaming', 'ergonomic', 'premium'],
  },
  {
    id: 'kindle-paperwhite',
    name: 'Amazon Kindle Paperwhite (2023)',
    description: 'The thinnest, lightest Kindle Paperwhite yet with a flush-front design and 300 ppi glare-free display.',
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&h=400&fit=crop',
    brand: 'Amazon',
    ratings: [
      { user: 'Yemi F.', rating: 5, comment: 'Perfect for reading. The screen is so easy on the eyes.', date: '2024-01-15', verified: true },
      { user: 'Ada O.', rating: 4, comment: 'Love it! Battery lasts weeks.', date: '2024-01-12', verified: true },
    ],
    listings: [
      { store: stores[2], price: 139, originalPrice: 159, currency: '$', shippingCost: 0, deliveryDays: '5-7 days', inStock: true, rating: 4.7, reviews: 12000, affiliateUrl: '#', discount: 13, lastUpdated: '10 min ago', seller: 'Amazon US', condition: 'new', warranty: '1 year manufacturer warranty' },
      { store: stores[0], price: 125000, originalPrice: 140000, currency: '₦', shippingCost: 0, deliveryDays: '3-5 days', inStock: true, rating: 4.4, reviews: 234, affiliateUrl: '#', discount: 11, lastUpdated: '2 hours ago', seller: 'Amazon via Jumia', condition: 'new', warranty: '1 year manufacturer warranty' },
      { store: stores[3], price: 115, originalPrice: 150, currency: '$', shippingCost: 8, deliveryDays: '15-25 days', inStock: true, rating: 4.0, reviews: 567, affiliateUrl: '#', discount: 23, lastUpdated: '6 hours ago', seller: 'Gadget World', condition: 'new', warranty: '6 months seller warranty' },
    ],
    specifications: { 'Display': '6.8" 300 ppi', 'Storage': '16GB', 'Battery': 'Up to 10 weeks', 'Waterproof': 'IPX8', 'Weight': '205g', 'Light': 'Adjustable warm light', 'Connectivity': 'WiFi, USB-C' },
    tags: ['reading', 'bestseller', 'portable'],
  },
];

export const trendingSearches = [
  'iPhone 15 Pro', 'Samsung S24 Ultra', 'PS5 Console', 'MacBook Pro M3',
  'AirPods Pro', 'Nike Air Max', 'Gaming Chair', 'Smart TV 55 inch',
  'Laptop under 500k', 'Wireless Earbuds', 'iPad Pro', 'Dyson Vacuum'
];

export const getBestDeal = (product: Product): { listing: typeof product.listings[0], savings: number } => {
  const listings = product.listings.filter(l => l.inStock);
  if (listings.length === 0) return { listing: product.listings[0], savings: 0 };
  
  // Normalize prices to a common currency for comparison (simplified)
  const normalized = listings.map(l => ({
    ...l,
    normalizedPrice: l.currency === '$' ? l.price * 1500 : l.price
  }));
  
  const best = normalized.reduce((min, curr) => curr.normalizedPrice < min.normalizedPrice ? curr : min);
  const worst = normalized.reduce((max, curr) => curr.normalizedPrice > max.normalizedPrice ? curr : max);
  
  return {
    listing: best,
    savings: worst.normalizedPrice - best.normalizedPrice
  };
};
