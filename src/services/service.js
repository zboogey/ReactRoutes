const BASE_URL = 'https://dummyjson.com'

export const isOfflineError = (err) => err?.message === 'OFFLINE'

// Returns { data, cachedAt }. cachedAt is set when the service worker answered from its cache.
async function request(path, options = {}) {
  let res
  try {
    res = await fetch(BASE_URL + path, options)
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new Error('OFFLINE') // network failure without a cached copy
  }
  if (res.headers.get('X-SW-Offline')) throw new Error('OFFLINE')
  if (res.status === 404) throw new Error('NOT_FOUND')
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  const data = await res.json()
  const cachedAt = res.headers.get('X-SW-From-Cache') ? Number(res.headers.get('X-SW-Cached-At')) || null : null
  return { data, cachedAt }
}

const TECH = ['smartphones', 'laptops', 'tablets', 'mobile-accessories']
const rank = (p) => (TECH.includes(p.category) ? TECH.indexOf(p.category) : TECH.length)

export async function getProducts(signal) {
  const { data, cachedAt } = await request('/products?limit=0', { signal })
  return { items: data.products.sort((a, b) => rank(a) - rank(b)), cachedAt }
}

export async function getProductById(id, signal) {
  const { data, cachedAt } = await request(`/products/${id}`, { signal })
  return { item: data, cachedAt }
}

export async function deleteProduct(id) {
  const { data } = await request(`/products/${id}`, { method: 'DELETE' })
  return data
}
