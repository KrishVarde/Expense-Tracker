import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <main className="app-shell">
        <p className="muted">Checking your session...</p>
      </main>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default PublicOnlyRoute
