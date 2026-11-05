import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="center">
      <h1 className="big">404</h1>
      <p className="muted">This page doesn’t exist.</p>
      <Link to="/" className="btn">Go home</Link>
    </section>
  )
}
