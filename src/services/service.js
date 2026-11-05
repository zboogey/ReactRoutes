const BASE_URL = 'https://dummyjson.com'

async function request(path, signal) {
  const res = await fetch(BASE_URL + path, { signal })
  if (res.status === 404) throw new Error('NOT_FOUND')
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json()
}

// tech categories are shown first by default
const TECH = ['smartphones', 'laptops', 'tablets', 'mobile-accessories']
const rank = (p) => (TECH.includes(p.category) ? TECH.indexOf(p.category) : TECH.length)

export async function getProducts(signal) {
  const data = await request('/products?limit=0', signal)
  return data.products.sort((a, b) => rank(a) - rank(b))
}

export function getProductById(id, signal) {
  return request(`/products/${id}`, signal)
}
