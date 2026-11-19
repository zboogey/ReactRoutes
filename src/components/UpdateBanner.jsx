import { useState, useSyncExternalStore } from 'react'
import { applyUpdate, dismissUpdate, updateStore } from '../pwa/serviceWorker'

export default function UpdateBanner() {
  const waiting = useSyncExternalStore(updateStore.subscribe, updateStore.getSnapshot)
  const [busy, setBusy] = useState(false)
  if (!waiting) return null

  return (
    <div className="toast" role="alert">
      <span>A new version of the app is available.</span>
      <div className="toast-actions">
        <button className="btn ghost" onClick={dismissUpdate}>Later</button>
        <button className="btn" disabled={busy} onClick={() => { setBusy(true); applyUpdate() }}>
          {busy ? 'Updating…' : 'Update now'}
        </button>
      </div>
    </div>
  )
}
