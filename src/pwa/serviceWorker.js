// Registers /sw.js (production builds only) and tracks a waiting update for <UpdateBanner />.

let waitingWorker = null
const listeners = new Set()

function setWaiting(worker) {
  waitingWorker = worker
  listeners.forEach((listener) => listener())
}

export const updateStore = {
  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot: () => waitingWorker,
}

// Activates the waiting service worker; the page reloads once it takes control.
export function applyUpdate() {
  waitingWorker?.postMessage({ type: 'SKIP_WAITING' })
}

export function dismissUpdate() {
  setWaiting(null)
}

export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return

  // When a new worker takes over a page that was already controlled, reload so the page
  // runs the new version's JS/CSS (this also updates other open tabs).
  const hadController = Boolean(navigator.serviceWorker.controller)
  let reloading = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return
    reloading = true
    window.location.reload()
  })

  const register = async () => {
    try {
      // updateViaCache: 'none' → the browser never uses the HTTP cache when checking sw.js for updates
      const registration = await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })

      const track = (worker) => {
        worker?.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) setWaiting(worker)
        })
      }

      if (registration.waiting && navigator.serviceWorker.controller) setWaiting(registration.waiting)
      track(registration.installing)
      registration.addEventListener('updatefound', () => track(registration.installing))

      // Look for new versions periodically and whenever the app comes back to the foreground
      const check = () => registration.update().catch(() => {})
      setInterval(check, 60 * 60 * 1000)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check()
      })
      window.addEventListener('online', check)
    } catch (err) {
      console.error('Service worker registration failed:', err)
    }
  }

  if (document.readyState === 'complete') register()
  else window.addEventListener('load', register)
}

// Real connectivity check: "ping" requests are ignored by the service worker, so this hits the network.
export async function checkConnection() {
  try {
    const res = await fetch(`/manifest.json?ping=${Date.now()}`, { cache: 'no-store' })
    return res.ok
  } catch {
    return false
  }
}
