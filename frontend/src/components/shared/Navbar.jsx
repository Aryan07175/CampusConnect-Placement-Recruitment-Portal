import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, logout, isStudent, isRecruiter, isAdmin } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setMenuOpen(false)
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
        { to: '/admin/jobs',           label: 'Job Queue' },
      ]
    : []

  const linkClass = (to) =>
    `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
      pathname === to
        ? 'bg-white/20 text-white'
        : pathname.startsWith(to + '/') && to.split('/').length > 2
        ? 'bg-white/20 text-white'
        : 'text-white/80 hover:text-white hover:bg-white/10'
    }`

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

          {/* Desktop nav links */}
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} className={linkClass(link.to)}>
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* User menu (desktop) + hamburger (mobile) */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-white/80 text-sm hidden sm:block">
                  {user.firstName} {user.lastName}
                </span>
                <button onClick={handleLogout} className="btn-secondary text-xs px-3 py-1.5
                  bg-white/10 border-white/30 text-white hover:bg-white/20 hidden md:inline-flex">
                  Sign out
                </button>
                {/* B-04 FIX: mobile hamburger button */}
                <button
                  onClick={() => setMenuOpen(o => !o)}
                  className="md:hidden p-2 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Toggle menu"
                >
                  {menuOpen ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
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

      {/* B-04 FIX: mobile dropdown menu */}
      {user && menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-primary px-4 pb-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === link.to
                  ? 'bg-white/20 text-white'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
