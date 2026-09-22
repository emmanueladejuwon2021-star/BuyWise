import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { handleMultiStoreScrape } from "./src/serverScraper.js";

function multiStoreScraperPlugin() {
  return {
    name: "multi-store-scraper-plugin",
    configureServer(server) {
      server.middlewares.use("/api/scrape", async (req, res) => {
        try {
          const url = new URL(req.url, `http://${req.headers.host || "localhost:3000"}`);
          const query = url.searchParams.get("q") || "";
          
          if (!query.trim()) {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: true, products: [] }));
            return;
          }

          const products = await handleMultiStoreScrape(query);
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ success: true, count: products.length, products }));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ success: false, error: err.message, products: [] }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), multiStoreScraperPlugin()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    hmr: {
      port: 3000,
    },
  },
});
