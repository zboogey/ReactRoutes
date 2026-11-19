/* eslint-disable no-restricted-globals */
/*
 * Service worker (hand-written, no Workbox).
 * This file is a template: the `serviceWorker()` plugin in vite.config.js fills in VERSION
 * (a hash of the build) and PRECACHE_URLS (all built files) and emits it as /sw.js.
 *
 * Caches
 *   shop-precache-<version>  app shell: index.html, built JS/CSS, icons, manifest, offline page
 *   shop-api-v1              network-first, public DummyJSON product requests (max entries + max age)
 *   shop-static-v1           cache-first, images / icons / fonts (max entries)
 *   shop-pages-v1            paths the user has visited, so they can be reopened offline
 *
 * Never cached: non-GET requests, Firebase / Google auth requests, anything not listed above.
 */

const VERSION = '__BUILD_VERSION__'
const PRECACHE_URLS = self.__PRECACHE_MANIFEST

const PREFIX = 'shop-'
const PRECACHE = `${PREFIX}precache-${VERSION}`
const API_CACHE = `${PREFIX}api-v1`
const STATIC_CACHE = `${PREFIX}static-v1`
const PAGES_CACHE = `${PREFIX}pages-v1`
const CURRENT_CACHES = [PRECACHE, API_CACHE, STATIC_CACHE, PAGES_CACHE]

const API_ORIGIN = 'https://dummyjson.com'
const API_MAX_ENTRIES = 60
const API_MAX_AGE = 7 * 24 * 60 * 60 * 1000 // 7 days
const STATIC_MAX_ENTRIES = 150
const PAGES_MAX_ENTRIES = 50
const NETWORK_TIMEOUT = 4000

const SHELL_URL = '/index.html'
const OFFLINE_URL = '/offline.html'

/* ---------- lifecycle ---------- */

self.addEventListener('install', (event) => {
  // Pre-cache the app shell. `cache: 'reload'` skips the HTTP cache so we always store fresh files.
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS.map((url) => new Request(url, { cache: 'reload' }))))
  )
  // No skipWaiting() here: a new version waits until the user clicks "Update" in the app.
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Remove caches from older versions
      const keys = await caches.keys()
      await Promise.all(
        keys.filter((key) => key.startsWith(PREFIX) && !CURRENT_CACHES.includes(key)).map((key) => caches.delete(key))
      )
      // Remember the start page and the pages open right now, so they work offline later
      const pages = await caches.open(PAGES_CACHE)
      const windows = await self.clients.matchAll({ type: 'window' })
      const paths = new Set(['/', ...windows.map((c) => new URL(c.url).pathname)])
      await Promise.all([...paths].map((path) => pages.put(path, visitedMarker())))
      await self.clients.claim()
    })()
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
  if (event.data?.type === 'GET_VERSION') event.ports[0]?.postMessage(VERSION)
})

/* ---------- routing ---------- */

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return // POST/DELETE, auth calls etc. go straight to the network

  const url = new URL(request.url)
  if (url.searchParams.has('ping')) return // connectivity checks must really hit the network

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(event, url))
    return
  }

  if (url.origin === API_ORIGIN && url.pathname.startsWith('/products')) {
    event.respondWith(networkFirst(event, request))
    return
  }

  if (url.origin === self.location.origin) {
    event.respondWith(sameOrigin(request, url))
    return
  }

  if (isStaticAsset(request, url)) {
    event.respondWith(cacheFirst(request))
  }
  // Everything else (Firebase Auth, Google APIs, tokens…) is not handled → plain network, never cached.
})

function isStaticAsset(request, url) {
  return (
    ['image', 'font'].includes(request.destination) ||
    /\.(png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|otf)$/i.test(url.pathname)
  )
}

/* ---------- strategies ---------- */

// Same-origin files: precache first (app shell), then cache-first for images/fonts, else network.
async function sameOrigin(request, url) {
  const precached = await caches.match(request, { cacheName: PRECACHE, ignoreVary: true })
  if (precached) return precached
  if (isStaticAsset(request, url)) return cacheFirst(request)
  try {
    return await fetch(request)
  } catch {
    return new Response('', { status: 504, statusText: 'Offline' })
  }
}

