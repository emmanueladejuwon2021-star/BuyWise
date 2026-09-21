# PriceWise Backend - Real Web Scraping Server

## Overview

This is the **real backend server** for PriceWise that performs actual web scraping using Puppeteer and Cheerio. It connects to the frontend React application via REST API.

## Architecture

```
Backend (Node.js + Express)
├── Puppeteer (Headless browser scraping)
├── Cheerio (HTML parsing)
├── BullMQ + Redis (Job queues)
├── MongoDB (Database)
└── REST API (Frontend integration)
```

## Prerequisites

1. **Node.js 18+**
2. **MongoDB** (local or MongoDB Atlas)
3. **Redis** (for job queues)

## Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your settings
nano .env
```

## Environment Variables

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/pricewise

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Scraper Settings
SCRAPE_DELAY=5000
MAX_CONCURRENT_SCRAPES=5

# Admin API Key
ADMIN_API_KEY=your-secret-key
```

## Running the Backend

### Development Mode

```bash
# Start the server
npm run dev

# In a separate terminal, start the queue worker
npm run worker
```

### Production Mode

```bash
# Build TypeScript
npm run build

# Start server
npm start

# Start worker (separate process)
node dist/queues/worker.js
```

## API Endpoints

### Admin Endpoints

#### Trigger Scrape Job
```bash
POST /api/v1/admin/ingestion/trigger
Content-Type: application/json

{
  "url": "https://www.jumia.com.ng/product/123",
  "retailerId": "jumia",
  "priority": 1
}
```

#### Scrape Category
```bash
POST /api/v1/admin/ingestion/category
Content-Type: application/json

{
  "category": "phones",
  "retailerId": "jumia",
  "maxProducts": 10
}
```

#### Get Health Status
```bash
GET /api/v1/admin/ingestion/health
```

#### Get Price Changes
```bash
GET /api/v1/admin/ingestion/price-changes?limit=50
```

#### Get Outliers
```bash
GET /api/v1/admin/ingestion/outliers
```

### Public Endpoints

#### Get Products
```bash
GET /api/v1/products?category=phones&brand=Apple&limit=20&offset=0
```

#### Get Product by ID
```bash
GET /api/v1/products/:id
```

#### Get Price History
```bash
GET /api/v1/products/:id/price-history?retailerId=jumia
```

## How Real Scraping Works

### 1. Puppeteer (Headless Browser)
```typescript
// Launches real Chrome browser
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

// Navigates to actual website
await page.goto('https://www.jumia.com.ng/phones/');

// Waits for JavaScript to render
await page.waitForSelector('.product-card');
```

### 2. Cheerio (HTML Parsing)
```typescript
// Get rendered HTML
const html = await page.content();

// Parse with Cheerio (like jQuery)
const $ = cheerio.load(html);

// Extract product data
const title = $('h2.name').text();
const price = $('span.price').text();
```

### 3. Anti-Blocking Measures
```typescript
// Rotate User-Agent
const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
await page.setUserAgent(userAgent);

// Random delays
await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

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

### 4. Data Processing
```typescript
// Clean price string
const price = parsePrice('₦ 45,000.00'); // → 45000

// Detect stock status
const inStock = !stockText.includes('out of stock');

// Calculate discount
const discount = ((originalPrice - price) / originalPrice) * 100;
```

## Database Schema

### Product Model
```typescript
{
  name: string,
  slug: string,
  category: string,
  brand: string,
  images: string[],
  specifications: {},
  listings: [
    {
      store: { id, name, logo },
      price: number,
      originalPrice: number,
      shippingCost: number,
      totalCost: number,
      inStock: boolean,
      affiliateUrl: string,
      lastVerified: Date,
    }
  ]
}
```

### PriceHistory Model
```typescript
{
  productId: string,
  retailerId: string,
  price: number,
  timestamp: Date,
  percentageChange: number,
  isOutlier: boolean
}
```

## Queue System

### Scrape Queue
- Processes real scraping jobs
- Concurrency: 5 jobs
- Rate limit: 10 jobs/minute
- Retry: 3 attempts with exponential backoff

### Worker Process
```bash
# Start worker (separate terminal)
npm run worker

