import { useEffect, useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import useOnlineStatus from '../hooks/useOnlineStatus'

const links = [
  ['/', 'Home'],
  ['/products', 'Products'],
  ['/dashboard', 'Dashboard'],
  ['/about', 'About'],
]

export default function NavBar() {
  const { user, loading, logout } = useAuth()
  const online = useOnlineStatus()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  // close the mobile menu after navigating
  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="logo">shop.</Link>

        <span className={online ? 'pill online' : 'pill offline'} title={online ? 'Connected' : 'No connection'}>
          {online ? 'Online' : 'Offline'}
        </span>

        <button
          className="menu-toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="main-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <span className={open ? 'burger open' : 'burger'} aria-hidden="true" />
        </button>

        <nav id="main-nav" className={open ? 'open' : ''}>
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>
          ))}
          {!loading && (user ? (
            <>
              <NavLink to="/profile">Profile</NavLink>
              <button className="link" onClick={() => { setOpen(false); logout() }}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/signup">Signup</NavLink>
            </>
          ))}
        </nav>
      </div>
      {open && <div className="nav-backdrop" onClick={() => setOpen(false)} />}
    </header>
  )
}
