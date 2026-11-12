import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function validate(email, password, confirm) {
  if (!/^\S+@\S+\.\S+$/.test(email)) return 'Enter a valid email.'
  if (password.length < 6) return 'Password must be at least 6 characters.'
  if (password !== confirm) return 'Passwords do not match.'
  return null
}

export default function Signup() {
  const { signup, error, clearError } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [formError, setFormError] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => clearError, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const invalid = validate(email, password, confirm)
    setFormError(invalid)
    if (invalid) return
    setBusy(true)
    const ok = await signup(email, password)
    setBusy(false)
    if (ok) navigate('/profile', { replace: true })
  }

  return (
    <section className="login">
      <h1>Sign up</h1>
      <form onSubmit={handleSubmit} noValidate>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input type="password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        {(formError || error) && <p className="form-error">{formError || error}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Please wait…' : 'Create account'}</button>
      </form>
      <p className="muted">Already have an account? <Link to="/login">Log in</Link></p>
    </section>
  )
}
