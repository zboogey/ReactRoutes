import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import Home from './pages/Home'
import About from './pages/About'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import Status from './components/Status'
import { GuestRoute, ProtectedRoute } from './routes/ProtectedRoute'

const Products = lazy(() => import('./pages/Products'))
const ProductDetails = lazy(() => import('./pages/ProductDetails'))
const Dashboard = lazy(() => import('./pages/Dashboard'))

export default function App() {
  return (
    <Suspense fallback={<Status>Loading page…</Status>}>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="products">
            <Route index element={<Products />} />
            <Route path=":id" element={<ProductDetails />} />
          </Route>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="signup" element={<GuestRoute><Signup /></GuestRoute>} />
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
