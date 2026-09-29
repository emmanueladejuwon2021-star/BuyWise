# Host BuyWise on GitHub Pages

GitHub Pages can host the front of the site (the pages people see).
It cannot run the back end (MongoDB, Redis, scraping, or Paystack).
Search and live prices will stay empty until that back end lives on another host.

## Live address

https://emmanueladejuwon2021-star.github.io/BuyWise/

## One-time switch in GitHub

1. Open https://github.com/emmanueladejuwon2021-star/BuyWise/settings/pages
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. Save
4. Open https://github.com/emmanueladejuwon2021-star/BuyWise/actions and wait for **Deploy GitHub Pages** to finish

After that, every push to `main` rebuilds the site.

## What this repo now does

- Builds the React site with the `/BuyWise/` path GitHub Pages needs
- Copies `index.html` to `404.html` so React routes still open
- Publishes the `dist` folder with GitHub Actions

## What you still need later

Put the Node back end on Render, Railway, or a VPS, then point the front end at that address.
