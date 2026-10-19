import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

function Navbar() {
  const { user, logout } = useAuth()

  async function handleLogout() {
    try {
      await logout()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <p className="brand">Cloud Expense Tracker</p>
        <nav className="nav-links" aria-label="Main">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/transactions">Transactions</NavLink>
          <NavLink to="/budgets">Budgets</NavLink>
        </nav>
        <div className="navbar-user">
          <span className="muted">{user?.email}</span>
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
