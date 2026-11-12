import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Status from '../components/Status'

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Status>Checking session…</Status>
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  return children
}

export function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Status>Checking session…</Status>
  if (user) return <Navigate to="/profile" replace />
  return children
}
