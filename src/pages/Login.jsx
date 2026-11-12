import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, loginWithGoogle, error, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => clearError, [])

  const finish = async (promise) => {
    setBusy(true)
    const ok = await promise
    setBusy(false)
    if (ok) navigate(location.state?.from?.pathname || '/profile', { replace: true })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    finish(login(email, password))
  }

  return (
    <section className="login">
      <h1>Log in</h1>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="form-error">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Please wait…' : 'Log in'}</button>
        <button type="button" className="btn ghost" disabled={busy} onClick={() => finish(loginWithGoogle())}>
          Continue with Google
        </button>
      </form>
      <p className="muted">No account? <Link to="/signup">Sign up</Link></p>
    </section>
  )
}
