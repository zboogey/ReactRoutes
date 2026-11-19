import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import Status from '../components/Status'
import CachedNotice from '../components/CachedNotice'
import OfflineScreen from '../components/OfflineScreen'

const countBy = (list, key) =>
  Object.entries(
    list.reduce((acc, p) => ({ ...acc, [p[key]]: (acc[p[key]] || 0) + 1 }), {})
  ).sort((a, b) => b[1] - a[1])

function Breakdown({ title, rows, total, link }) {
  return (
    <div className="panel">
      <h3>{title}</h3>
      {rows.map(([name, count]) => (
        <Link key={name} to={link(name)} className="bar-row">
          <span>{name}</span>
          <div className="bar"><div style={{ width: `${(count / total) * 100}%` }} /></div>
          <span className="muted">{count}</span>
        </Link>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { data, cachedAt, isPending: loading, error: queryError, refetch } = useProducts()
  // keep showing loaded data if only a background refetch failed
  const error = data ? null : queryError?.message
  const [category, setCategory] = useState('')

  const categories = useMemo(() => [...new Set((data || []).map((p) => p.category))], [data])
  const list = useMemo(
    () => (data || []).filter((p) => !category || p.category === category),
    [data, category]
  )

  if (loading) return <Status>Loading dashboard…</Status>
  if (error === 'OFFLINE') return <OfflineScreen title="Dashboard isn't available offline yet" onReconnect={refetch} />
  if (error) return <Status error>Error: {error}</Status>

  const avg = (key) => (list.reduce((s, p) => s + p[key], 0) / (list.length || 1)).toFixed(2)
  const stats = [
    ['Products', list.length],
    ['Avg. price', `$${avg('price')}`],
    ['Avg. rating', `★ ${avg('rating')}`],
    ['Total stock', list.reduce((s, p) => s + p.stock, 0)],
  ]
  const topRated = [...list].sort((a, b) => b.rating - a.rating).slice(0, 5)

  return (
    <section>
      <div className="row">
        <h1>Dashboard</h1>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <CachedNotice cachedAt={cachedAt} />

      <div className="stats">
        {stats.map(([label, value]) => (
          <div key={label} className="panel">
            <span className="muted">{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <div className="two-col">
        <Breakdown title="By category" rows={countBy(list, 'category')} total={list.length}
          link={(c) => `/products?category=${encodeURIComponent(c)}`} />
        <Breakdown title="By availability" rows={countBy(list, 'availabilityStatus')} total={list.length}
          link={(s) => `/products?stock=${encodeURIComponent(s)}${category ? `&category=${encodeURIComponent(category)}` : ''}`} />
      </div>

      <div className="panel">
        <h3>Top rated</h3>
        {topRated.map((p) => (
          <Link key={p.id} to={`/products/${p.id}`} className="bar-row">
            <span>{p.title}</span><span className="muted">★ {p.rating}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
