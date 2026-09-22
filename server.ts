import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper for HTTP requests with browser headers
async function fetchWithTimeout(url: string, options: any = {}, timeoutMs = 6000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,application/json,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        ...(options.headers || {})
      }
    });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// Clean price parser
function parsePrice(raw: any): number {
  if (raw === undefined || raw === null) return 0;
  if (typeof raw === 'number') return Math.round(raw);
  const str = String(raw).trim();
  if (!str) return 0;
  const match = str.match(/(?:₦|NGN|\$)?\s*([\d]{1,3}(?:,[\d]{3})*(?:\.[\d]{1,2})?|[\d]+(?:\.[\d]{1,2})?)/i);
  if (!match) return 0;
  let priceStr = match[1];
  if (priceStr.includes('.')) {
    const parts = priceStr.split('.');
    const intVal = parseInt(parts[0].replace(/[^\d]/g, ''), 10) || 0;
    const decVal = parseFloat(`0.${parts[1].replace(/[^\d]/g, '')}`) || 0;
    return Math.round(intVal + decVal);
  }
  return parseInt(priceStr.replace(/[^\d]/g, ''), 10) || 0;
}

// Scraper 1: Jumia Nigeria
async function scrapeJumia(query: string) {
  try {
    const res = await fetchWithTimeout(`https://www.jumia.com.ng/catalog/?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const html = await res.text();
    const results: any[] = [];

    const articleRegex = /<article[^>]*class="[^"]*(?:prd|c-prd)[^"]*"[^>]*>([\s\S]*?)<\/article>/gi;
    let match;
    while ((match = articleRegex.exec(html)) !== null) {
      const block = match[1];
      const nameMatch = block.match(/class="[^"]*(?:name|title)[^"]*"[^>]*>([^<]+)</i);
      const priceMatch = block.match(/class="[^"]*(?:prc|-b)[^"]*"[^>]*>([^<]+)</i);
      const oldPriceMatch = block.match(/class="[^"]*old[^"]*"[^>]*>([^<]+)</i);
      const imgMatch = block.match(/data-src="([^"]+)"/i) || block.match(/src="([^"]+)"/i);
      const hrefMatch = block.match(/href="([^"]+)"/i);

      if (nameMatch && priceMatch) {
        const title = nameMatch[1].trim();
        const price = parsePrice(priceMatch[1]);
        const origPrice = oldPriceMatch ? parsePrice(oldPriceMatch[1]) : price;
        const href = hrefMatch ? hrefMatch[1] : '';
        const productUrl = href.startsWith('http') ? href : `https://www.jumia.com.ng${href}`;

        if (title && price > 0) {
          results.push({
            title,
            price,
            originalPrice: origPrice || Math.round(price * 1.1),
            currency: '₦',
            inStock: true,
            stockLevel: 'in-stock',
            shippingCost: 0,
            deliveryDays: '2-4',
            sellerName: 'Jumia Nigeria',
            sellerRating: 4.5,
            reviewCount: 42,
            imageUrl: imgMatch ? imgMatch[1] : '',
            productUrl,
            specifications: { 'Retailer': 'Jumia Nigeria' },
          });
        }
      }
    }
    return results;
  } catch (e) {
    console.warn('[ServerScraper] Jumia error:', e);
    return [];
  }
}

// Scraper 2: Konga Online
async function scrapeKonga(query: string) {
  try {
    const res = await fetchWithTimeout(`https://catalog.konga.com/v1/search?search_term=${encodeURIComponent(query)}&limit=15`, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Origin': 'https://www.konga.com',
        'Referer': 'https://www.konga.com/',
      }
    });
    if (!res.ok) return [];
    const data = await res.json();
    const products = data?.data?.products || data?.products;
    if (!Array.isArray(products)) return [];

    return products.map((item: any) => ({
      title: item.name || item.description,
      brand: item.brand || 'Konga Retailer',
      price: Number(item.price) || Number(item.special_price) || 0,
      originalPrice: Number(item.original_price) || Number(item.price) || 0,
      currency: '₦',
      inStock: item.stock?.is_in_stock !== false && item.status === 'active',
      stockLevel: 'in-stock',
      shippingCost: 2000,
      deliveryDays: '2-3',
      sellerName: 'Konga Online',
      sellerRating: 4.4,
      reviewCount: 35,
      imageUrl: item.image_thumbnail_path 
        ? (item.image_thumbnail_path.startsWith('http') ? item.image_thumbnail_path : `https://www.konga.com/media/catalog/product${item.image_thumbnail_path}`)
        : '',
      productUrl: `https://www.konga.com/product/${item.url_key || item.sku}`,
      specifications: { 'SKU': item.sku || 'N/A', 'Store': 'Konga Online' },
    })).filter((p: any) => p.title && p.price > 0);
  } catch (e) {
    console.warn('[ServerScraper] Konga error:', e);
    return [];
  }
}

