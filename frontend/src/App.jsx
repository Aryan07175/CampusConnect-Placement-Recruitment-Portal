import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/shared/Navbar'
import PrivateRoute from './components/shared/PrivateRoute'

// Auth pages
import LoginPage    from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Student pages
import StudentDashboard   from './pages/student/StudentDashboard'
import StudentProfilePage from './pages/student/StudentProfilePage'
import JobListPage        from './pages/student/JobListPage'
import JobDetailPage      from './pages/student/JobDetailPage'
import MyApplicationsPage from './pages/student/MyApplicationsPage'

// Recruiter pages (Phase 3 — placeholders until built)
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard'
import RecruiterJobsPage  from './pages/recruiter/RecruiterJobsPage'
import RecruiterProfilePage from './pages/recruiter/RecruiterProfilePage'
import ApplicantsPage     from './pages/recruiter/ApplicantsPage'

// Admin pages (Phase 4 — placeholders until built)
import AdminDashboard   from './pages/admin/AdminDashboard'
import AdminUsersPage   from './pages/admin/AdminUsersPage'
import AdminRecruitersPage from './pages/admin/AdminRecruitersPage'

function RootRedirect() {
  const { isAuthenticated, role } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (role === 'ROLE_STUDENT')   return <Navigate to="/student" replace />
  if (role === 'ROLE_RECRUITER') return <Navigate to="/recruiter" replace />
  if (role === 'ROLE_ADMIN')     return <Navigate to="/admin" replace />
  return <Navigate to="/login" replace />
}

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-neutral-light">
      <Navbar />
      <main>{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Root */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public auth routes */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Student routes ─────────────────────────────── */}
          <Route path="/student" element={
            <PrivateRoute allowedRole="ROLE_STUDENT">
              <Layout><StudentDashboard /></Layout>
            </PrivateRoute>
          } />
          <Route path="/student/profile" element={
            <PrivateRoute allowedRole="ROLE_STUDENT">
              <Layout><StudentProfilePage /></Layout>
            </PrivateRoute>
          } />
          <Route path="/student/jobs" element={
            <PrivateRoute allowedRole="ROLE_STUDENT">
              <Layout><JobListPage /></Layout>
            </PrivateRoute>
          } />
          <Route path="/student/jobs/:id" element={
            <PrivateRoute allowedRole="ROLE_STUDENT">
              <Layout><JobDetailPage /></Layout>
            </PrivateRoute>
          } />
          <Route path="/student/applications" element={
            <PrivateRoute allowedRole="ROLE_STUDENT">
              <Layout><MyApplicationsPage /></Layout>
            </PrivateRoute>
          } />

          {/* ── Recruiter routes ───────────────────────────── */}
          <Route path="/recruiter" element={
            <PrivateRoute allowedRole="ROLE_RECRUITER">
              <Layout><RecruiterDashboard /></Layout>
            </PrivateRoute>
          } />
          <Route path="/recruiter/jobs" element={
            <PrivateRoute allowedRole="ROLE_RECRUITER">
              <Layout><RecruiterJobsPage /></Layout>
            </PrivateRoute>
          } />
          <Route path="/recruiter/jobs/:jobId/applicants" element={
            <PrivateRoute allowedRole="ROLE_RECRUITER">
              <Layout><ApplicantsPage /></Layout>
            </PrivateRoute>
          } />
          <Route path="/recruiter/profile" element={
            <PrivateRoute allowedRole="ROLE_RECRUITER">
              <Layout><RecruiterProfilePage /></Layout>
            </PrivateRoute>
          } />

          {/* ── Admin routes ───────────────────────────────── */}
          <Route path="/admin" element={
            <PrivateRoute allowedRole="ROLE_ADMIN">
              <Layout><AdminDashboard /></Layout>
            </PrivateRoute>
          } />
          <Route path="/admin/users" element={
            <PrivateRoute allowedRole="ROLE_ADMIN">
              <Layout><AdminUsersPage /></Layout>
            </PrivateRoute>
          } />
          <Route path="/admin/recruiters" element={
            <PrivateRoute allowedRole="ROLE_ADMIN">
              <Layout><AdminRecruitersPage /></Layout>
            </PrivateRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
