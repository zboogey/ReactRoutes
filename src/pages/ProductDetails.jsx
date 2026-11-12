import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDeleteProduct, useProduct } from '../hooks/useProducts'
import Status from '../components/Status'

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: p, isPending: loading, error: queryError } = useProduct(id)
  const error = queryError?.message
  const remove = useDeleteProduct()

  const handleDelete = () =>
    remove.mutate(id, { onSuccess: () => navigate('/products') })

  const links = (
    <div className="actions">
      <button className="btn ghost" onClick={() => navigate(-1)}>← Back</button>
      <Link to="/products" className="btn ghost">All products</Link>
    </div>
  )

  if (loading) return <Status>Loading product…</Status>
  if (error === 'NOT_FOUND')
    return (
      <section className="center">
        <h1>Product not found</h1>
        <p className="muted">There is no product with id “{id}”.</p>
        {links}
      </section>
    )
  if (error) return <><Status error>Error: {error}</Status>{links}</>

  const details = [
    ['Brand', p.brand || '—'],
    ['Category', p.category],
    ['Price', `$${p.price}`],
    ['Discount', `${p.discountPercentage}%`],
    ['Rating', `★ ${p.rating}`],
    ['Stock', `${p.stock} (${p.availabilityStatus})`],
    ['SKU', p.sku],
    ['Warranty', p.warrantyInformation],
    ['Shipping', p.shippingInformation],
    ['Return policy', p.returnPolicy],
  ]

  return (
    <section>
      {links}
      <div className="details">
        <img src={p.images[0]} alt={p.title} />
        <div>
          <h1>{p.title}</h1>
          <p className="muted">{p.description}</p>
          <dl>
            {details.map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
          <div className="actions">
            <button className="btn ghost" onClick={handleDelete} disabled={remove.isPending}>
              {remove.isPending ? 'Deleting…' : 'Delete product'}
            </button>
          </div>
          {remove.error && <Status error>Error: {remove.error.message}</Status>}
        </div>
      </div>
    </section>
  )
}
