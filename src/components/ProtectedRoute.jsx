import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

function ProtectedRoute({ children }) {
  const { user, loading, configured } = useAuth()

  if (loading) {
    return (
      <main className="app-shell">
        <p className="muted">Checking your session...</p>
      </main>
    )
  }

  if (!configured) {
    return (
      <main className="app-shell">
        <section className="card">
          <h1>Firebase is not configured</h1>
          <p className="muted">
            Add your web app keys to <code>.env</code>, then restart{' '}
            <code>npm run dev</code>.
          </p>
        </section>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
