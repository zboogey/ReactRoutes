import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  ['/', 'Home'],
  ['/products', 'Products'],
  ['/dashboard', 'Dashboard'],
  ['/about', 'About'],
]

export default function NavBar() {
  const { user, loading, logout } = useAuth()

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="logo">shop.</Link>
        <nav>
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>
          ))}
          {!loading && (user ? (
            <>
              <NavLink to="/profile">Profile</NavLink>
              <button className="link" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/signup">Signup</NavLink>
            </>
          ))}
        </nav>
      </div>
    </header>
  )
}
