# HW6 — Server Data, Caching & Firebase Authentication

React shop built with React Router, TanStack Query, Firebase Auth and the [DummyJSON](https://dummyjson.com) products API.

Live demo: _add deployed link here_

## Setup
```bash
npm install
cp .env.example .env.local
npm run dev
```
Fill `.env.local` with your Firebase web app config. In Firebase Console → Authentication enable **Email/Password** and **Google**, and add your deploy domain to **Authorized domains**.

## Routes
| Route | Page |
|---|---|
| `/` | Home |
| `/about` | About |
| `/products` | Products list (search, filters, sort, pagination in URL) |
| `/products/:id` | Product details + delete |
| `/dashboard` | Dashboard |
| `/login` | Email/password login + Google sign-in (guests only) |
| `/signup` | Email, password, confirm password with validation (guests only) |
| `/profile` | Protected: email, UID, logout |
| `*` | 404 |

Unauthenticated users opening `/profile` are redirected to `/login` and sent back after login. The NavBar shows Login/Signup or Profile/Logout depending on auth state.

## Authentication
- `src/firebase.js` initializes Firebase from `VITE_` env variables and sets `browserLocalPersistence`, so the session survives a refresh.
- `src/services/authService.js` wraps signup, login, Google sign-in, logout, `onAuthStateChanged` and error messages.
- `src/context/AuthContext.jsx` exposes `AuthProvider` and `useAuth()` with `user`, `loading`, `error` and the auth actions.
- `src/routes/ProtectedRoute.jsx` contains `ProtectedRoute` and `GuestRoute`.

## Caching strategy
Server data is cached with TanStack Query (`src/hooks/useProducts.js`).

- Query keys: `['products']` for the product list (used by Products and Dashboard), `['products', id]` for a single product.
- `staleTime` is 5 minutes: cached data is served instantly and not refetched during that time. After that it is revalidated in the background on mount or window focus.
- `gcTime` is 10 minutes: unused cache entries are removed after that.
- Invalidation: after a product is deleted (`useDeleteProduct`), every query starting with `['products']` is invalidated, so the list, dashboard and details are refetched. DummyJSON only simulates writes, so the deleted product reappears after the refetch.
- Outdated requests: TanStack Query passes an `AbortSignal` to the fetch functions and stores results per query key, so an older response can never overwrite a newer one.
- Loading, error and empty states are handled on Products, Product details and Dashboard.

## Structure
```
src/
  firebase.js            Firebase init
  context/AuthContext.jsx
  routes/ProtectedRoute.jsx
  services/service.js    API requests
  services/authService.js
  hooks/useProducts.js   TanStack Query hooks
  layouts/  components/  pages/  styles/
```

## Deploy
Vercel: import the repo, add the `VITE_FIREBASE_*` variables in project settings (uses `vercel.json` for SPA rewrites).
Netlify: build `npm run build`, publish `dist`, add the same env variables (uses `public/_redirects`).
