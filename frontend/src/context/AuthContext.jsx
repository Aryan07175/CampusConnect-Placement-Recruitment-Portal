import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('cc_user')
      return u ? JSON.parse(u) : null
    } catch { return null }
  })

  const login = useCallback((userData, token) => {
    localStorage.setItem('cc_token', token)
    localStorage.setItem('cc_user', JSON.stringify(userData))
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('cc_token')
    localStorage.removeItem('cc_user')
    setUser(null)
  }, [])

  const isAuthenticated = !!user
  const role = user?.roles?.[0] ?? null   // e.g. "ROLE_STUDENT"
  const isStudent   = role === 'ROLE_STUDENT'
  const isRecruiter = role === 'ROLE_RECRUITER'
  const isAdmin     = role === 'ROLE_ADMIN'

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, role, isStudent, isRecruiter, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
