import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import NavBar from '../components/NavBar'
import Status from '../components/Status'
import UpdateBanner from '../components/UpdateBanner'
import ErrorBoundary from '../components/ErrorBoundary'
import useOnlineStatus from '../hooks/useOnlineStatus'

export default function RootLayout() {
  const online = useOnlineStatus()
  const { pathname } = useLocation()

  return (
    <>
      <NavBar />
      {!online && (
        <div className="offline-banner" role="status">
          You're offline. Pages and products you've opened before are still available.
        </div>
      )}
      <main className="container">
        <ErrorBoundary key={pathname}>
          <Suspense fallback={<Status>Loading page…</Status>}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <UpdateBanner />
    </>
  )
}
