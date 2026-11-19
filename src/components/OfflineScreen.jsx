import { useState } from 'react'
import { Link } from 'react-router-dom'
import useOnlineStatus from '../hooks/useOnlineStatus'
import { checkConnection } from '../pwa/serviceWorker'

// Offline message with a "Retry connection" button. Used by the /offline page
// and by pages whose data is not available offline.
export default function OfflineScreen({
  title = "You're offline",
  message = "This content hasn't been saved for offline use yet. Pages and products you've already opened are still available.",
  onReconnect,
}) {
  const online = useOnlineStatus()
  const [state, setState] = useState('idle') // idle | checking | failed

  const retry = async () => {
    setState('checking')
    if (await checkConnection()) {
      setState('idle')
      onReconnect?.()
    } else {
      setState('failed')
    }
  }

  return (
    <section className="center offline">
      <img src="/icons/icon-192.png" alt="" className="offline-icon" />
      <h1>{title}</h1>
      <p className="muted">{message}</p>
      <span className={online ? 'pill online' : 'pill offline'}>{online ? 'Online' : 'Offline'}</span>
      <div className="actions">
        <button className="btn" onClick={retry} disabled={state === 'checking'}>
          {state === 'checking' ? 'Checking…' : 'Retry connection'}
        </button>
        <Link to="/" className="btn ghost">Go home</Link>
      </div>
      <p className="muted" role="status">
        {state === 'failed' && 'Still offline. Check your connection and try again.'}
      </p>
    </section>
  )
}
