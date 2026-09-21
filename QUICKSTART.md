# 🚀 PriceWise - Real Web Scraping - Quick Start Guide

## ✅ What You Have Now

A **complete full-stack application** with **REAL web scraping** using Puppeteer (actual Chrome browser automation).

---

## 📦 What's Included

### Frontend (React + TypeScript)
- ✅ Product search & comparison UI
- ✅ Admin dashboard for monitoring
- ✅ Price history charts
- ✅ User authentication
- ✅ API service to connect to backend

### Backend (Node.js + Express) - REAL SCRAPING
- ✅ **Puppeteer** - Real Chrome browser automation
- ✅ **Cheerio** - Real HTML parsing
- ✅ **JumiaScraper** - Scrapes actual Jumia website
- ✅ **KongaScraper** - Scrapes actual Konga website
- ✅ **MongoDB** - Real database
- ✅ **BullMQ + Redis** - Real job queues
- ✅ **REST API** - Endpoints for frontend

---

## 🎯 Quick Start (5 Minutes)

### Prerequisites
- Node.js 18+ installed
- MongoDB installed and running
- Redis installed and running

### Step 1: Install Dependencies

```bash
# Frontend (already done)
npm install

# Backend
cd backend
npm install
```

### Step 2: Setup Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/pricewise
REDIS_HOST=localhost
REDIS_PORT=6379
FRONTEND_URL=http://localhost:5173
```

### Step 3: Start Services

Open **5 terminals**:

**Terminal 1 - MongoDB:**
```bash
mongod
```

**Terminal 2 - Redis:**
```bash
redis-server
```

**Terminal 3 - Backend Server:**
```bash
cd backend
npm run dev
```

**Terminal 4 - Queue Worker:**
```bash
cd backend
npm run worker
```

**Terminal 5 - Frontend:**
```bash
npm run dev
```

### Step 4: Access Application

- **Frontend**: http://localhost:5173
- **Admin Dashboard**: http://localhost:5173/admin
- **Backend API**: http://localhost:5000

---

## 🎬 First Real Scrape

### Option 1: Via Admin Dashboard

1. Go to http://localhost:5173/admin
2. Click **"Scrape Phones"** button
3. Watch the magic happen!
4. Real products from Jumia will appear in database

### Option 2: Via API

```bash
curl -X POST http://localhost:5000/api/v1/admin/ingestion/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.jumia.com.ng/phones/",
    "retailerId": "jumia"
  }'
```

### Option 3: Via Frontend

```typescript
import { api } from './services/api';

// Trigger real scrape
await api.triggerScrape('https://www.jumia.com.ng/phones/', 'jumia');

// Get real products
const products = await api.getProducts({ category: 'phones' });
console.log(products); // Real products from Jumia!
```

---

## 🔍 What Actually Happens

### When You Trigger a Scrape:

```
1. Frontend sends POST request to backend
   ↓
2. Backend adds job to BullMQ queue
   ↓
3. Worker picks up job
   ↓
4. Puppeteer launches REAL Chrome browser
   ↓
5. Navigates to https://www.jumia.com.ng/phones/
   ↓
6. Waits for page to load (JavaScript renders)
   ↓
7. Extracts HTML from ACTUAL webpage
   ↓
8. Cheerio parses the HTML
   ↓
9. Extracts product titles, prices, images
   ↓
10. Stores in MongoDB database
    ↓
11. Frontend fetches from database
    ↓
