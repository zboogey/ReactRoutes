import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { registerServiceWorker } from './pwa/serviceWorker'
import App from './App'
import './styles/index.css'

const NO_RETRY = ['OFFLINE', 'NOT_FOUND']

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: true,
      // refetch everything when the connection comes back (data served from cache is replaced)
      refetchOnReconnect: 'always',
      // 'offlineFirst' still calls fetch while offline, so the service worker can answer from cache
      networkMode: 'offlineFirst',
      retry: (count, err) => !NO_RETRY.includes(err.message) && count < 2,
    },
    mutations: { networkMode: 'offlineFirst' },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
)

registerServiceWorker()
