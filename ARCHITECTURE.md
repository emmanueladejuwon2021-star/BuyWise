# PriceWise - Complete Architecture Guide

## Overview

PriceWise is a full-stack price comparison platform with **real web scraping** capabilities. The system consists of:

1. **Frontend** (React + TypeScript) - User interface
2. **Backend** (Node.js + Express) - Real web scraping server
3. **Database** (MongoDB) - Product and price data storage
4. **Queue System** (BullMQ + Redis) - Background job processing

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│  - Product search & comparison UI                           │
│  - Admin dashboard                                          │
│  - User authentication                                      │
│  - Price alerts                                             │
└────────────────────┬────────────────────────────────────────┘
                     │ REST API
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Node.js + Express)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Layer                                           │  │
│  │  - Product endpoints                                 │  │
│  │  - Admin endpoints                                   │  │
│  │  - Ingestion endpoints                               │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Scraping Engine                                     │  │
│  │  - Puppeteer (headless browser)                      │  │
│  │  - Cheerio (HTML parsing)                            │  │
│  │  - JumiaScraper, KongaScraper, etc.                  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Queue System (BullMQ)                               │  │
│  │  - ScrapeQueue                                       │  │
│  │  - FeedQueue                                         │  │
│  │  - ValidationQueue                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
┌──────────────┐ ┌──────────┐ ┌──────────┐
│  MongoDB     │ │  Redis   │ │ External │
│  (Database)  │ │  (Queue) │ │  Sites   │
└──────────────┘ └──────────┘ └──────────┘
```

---

## Frontend (React + TypeScript)

### Location: `src/`

### Key Features
- **Product Search** - Multi-faceted search with filters
- **Price Comparison** - Side-by-side comparison matrix
- **Price History** - Interactive charts showing price trends
- **Admin Dashboard** - Real-time monitoring of scraping system
- **User Authentication** - Login/signup with watchlist
- **Price Alerts** - Get notified when prices drop

### Key Files
```
src/
├── App.tsx                    # Main app with routing
├── components/
│   ├── Header.tsx             # Navigation header
│   ├── Footer.tsx             # Footer with links
│   └── ProductCard.tsx        # Product display card
├── pages/
│   ├── HomePage.tsx           # Landing page
│   ├── SearchPage.tsx         # Search results
│   ├── ProductDetailPage.tsx  # Product comparison
│   ├── AdminDashboard.tsx     # Admin monitoring
│   └── DashboardPage.tsx      # User dashboard
├── engine/                    # Search & matching engine
│   ├── normalization.ts       # Text processing
│   ├── matching.ts            # Product deduplication
│   ├── ranking.ts             # Sorting algorithms
│   ├── search.ts              # Search API
│   └── cache.ts               # Caching layer
└── context/
    ├── AuthContext.tsx         # Authentication state
    └── ToastContext.tsx        # Notification system
```

### API Integration
```typescript
// Connect to backend
const API_BASE_URL = 'http://localhost:5000/api/v1';

// Example: Fetch products
const response = await fetch(`${API_BASE_URL}/products?category=phones`);
const data = await response.json();
```

---

## Backend (Node.js + Express)

### Location: `backend/`

### Key Features
- **Real Web Scraping** - Puppeteer + Cheerio
- **Anti-Blocking** - User-Agent rotation, delays, CAPTCHA detection
- **Job Queues** - BullMQ for background processing
- **Database** - MongoDB for persistent storage
- **REST API** - Endpoints for frontend integration

### Key Files
```
backend/
├── src/
│   ├── index.ts               # Express server
│   ├── config/
│   │   ├── index.ts           # Configuration
│   │   ├── database.ts        # MongoDB connection
│   │   └── redis.ts           # Redis/Queue setup
│   ├── scrapers/
│   │   ├── BaseScraper.ts     # Abstract scraper class
│   │   ├── JumiaScraper.ts    # Jumia implementation
│   │   └── KongaScraper.ts    # Konga implementation
│   ├── models/
│   │   ├── Product.ts         # Product schema
│   │   └── PriceHistory.ts    # Price history schema
│   └── queues/
│       └── worker.ts          # Queue worker process
├── package.json
├── tsconfig.json
└── .env.example
```

### How Real Scraping Works

#### 1. Launch Headless Browser
```typescript
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
```

#### 2. Navigate to Website
```typescript
const page = await browser.newPage();
await page.setUserAgent(USER_AGENTS[randomIndex]);
await page.goto('https://www.jumia.com.ng/phones/');
```

#### 3. Wait for Content
```typescript
await page.waitForSelector('.product-card');
await page.waitForFunction(() => document.readyState === 'complete');
```

#### 4. Extract Data with Cheerio
```typescript
const html = await page.content();
const $ = cheerio.load(html);

