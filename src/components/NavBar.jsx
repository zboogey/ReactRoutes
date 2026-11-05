import { NavLink, Link } from 'react-router-dom'

const links = [
  ['/', 'Home'],
  ['/products', 'Products'],
  ['/dashboard', 'Dashboard'],
  ['/about', 'About'],
  ['/login', 'Login'],
]

export default function NavBar() {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="logo">shop.</Link>
        <nav>
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
