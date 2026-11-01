import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'

// Wrap a page: signed-out visitors are sent to the login page and come back here afterwards.
export default function RequireAuth({ children, from }) {
  const { user, ready } = useAuth()
  const { pathname } = useLocation()
  if (!ready) return <div className="min-h-screen bg-ink" />
  if (!user) return <Navigate to={`/auth?next=${encodeURIComponent(pathname)}${from ? `&from=${from}` : ''}`} replace />
  return children
}
