import { Link } from 'react-router-dom'

export default function Card({ product }) {
  return (
    <Link to={`/products/${product.id}`} className="card">
      <img src={product.thumbnail} alt={product.title} loading="lazy" />
      <div className="card-body">
        <span className="muted">{product.category}</span>
        <h3>{product.title}</h3>
        <div className="row">
          <strong>${product.price}</strong>
          <span className="muted">★ {product.rating}</span>
        </div>
      </div>
    </Link>
  )
}
