import Navbar from './Navbar.jsx'

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main className="app-shell">{children}</main>
    </>
  )
}

export default Layout
