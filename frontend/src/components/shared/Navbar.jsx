import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, logout, isStudent, isRecruiter, isAdmin } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLinks = isStudent
    ? [
        { to: '/student',              label: 'Dashboard' },
        { to: '/student/jobs',         label: 'Browse Jobs' },
        { to: '/student/applications', label: 'Applications' },
        { to: '/student/profile',      label: 'Profile' },
      ]
    : isRecruiter
    ? [
        { to: '/recruiter',            label: 'Dashboard' },
        { to: '/recruiter/jobs',       label: 'My Jobs' },
        { to: '/recruiter/profile',    label: 'Profile' },
      ]
    : isAdmin
    ? [
        { to: '/admin',                label: 'Dashboard' },
        { to: '/admin/users',          label: 'Users' },
        { to: '/admin/recruiters',     label: 'Approvals' },
      ]
    : []

  return (
    <header className="bg-primary shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / wordmark */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">CampusConnect</span>
          </Link>

          {/* Nav links */}
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    pathname === link.to || pathname.startsWith(link.to + '/')
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* User menu */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-white/80 text-sm hidden sm:block">
                  {user.firstName} {user.lastName}
                </span>
                <button onClick={handleLogout} className="btn-secondary text-xs px-3 py-1.5
                  bg-white/10 border-white/30 text-white hover:bg-white/20">
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-secondary bg-white text-primary text-sm">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
