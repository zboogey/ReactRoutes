# HW5 — Routing & Application Architecture

Simple React shop built with React Router and the [DummyJSON](https://dummyjson.com) products API.

## Run
```bash
npm install
npm run dev
```

## Routes
| Route | Page |
|---|---|
| `/` | Home |
| `/about` | About |
| `/products` | Products list (search, filters, sort, pagination in URL) |
| `/products/:id` | Product details |
| `/dashboard` | Dashboard |
| `/login` | Login placeholder |
| `*` | 404 |

`Products`, `ProductDetails` and `Dashboard` are lazy-loaded with `React.lazy` + `Suspense`.

## Structure
```
src/
  App.jsx            routes only
  layouts/           RootLayout (NavBar + Outlet)
  components/        NavBar, Card, Status
  pages/             Home, About, Products, ProductDetails, Dashboard, Login, NotFound
  services/service.js  API requests
  hooks/useFetch.js    fetch with loading / error / abort of stale requests
  styles/index.css
```

## Deploy
Vercel: import the repo (uses `vercel.json` for SPA rewrites).
Netlify: build `npm run build`, publish `dist` (uses `public/_redirects`).
