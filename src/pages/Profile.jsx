import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, logout } = useAuth()

  return (
    <section className="login">
      <h1>Profile</h1>
      <dl>
        <div><dt>Email</dt><dd>{user.email}</dd></div>
        <div><dt>UID</dt><dd>{user.uid}</dd></div>
      </dl>
      <div className="actions">
        <button className="btn" onClick={logout}>Log out</button>
      </div>
    </section>
  )
}
