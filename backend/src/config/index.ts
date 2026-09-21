import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  
  // Database
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/pricewise',
  },
  
  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  
  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // Scraper
  scraper: {
    delay: parseInt(process.env.SCRAPE_DELAY || '5000', 10),
    maxConcurrent: parseInt(process.env.MAX_CONCURRENT_SCRAPES || '5', 10),
    userAgentRotation: process.env.USER_AGENT_ROTATION === 'true',
  },
  
  // Proxy
  proxy: {
    enabled: process.env.PROXY_ENABLED === 'true',
    list: process.env.PROXY_LIST ? process.env.PROXY_LIST.split(',') : [],
  },
  
  // Admin
  adminApiKey: process.env.ADMIN_API_KEY || 'default-admin-key',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
};
