# Backend Architecture for Real Web Scraping

## Overview

To enable real web scraping, you need a separate Node.js backend server. This document provides the complete implementation.

## Required Backend Stack

```
Backend Server (Node.js + Express)
├── Puppeteer/Playwright (headless browser scraping)
├── Cheerio (HTML parsing)
├── BullMQ + Redis (job queues)
├── MongoDB/PostgreSQL (database)
├── Proxy rotation service (optional)
└── API endpoints for frontend integration
```

## Installation

```bash
# Create backend directory
mkdir price-comparison-backend
cd price-comparison-backend

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express cors helmet morgan
npm install puppeteer cheerio axios
npm install bullmq ioredis
npm install mongoose
npm install dotenv
npm install node-cron
npm install winston

# Development dependencies
npm install -D nodemon typescript @types/node @types/express
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── scraper.ts
│   ├── scrapers/
│   │   ├── BaseScraper.ts
│   │   ├── JumiaScraper.ts
│   │   ├── KongaScraper.ts
│   │   └── AmazonScraper.ts
│   ├── queues/
│   │   ├── scrapeQueue.ts
│   │   ├── feedQueue.ts
│   │   └── worker.ts
│   ├── models/
│   │   ├── Product.ts
│   │   ├── PriceHistory.ts
│   │   └── ScrapeJob.ts
│   ├── routes/
│   │   ├── api.ts
│   │   ├── admin.ts
│   │   └── ingestion.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── rateLimit.ts
│   ├── services/
│   │   ├── scraperService.ts
│   │   ├── productService.ts
│   │   └── priceService.ts
│   └── index.ts
├── .env
├── package.json
└── tsconfig.json
```