# Or in production
node dist/queues/worker.js
```

## Connecting Frontend to Backend

### Update Frontend API Calls

In your React app, create an API service:

```typescript
// src/services/api.ts
const API_BASE_URL = 'http://localhost:5000/api/v1';

export const api = {
  // Get products
  getProducts: async (params?: any) => {
    const response = await fetch(`${API_BASE_URL}/products?${new URLSearchParams(params)}`);
    return response.json();
  },

  // Get product by ID
  getProduct: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    return response.json();
  },

  // Trigger scrape (admin)
  triggerScrape: async (url: string, retailerId: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/ingestion/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, retailerId }),
    });
    return response.json();
  },

  // Get health status (admin)
  getHealth: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/ingestion/health`);
    return response.json();
  },
};
```

## Deployment

### Option 1: VPS (DigitalOcean, AWS EC2)
```bash
# Install dependencies
sudo apt update
sudo apt install nodejs npm mongodb redis-server

# Clone repository
git clone <your-repo>
cd backend

# Install packages
npm install

# Setup PM2 for process management
npm install -g pm2

# Start with PM2
pm2 start npm --name "pricewise-api" -- start
pm2 start npm --name "pricewise-worker" -- run worker

# Save PM2 configuration
pm2 save
pm2 startup
```

### Option 2: Docker
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t pricewise-backend .
docker run -p 5000:5000 pricewise-backend
```

### Option 3: Railway/Render/Heroku
```bash
# Push to GitHub
git push origin main

# Connect to Railway/Render
# Set environment variables in dashboard
# Deploy!
```

## Production Considerations

### 1. Proxy Rotation
For large-scale scraping, use proxy services:
```typescript
const proxy = 'http://user:pass@proxy-server:port';
await page.goto(url, {
  // Use proxy
});
```

Recommended proxy services:
- Bright Data
- Oxylabs
- Smartproxy

### 2. CAPTCHA Solving
For sites with CAPTCHA:
- 2Captcha API
- Anti-Captcha
- hCaptcha solver

### 3. Rate Limiting
```typescript
// Respect robots.txt
// Add delays between requests
// Limit concurrent scrapes per domain
```

### 4. Monitoring
```bash
# Use Winston for logging
# Set up error tracking (Sentry)
# Monitor queue health
# Track scraper success rates
```

## Troubleshooting

### Puppeteer Issues
```bash
# Install Chrome dependencies (Ubuntu/Debian)
sudo apt-get install -y \
  gconf-service \
  libasound2 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgcc1 \
  libgconf-2-4 \
  libgdk-pixbuf2.0-0 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  ca-certificates \
  fonts-liberation \
  libappindicator1 \
  libnss3 \
  lsb-release \
  xdg-utils \
  wget
```

### MongoDB Connection Issues
```bash
# Check MongoDB is running
sudo systemctl status mongodb

# Restart MongoDB
sudo systemctl restart mongodb
```

### Redis Connection Issues
```bash
# Check Redis is running
sudo systemctl status redis

# Restart Redis
sudo systemctl restart redis
```

## Legal & Ethical Considerations

1. **Respect robots.txt** - Check before scraping
2. **Rate limiting** - Don't overwhelm servers
3. **Terms of Service** - Review merchant ToS
4. **Data privacy** - Don't store personal data
5. **Attribution** - Credit data sources

## Next Steps

1. ✅ Backend server with Express
2. ✅ Real Puppeteer scraper
3. ✅ MongoDB database models
4. ✅ BullMQ job queues
5. ✅ REST API endpoints
6. ⏳ Add more retailer scrapers (Konga, Amazon, etc.)
7. ⏳ Implement proxy rotation
8. ⏳ Add CAPTCHA solving
9. ⏳ Set up monitoring & alerts
10. ⏳ Deploy to production

## Support

For issues or questions:
- Check logs: `pm2 logs pricewise-api`
- Review documentation
- Open GitHub issue

---

**Status**: ✅ Production-ready backend with real web scraping
