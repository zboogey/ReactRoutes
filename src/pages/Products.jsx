import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import useFetch from '../hooks/useFetch'
import { getProducts } from '../services/service'
import Card from '../components/Card'
import Status from '../components/Status'

const PER_PAGE = 12

export default function Products() {
  const [params, setParams] = useSearchParams()
  const { data, loading, error } = useFetch(getProducts, [])

  const q = params.get('q') || ''
  const category = params.get('category') || ''
  const rating = params.get('rating') || ''
  const stock = params.get('stock') || ''
  const sort = params.get('sort') || ''
  const page = Number(params.get('page')) || 1

  // update one param, reset page, drop empty values
  const update = (key, value) => {
    const next = new URLSearchParams(params)
    value ? next.set(key, value) : next.delete(key)
    if (key !== 'page') next.delete('page')
    setParams(next)
  }

  const categories = useMemo(
    () => [...new Set((data || []).map((p) => p.category))],
    [data]
  )

  const filtered = useMemo(() => {
    let list = (data || []).filter(
      (p) =>
        p.title.toLowerCase().includes(q.toLowerCase()) &&
        (!category || p.category === category) &&
        (!rating || p.rating >= Number(rating)) &&
        (!stock || p.availabilityStatus === stock)
    )
    const [field, dir] = sort.split('-')
    if (field) {
      list = [...list].sort((a, b) =>
        field === 'title'
          ? a.title.localeCompare(b.title) * (dir === 'desc' ? -1 : 1)
          : (a[field] - b[field]) * (dir === 'desc' ? -1 : 1)
      )
    }
    return list
  }, [data, q, category, rating, stock, sort])

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const current = Math.min(page, pages)
  const visible = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE)

  return (
    <section>
      <h1>Products</h1>

      <div className="filters">
        <input
          placeholder="Search…"
          value={q}
          onChange={(e) => update('q', e.target.value)}
        />
        <select value={category} onChange={(e) => update('category', e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={rating} onChange={(e) => update('rating', e.target.value)}>
          <option value="">Any rating</option>
          <option value="3">3+ ★</option>
          <option value="4">4+ ★</option>
          <option value="4.5">4.5+ ★</option>
        </select>
        <select value={stock} onChange={(e) => update('stock', e.target.value)}>
          <option value="">Any availability</option>
          <option value="In Stock">In Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>
        <select value={sort} onChange={(e) => update('sort', e.target.value)}>
          <option value="">Default order</option>
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
          <option value="rating-desc">Rating ↓</option>
          <option value="title-asc">Name A–Z</option>
        </select>
        {[...params.keys()].length > 0 && (
          <button className="btn ghost" onClick={() => setParams({})}>Reset</button>
        )}
      </div>

      {loading && <Status>Loading products…</Status>}
      {error && <Status error>Error: {error}</Status>}
      {!loading && !error && filtered.length === 0 && <Status>No products found.</Status>}

      {!loading && !error && filtered.length > 0 && (
        <>
          <p className="muted">{filtered.length} products</p>
          <div className="grid">
            {visible.map((p) => <Card key={p.id} product={p} />)}
          </div>
          <div className="pagination">
            <button className="btn ghost" disabled={current <= 1}
              onClick={() => update('page', current - 1)}>Prev</button>
            <span>{current} / {pages}</span>
            <button className="btn ghost" disabled={current >= pages}
              onClick={() => update('page', current + 1)}>Next</button>
          </div>
        </>
      )}
    </section>
  )
}