const title = $('h2.product-name').text();
const price = $('span.price').text();
const imageUrl = $('img.product-image').attr('src');
```

#### 5. Process & Store
```typescript
const product = {
  title,
  price: parsePrice(price),
  // ... other fields
};

await Product.create(product);
await PriceHistory.create({ productId, price, timestamp: Date.now() });
```

---

## Database (MongoDB)

### Collections

#### Products
```javascript
{
  _id: ObjectId,
  name: "Apple iPhone 15 Pro",
  slug: "apple-iphone-15-pro",
  category: "phones",
  brand: "Apple",
  images: ["https://..."],
  specifications: {
    "Storage": "256GB",
    "RAM": "8GB"
  },
  listings: [
    {
      store: { id: "jumia", name: "Jumia" },
      price: 1250000,
      originalPrice: 1400000,
      currency: "₦",
      shippingCost: 0,
      totalCost: 1250000,
      inStock: true,
      affiliateUrl: "https://jumia.com.ng/...",
      lastVerified: ISODate
    }
  ],
  lastVerified: ISODate,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

#### PriceHistory
```javascript
{
  _id: ObjectId,
  productId: "product_id",
  retailerId: "jumia",
  price: 1250000,
  originalPrice: 1400000,
  currency: "₦",
  timestamp: ISODate,
  percentageChange: -5.2,
  isOutlier: false
}
```

---

## Queue System (BullMQ + Redis)

### Queues

#### 1. ScrapeQueue
- **Purpose**: Process web scraping jobs
- **Concurrency**: 5 jobs
- **Rate Limit**: 10 jobs/minute
- **Retry**: 3 attempts with exponential backoff

#### 2. FeedQueue
- **Purpose**: Process bulk feed imports
- **Concurrency**: 3 jobs
- **Rate Limit**: 5 feeds/minute

#### 3. ValidationQueue
- **Purpose**: Re-validate stale prices
- **Concurrency**: 8 jobs
- **Priority**: Older prices get higher priority

### Worker Process
```bash
# Start worker (separate terminal)
npm run worker

# Worker processes jobs from queues
# Updates database with scraped data
# Logs price changes
```

---

## API Endpoints

### Public Endpoints

```bash
# Get products
GET /api/v1/products?category=phones&limit=20

# Get product by ID
GET /api/v1/products/:id

# Get price history
GET /api/v1/products/:id/price-history
```

### Admin Endpoints

```bash
# Trigger scrape
POST /api/v1/admin/ingestion/trigger
{
  "url": "https://jumia.com.ng/product/123",
  "retailerId": "jumia"
}

# Scrape category
POST /api/v1/admin/ingestion/category
{
  "category": "phones",
  "maxProducts": 10
}

# Get health status
GET /api/v1/admin/ingestion/health

# Get price changes
GET /api/v1/admin/ingestion/price-changes

# Get outliers
GET /api/v1/admin/ingestion/outliers
```

---

## Running the Application

### 1. Start Backend Services

```bash
# Terminal 1: MongoDB
mongod

# Terminal 2: Redis
redis-server

# Terminal 3: Backend Server
cd backend
npm run dev

# Terminal 4: Queue Worker
cd backend
npm run worker
```

### 2. Start Frontend

```bash
# Terminal 5: React App
npm run dev
```

### 3. Access Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Admin Dashboard**: http://localhost:5173/admin

---

## Data Flow

```
1. User searches for "iPhone 15"
   ↓
2. Frontend calls: GET /api/v1/products?q=iphone
   ↓
3. Backend queries MongoDB
   ↓
4. Returns products with all store listings
   ↓
5. Frontend displays comparison matrix
   ↓
6. User clicks "Buy Now" on Jumia listing
   ↓
7. Frontend logs click (affiliate tracking)
   ↓
8. Redirects to Jumia product page
   ↓
9. User completes purchase on Jumia
   ↓
10. PriceWise earns commission
```

---

## Scraping Flow

```
1. Admin triggers scrape: POST /api/v1/admin/ingestion/trigger
   ↓
2. Job added to ScrapeQueue
   ↓
3. Worker picks up job
   ↓
4. Puppeteer launches headless browser
   ↓
5. Navigates to Jumia/Konga/etc.
   ↓
6. Waits for page to load
   ↓
7. Extracts product data with Cheerio
   ↓
8. Cleans and validates data
   ↓
9. Updates/creates product in MongoDB
   ↓
10. Logs price change in PriceHistory
   ↓
11. Frontend automatically sees updated prices
```

---

## Anti-Blocking Strategies

### 1. User-Agent Rotation
```typescript
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
  // ... 6 different agents
];
```

### 2. Random Delays
```typescript
await new Promise(resolve => 
  setTimeout(resolve, 2000 + Math.random() * 3000)
);
```

### 3. Request Interception
```typescript
// Block images/CSS for speed
await page.setRequestInterception(true);
page.on('request', (req) => {
  if (['image', 'stylesheet'].includes(req.resourceType())) {
    req.abort();
  } else {
    req.continue();
  }
});
```

### 4. CAPTCHA Detection
```typescript
if (pageContent.includes('captcha') || pageContent.includes('robot')) {
  this.isBlocked = true;
  // Wait 5 minutes before retrying
}
```

---

## Production Deployment

### Option 1: VPS (Recommended)
```bash
# DigitalOcean, AWS EC2, etc.
# Install Node.js, MongoDB, Redis
# Use PM2 for process management
# Setup Nginx reverse proxy
# Configure SSL with Let's Encrypt
```

### Option 2: Docker
```bash
docker-compose up -d
```

### Option 3: Cloud Services
- **Frontend**: Vercel, Netlify
- **Backend**: Railway, Render, Heroku
- **Database**: MongoDB Atlas
- **Queue**: Redis Cloud

---

## Monitoring & Maintenance

### Logs
```bash
# Backend logs
pm2 logs pricewise-api

# Worker logs
pm2 logs pricewise-worker

# MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

### Health Checks
```bash
# Check backend health
curl http://localhost:5000/health

# Check MongoDB
mongo --eval "db.stats()"

# Check Redis
redis-cli info
```

### Backup
```bash
# MongoDB backup
mongodump --db pricewise --out /backup/

# Restore
mongorestore /backup/pricewise
```

---

## Scaling

### Horizontal Scaling
- Load balance multiple backend instances
- Shard MongoDB for large datasets
- Use Redis Cluster for queues

### Vertical Scaling
- Increase server RAM/CPU
- Optimize database queries
- Cache frequently accessed data

### Performance Tips
- Use indexes in MongoDB
- Limit concurrent scrapes per domain
- Implement CDN for static assets
- Optimize images

---

## Security

### Backend
- Helmet.js for HTTP headers
- CORS configuration
- Rate limiting on API
- Input validation
- SQL/NoSQL injection prevention

### Authentication
- JWT tokens
- Password hashing (bcrypt)
- Secure session management

### Scraping
- Respect robots.txt
- Rate limiting per domain
- Proxy rotation (for production)
- CAPTCHA solving services

---

## Legal Considerations

1. **Terms of Service** - Review merchant ToS
2. **robots.txt** - Respect crawling rules
3. **Rate Limiting** - Don't overload servers
4. **Data Privacy** - Don't store personal data
5. **Attribution** - Credit data sources

---

## Troubleshooting

### Puppeteer Issues
```bash
# Install Chrome dependencies
sudo apt-get install -y chromium-browser
```

### MongoDB Connection
```bash
# Check MongoDB status
sudo systemctl status mongodb

# Restart
sudo systemctl restart mongodb
```

### Redis Connection
```bash
# Check Redis status
sudo systemctl status redis

# Restart
sudo systemctl restart redis
```

### Queue Stuck
```bash
# Clear queue
redis-cli FLUSHALL

# Restart worker
pm2 restart pricewise-worker
```

---

## Next Steps

### Phase 4: Advanced Features
- [ ] Add more retailer scrapers (Amazon, AliExpress, eBay)
- [ ] Implement proxy rotation service
- [ ] Add CAPTCHA solving integration
- [ ] Machine learning for product matching
- [ ] Price prediction algorithms
- [ ] Mobile app (React Native)
- [ ] Browser extension
- [ ] Affiliate network integrations

---

## Support & Resources

### Documentation
- Backend: `backend/README.md`
- Phase 2: `PHASE2_DOCUMENTATION.md`
- Phase 3: `PHASE3_DOCUMENTATION.md`

### Technologies
- React: https://react.dev
- Node.js: https://nodejs.org
- Puppeteer: https://pptr.dev
- MongoDB: https://mongodb.com
- BullMQ: https://bullmq.io

### Community
- Stack Overflow
- GitHub Issues
- Discord/Slack channels

---

**Status**: ✅ Full-stack application with real web scraping - Production Ready!
