import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminService } from '../../services/apiService'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getStats()
      .then(r => setStats(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  const cards = [
    { label: 'Total Users',    value: stats?.totalUsers       ?? 0, icon: '👥', color: 'text-primary' },
    { label: 'Active Jobs',    value: stats?.activeJobs       ?? 0, icon: '📋', color: 'text-accent' },
    { label: 'Applications',   value: stats?.totalApplications?? 0, icon: '📄', color: 'text-primary-light' },
    { label: 'Students Placed',value: stats?.totalPlaced      ?? 0, icon: '🎯', color: 'text-accent' },
    { label: 'Offers Made',    value: stats?.totalOffered     ?? 0, icon: '✉️',  color: 'text-warning' },
    { label: 'Pending Approvals', value: stats?.pendingApprovals ?? 0, icon: '⏳', color: 'text-danger' },
  ]

  return (
    <div className="page-container space-y-8">
      <div className="bg-primary rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
        <p className="text-white/80 text-sm">Manage users, approvals, and placement statistics.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {cards.map(({ label, value, icon, color }) => (
          <div key={label} className="card text-center">
            <div className="text-2xl mb-1">{icon}</div>
            <p className={`text-3xl font-bold font-mono ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {stats?.pendingApprovals > 0 && (
        <div className="card border-l-4 border-l-warning">
          <p className="font-semibold text-sm text-neutral-dark mb-1">
            {stats.pendingApprovals} recruiter{stats.pendingApprovals !== 1 ? 's' : ''} awaiting approval
          </p>
          <p className="text-xs text-slate-500 mb-3">Review and approve recruiter accounts before they can post jobs.</p>
          <Link to="/admin/recruiters" className="btn-primary text-sm inline-block">Review Approvals</Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/admin/users" className="card hover:shadow-card-md transition-all flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <span className="text-primary text-xl">👥</span>
          </div>
          <div>
            <p className="font-semibold text-sm text-neutral-dark">User Management</p>
            <p className="text-xs text-slate-500">Enable, disable, or delete user accounts</p>
          </div>
        </Link>
        <Link to="/admin/recruiters" className="card hover:shadow-card-md transition-all flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
            <span className="text-amber-600 text-xl">🏢</span>
          </div>
          <div>
            <p className="font-semibold text-sm text-neutral-dark">Recruiter Approvals</p>
            <p className="text-xs text-slate-500">Approve companies to post job listings</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
