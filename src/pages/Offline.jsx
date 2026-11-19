import { useLocation, useNavigate } from 'react-router-dom'
import OfflineScreen from '../components/OfflineScreen'

export default function Offline() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'
  return <OfflineScreen onReconnect={() => navigate(from, { replace: true })} />
}
