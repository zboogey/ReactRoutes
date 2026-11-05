import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <section className="hero">
      <div>
        <h1>A small, simple shop.</h1>
        <p className="muted">
          Browse products from a real API, open any item for details,
          and check quick statistics on the dashboard.
        </p>
        <div className="actions">
          <Link to="/products" className="btn">Browse products</Link>
          <Link to="/dashboard" className="btn ghost">Dashboard</Link>
        </div>
      </div>
      <img
        src="https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-sofa/1.webp"
        alt="Sofa"
      />
    </section>
  )
}