// Cache-first: images, icons, fonts. Limited by number of entries.
async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE)
  const cached = await cache.match(request, { ignoreVary: true })
  if (cached) return cached
  try {
    const response = await fetch(request)
    // opaque = cross-origin <img> without CORS; still fine to cache for display
    if (response.ok || response.type === 'opaque') {
      await cache.put(request, response.clone())
      trimCache(STATIC_CACHE, STATIC_MAX_ENTRIES)
    }
    return response
  } catch {
    if (request.destination === 'image') return imagePlaceholder()
    return new Response('', { status: 504, statusText: 'Offline' })
  }
}

// Network-first: public API. Fresh data when online, cached copy when offline or the network is too slow.
async function networkFirst(event, request) {
  const cache = await caches.open(API_CACHE)

  const network = fetch(request).then(async (response) => {
    if (response.ok) {
      await cache.put(request, await stamp(response.clone()))
      await trimCache(API_CACHE, API_MAX_ENTRIES)
    }
    return response
  })
  event.waitUntil(network.catch(() => {})) // let the cache update finish even if we answer from cache

  try {
    return await Promise.race([network, timeout(NETWORK_TIMEOUT)])
  } catch {
    const cached = await cache.match(request, { ignoreVary: true })
    if (cached && !isExpired(cached)) return markFromCache(cached)
    if (cached) await cache.delete(request)
    try {
      return await network // slow network and nothing cached: keep waiting
    } catch {
      return offlineApiResponse()
    }
  }
}

// Navigations: network-first. Offline → app shell for pages visited before, otherwise offline page.
async function handleNavigation(event, url) {
  const pages = await caches.open(PAGES_CACHE)

  const network = fetch(event.request).then(async (response) => {
    if (response.ok) {
      await pages.put(url.pathname, visitedMarker())
      await trimCache(PAGES_CACHE, PAGES_MAX_ENTRIES)
    }
    return response
  })
  event.waitUntil(network.catch(() => {}))

  try {
    return await Promise.race([network, timeout(NETWORK_TIMEOUT)])
  } catch {
    const visited = url.pathname === '/offline' || (await pages.match(url.pathname))
    if (visited) {
      // Always the shell of the *current* version, so its JS/CSS are in the precache
      const shell = await caches.match(SHELL_URL, { cacheName: PRECACHE, ignoreVary: true })
      if (shell) return shell
    }
    try {
      return await network
    } catch {
      return (
        (await caches.match(OFFLINE_URL, { cacheName: PRECACHE, ignoreVary: true })) ||
        new Response('<h1>You are offline</h1>', { headers: { 'Content-Type': 'text/html' } })
      )
    }
  }
}

/* ---------- helpers ---------- */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Expose-Headers': 'X-SW-From-Cache, X-SW-Cached-At, X-SW-Offline',
}

function timeout(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
}

function visitedMarker() {
  return new Response('visited', { headers: { 'X-SW-Visited-At': String(Date.now()) } })
}

// Copy the response and remember when it was stored (used for expiration and the UI notice)
async function stamp(response) {
  const headers = new Headers(response.headers)
  headers.set('X-SW-Cached-At', String(Date.now()))
  Object.entries(CORS_HEADERS).forEach(([k, v]) => headers.set(k, v))
  return new Response(await response.blob(), { status: response.status, statusText: response.statusText, headers })
}

function isExpired(response) {
  const cachedAt = Number(response.headers.get('X-SW-Cached-At') || 0)
  return Date.now() - cachedAt > API_MAX_AGE
}

// Tell the app this answer came from the cache, so it can show a "cached data" notice
function markFromCache(response) {
  const headers = new Headers(response.headers)
  headers.set('X-SW-From-Cache', '1')
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}

function offlineApiResponse() {
  return new Response(JSON.stringify({ message: 'You are offline and this data has not been cached yet.' }), {
    status: 503,
    statusText: 'Offline',
    headers: { 'Content-Type': 'application/json', 'X-SW-Offline': '1', ...CORS_HEADERS },
  })
}

// Oldest entries are first in cache.keys(), so drop from the front
async function trimCache(name, maxEntries) {
  const cache = await caches.open(name)
  const keys = await cache.keys()
  await Promise.all(keys.slice(0, Math.max(0, keys.length - maxEntries)).map((key) => cache.delete(key)))
}

function imagePlaceholder() {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#f6f6f6"/>' +
    '<text x="200" y="210" font-family="system-ui,sans-serif" font-size="22" fill="#999" text-anchor="middle">Image unavailable offline</text></svg>'
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } })
}
