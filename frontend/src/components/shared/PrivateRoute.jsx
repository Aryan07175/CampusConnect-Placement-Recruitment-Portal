import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function PrivateRoute({ children, allowedRole }) {
  const { isAuthenticated, role } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRole && role !== allowedRole) {
    // Redirect to their correct dashboard
    const dashMap = {
      ROLE_STUDENT:   '/student',
      ROLE_RECRUITER: '/recruiter',
      ROLE_ADMIN:     '/admin',
    }
    return <Navigate to={dashMap[role] ?? '/login'} replace />
  }

  return children
}
