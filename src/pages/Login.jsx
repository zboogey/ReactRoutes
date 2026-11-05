export default function Login() {
  return (
    <section className="login">
      <h1>Log in</h1>
      <p className="muted">Authentication is coming soon.</p>
      <form onSubmit={(e) => e.preventDefault()}>
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button className="btn" disabled>Log in</button>
      </form>
    </section>
  )
}
