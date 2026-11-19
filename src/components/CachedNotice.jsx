import useOnlineStatus from '../hooks/useOnlineStatus'

// Tells the user they are looking at saved data (from the service worker cache, or loaded earlier while online).
export default function CachedNotice({ cachedAt }) {
  const online = useOnlineStatus()
  if (!cachedAt && online) return null

  const when = cachedAt
    ? new Date(cachedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
    : null

  return (
    <p className="notice" role="status">
      {cachedAt
        ? `Showing cached data saved ${when}. It may be out of date.`
        : 'You are offline — showing data loaded earlier.'}
    </p>
  )
}