12. User sees REAL products from Jumia!
```

---

## 📊 Example Output

After scraping, you'll see REAL products like:

```json
{
  "_id": "65a1234567890",
  "name": "Apple iPhone 15 Pro Max 256GB",
  "brand": "Apple",
  "category": "phones",
  "images": ["https://img.jumia.com.ng/..."],
  "listings": [
    {
      "store": { "id": "jumia", "name": "Jumia" },
      "price": 1250000,
      "originalPrice": 1400000,
      "currency": "₦",
      "inStock": true,
      "affiliateUrl": "https://www.jumia.com.ng/...",
      "lastVerified": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## 🛠️ Troubleshooting

### MongoDB Not Running?
```bash
# Ubuntu/Debian
sudo systemctl start mongodb

# macOS
brew services start mongodb-community

# Windows
net start MongoDB
```

### Redis Not Running?
```bash
# Ubuntu/Debian
sudo systemctl start redis

# macOS
brew services start redis

# Windows
redis-server
```

### Puppeteer Issues?
```bash
# Install Chrome dependencies (Ubuntu/Debian)
sudo apt-get install -y \
  gconf-service libasound2 libatk1.0-0 libc6 libcairo2 \
  libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 \
  libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0
```

### Backend Won't Start?
```bash
# Check logs
cd backend
npm run dev

# Check if port 5000 is in use
lsof -i :5000

# Kill process
kill -9 <PID>
```

---

## 📁 Project Structure

```
pricewise/
├── src/                          # Frontend (React)
│   ├── App.tsx
│   ├── pages/
│   │   ├── AdminDashboard.tsx    # Admin UI
│   │   └── ...
│   └── services/
│       └── api.ts                # API client
│
├── backend/                      # Backend (Node.js)
│   ├── src/
│   │   ├── index.ts              # Express server
│   │   ├── scrapers/
│   │   │   ├── BaseScraper.ts    # Puppeteer base
│   │   │   ├── JumiaScraper.ts   # REAL Jumia scraper
│   │   │   └── KongaScraper.ts   # REAL Konga scraper
│   │   ├── models/
│   │   │   ├── Product.ts        # MongoDB schema
│   │   │   └── PriceHistory.ts
│   │   └── queues/
│   │       └── worker.ts         # Queue worker
│   ├── package.json
│   └── .env
│
└── README.md                     # This file
```

---

## 🎓 Next Steps

### 1. Add More Scrapers
Create `backend/src/scrapers/AmazonScraper.ts`:
```typescript
export class AmazonScraper extends BaseScraper {
  constructor() {
    super('amazon', 'https://www.amazon.com');
  }
  
  protected async extractProducts(page: Page, url: string) {
    // Extract from Amazon
  }
}
```

### 2. Deploy to Production
```bash
# Backend
cd backend
npm run build
pm2 start dist/index.js --name pricewise-api
pm2 start dist/queues/worker.js --name pricewise-worker

# Frontend
npm run build
# Deploy dist/ to Vercel/Netlify
```

### 3. Add Proxy Rotation
For large-scale scraping:
```typescript
const proxy = 'http://user:pass@proxy-server:port';
await page.goto(url, { /* use proxy */ });
```

---

## 📚 Documentation

- **Backend Setup**: `backend/README.md`
- **Architecture**: `ARCHITECTURE.md`
- **Phase 2 (Search)**: `PHASE2_DOCUMENTATION.md`
- **Phase 3 (Ingestion)**: `PHASE3_DOCUMENTATION.md`
- **Real Scraping**: `REAL_SCRAPING_IMPLEMENTATION.md`

---

## 🎯 Key Features

### Real Scraping
✅ Puppeteer (actual Chrome browser)
✅ Cheerio (real HTML parsing)
✅ Real HTTP requests to Jumia/Konga
✅ Real data extraction from actual websites

### Anti-Blocking
✅ User-Agent rotation (6 different agents)
✅ Random delays (2-5 seconds)
✅ Request interception (block images/CSS)
✅ CAPTCHA detection

### Data Processing
✅ Price parsing (₦45,000 → 45000)
✅ Stock detection
✅ Discount calculation
✅ Product matching

### Queue System
✅ BullMQ for background jobs
✅ Redis for queue management
✅ Retry logic with exponential backoff
✅ Rate limiting (10 jobs/minute)

### Database
✅ MongoDB for persistent storage
✅ Price history tracking
✅ Outlier detection (>50% change)
✅ Automatic indexing

---

## 💡 Tips

### Test Scraping
```bash
# Scrape single product
curl -X POST http://localhost:5000/api/v1/admin/ingestion/trigger \
  -d '{"url":"https://www.jumia.com.ng/product/123","retailerId":"jumia"}'

# Check health
curl http://localhost:5000/api/v1/admin/ingestion/health
```

### View Database
```bash
# MongoDB shell
mongo
use pricewise
db.products.find().limit(5)
```

### View Queue
```bash
# Redis CLI
redis-cli
KEYS *
```

---

## 🆘 Need Help?

### Common Issues

**"Cannot connect to MongoDB"**
- Check MongoDB is running: `mongod`
- Check URI in `.env`

**"Cannot connect to Redis"**
- Check Redis is running: `redis-server`
- Check host/port in `.env`

**"Puppeteer launch failed"**
- Install Chrome dependencies (see Troubleshooting)
- Try `headless: false` to see browser

**"Scrape returns 0 products"**
- Check if website structure changed
- Update CSS selectors in scraper
- Check logs for errors

---

## 🎉 You're Ready!

You now have a **complete full-stack application** with **REAL web scraping** capabilities.

### What You Can Do:
✅ Scrape real products from Jumia, Konga
✅ Store in MongoDB database
✅ Display in React frontend
✅ Monitor via admin dashboard
✅ Track price history
✅ Detect outliers
✅ Scale with queue system

### What's Next:
- Add more retailer scrapers
- Deploy to production
- Add proxy rotation
- Implement CAPTCHA solving
- Build mobile app

---

**Status**: ✅ **REAL web scraping implementation complete!**

Start scraping real products now! 🚀
