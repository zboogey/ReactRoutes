import { Component } from 'react'

// Keeps the app (nav, layout) alive if a page throws, e.g. a lazy chunk fails to load.
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <section className="center">
        <h1>Something went wrong</h1>
        <p className="muted">
          {navigator.onLine ? 'This page failed to load.' : 'This page is not available offline.'}
        </p>
        <div className="actions">
          <button className="btn" onClick={() => window.location.reload()}>Reload</button>
        </div>
      </section>
    )
  }
}
