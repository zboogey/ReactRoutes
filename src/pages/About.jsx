export default function About() {
  return (
    <section className="narrow">
      <h1>About</h1>
      <p>
        This project is a React homework on routing and application
        architecture. Data comes from the DummyJSON products API.
      </p>
      <ul className="list">
        <li>React Router with nested routes and a shared layout</li>
        <li>Search, filters, sorting and pagination synced with the URL</li>
        <li>Dynamic product pages with <code>useParams</code></li>
        <li>Dashboard with statistics calculated from API data</li>
        <li>Lazy-loaded pages with <code>React.lazy</code> and <code>Suspense</code></li>
        <li>Firebase Authentication (email/password and Google)</li>
        <li>Server data caching with TanStack Query</li>
      </ul>
    </section>
  )
}