// Scraper 3: Jiji Nigeria
async function scrapeJiji(query: string) {
  try {
    const res = await fetchWithTimeout(`https://jiji.ng/api/v1/search?query=${encodeURIComponent(query)}&limit=15`, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://jiji.ng/',
      }
    });
    if (!res.ok) return [];
    const data = await res.json();
    const adverts = data?.adverts || data?.data?.adverts;
    if (!Array.isArray(adverts)) return [];

    return adverts.map((item: any) => ({
      title: item.title,
      price: item.price_obj?.value || parsePrice(item.price),
      originalPrice: item.price_obj?.value || parsePrice(item.price),
      currency: '₦',
      inStock: true,
      stockLevel: 'in-stock',
      shippingCost: 1500,
      deliveryDays: '1-2',
      sellerName: 'Jiji Nigeria',
      sellerRating: 4.6,
      reviewCount: 22,
      imageUrl: item.image || item.images?.[0]?.url || '',
      productUrl: item.guid ? `https://jiji.ng/${item.guid}.html` : 'https://jiji.ng',
      specifications: { 'Seller Region': item.region_name || 'Lagos', 'Store': 'Jiji Nigeria' },
    })).filter((p: any) => p.title && p.price > 0);
  } catch (e) {
    console.warn('[ServerScraper] Jiji error:', e);
    return [];
  }
}

// Scraper 4: Slot Systems
async function scrapeSlot(query: string) {
  try {
    const res = await fetchWithTimeout(`https://slot.ng/catalogsearch/result/?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const html = await res.text();
    const results: any[] = [];

    const linkRegex = /<a[^>]+class="[^"]*product-item-link[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1];
      const title = match[2].replace(/<[^>]+>/g, '').trim();
      const afterText = html.slice(match.index, match.index + 800);
      const priceMatch = afterText.match(/class="price"[^>]*>([^<]+)</i);

      if (title && priceMatch) {
        const price = parsePrice(priceMatch[1]);
        if (price > 0) {
          results.push({
            title,
            price,
            originalPrice: Math.round(price * 1.1),
            currency: '₦',
            inStock: true,
            stockLevel: 'in-stock',
            shippingCost: 0,
            deliveryDays: '1-2',
            sellerName: 'Slot Systems',
            sellerRating: 4.7,
            reviewCount: 52,
            imageUrl: '',
            productUrl: href,
            specifications: { 'Store': 'Slot Systems' },
          });
        }
      }
    }
    return results;
  } catch (e) {
    console.warn('[ServerScraper] Slot error:', e);
    return [];
  }
}

// Scraper 5: Kara Nigeria
async function scrapeKara(query: string) {
  try {
    const res = await fetchWithTimeout(`https://kara.com.ng/catalogsearch/result/?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const html = await res.text();
    const results: any[] = [];

    const linkRegex = /<a[^>]+class="[^"]*product-item-link[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1];
      const title = match[2].replace(/<[^>]+>/g, '').trim();
      const afterText = html.slice(match.index, match.index + 800);
      const priceMatch = afterText.match(/class="price"[^>]*>([^<]+)</i);

      if (title && priceMatch) {
        const price = parsePrice(priceMatch[1]);
        if (price > 0) {
          results.push({
            title,
            price,
            originalPrice: Math.round(price * 1.1),
            currency: '₦',
            inStock: true,
            stockLevel: 'in-stock',
            shippingCost: 1200,
            deliveryDays: '2-4',
            sellerName: 'Kara Nigeria',
            sellerRating: 4.3,
            reviewCount: 29,
            imageUrl: '',
            productUrl: href,
            specifications: { 'Store': 'Kara Nigeria' },
          });
        }
      }
    }
    return results;
  } catch (e) {
    console.warn('[ServerScraper] Kara error:', e);
    return [];
  }
}

// Multi-Store API Endpoint
app.get('/api/scrape', async (req, res) => {
  const query = (req.query.q as string || '').trim();
  if (!query) {
    return res.json({ success: true, query: '', products: [] });
  }

  try {
    const [jumia, konga, jiji, slot, kara] = await Promise.all([
      scrapeJumia(query),
      scrapeKonga(query),
      scrapeJiji(query),
      scrapeSlot(query),
      scrapeKara(query),
    ]);

    const all = [...jumia, ...konga, ...jiji, ...slot, ...kara];

    // Deduplicate by seller + title
    const unique: any[] = [];
    const seen = new Set<string>();

    all.forEach(item => {
      if (!item.title || !item.price || item.price <= 0) return;
      const key = `${item.sellerName}_${item.title.toLowerCase().trim()}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    });

    return res.json({
      success: true,
      query,
      count: unique.length,
      products: unique
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Scrape failed' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', engine: 'PriceWise Multi-Store Live Scraper v2.0' });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PriceWise Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
