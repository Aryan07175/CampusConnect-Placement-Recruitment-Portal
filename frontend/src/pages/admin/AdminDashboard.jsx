import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminService } from '../../services/apiService'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

function StatCard({ icon, label, value, sub, color = 'text-primary', bg = 'bg-primary-100' }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center shrink-0 text-xl`}>{icon}</div>
      <div>
        <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
        <p className="text-xs font-medium text-neutral-dark">{label}</p>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  )
}

function RateBar({ label, value, color }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-medium text-neutral-dark">{label}</p>
        <p className="text-xs font-mono font-bold text-slate-600">{value}%</p>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all duration-500 ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getStats()
      .then(r => setStats(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  const s = stats ?? {}

  return (
    <div className="page-container space-y-8">
      {/* Banner */}
      <div className="bg-primary rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
        <p className="text-white/80 text-sm">CampusConnect placement management overview</p>
      </div>

      {/* Alert for pending approvals */}
      {s.pendingApprovals > 0 && (
        <div className="card border-l-4 border-l-warning flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-sm text-neutral-dark">
              ⏳ {s.pendingApprovals} recruiter account{s.pendingApprovals !== 1 ? 's' : ''} awaiting approval
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Review and approve before recruiters can post jobs.</p>
          </div>
          <Link to="/admin/recruiters" className="btn-primary text-sm shrink-0">Review</Link>
        </div>
      )}

      {/* Primary stats grid */}
      <div>
        <h2 className="text-h3 mb-4">Platform Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon="👥" label="Total Users"        value={s.totalUsers ?? 0}        color="text-primary"       bg="bg-primary-100" />
          <StatCard icon="📋" label="Active Jobs"        value={s.activeJobs ?? 0}         color="text-accent"        bg="bg-emerald-100"
            sub={`${s.totalJobs ?? 0} total postings`} />
          <StatCard icon="📄" label="Applications"       value={s.totalApplications ?? 0} color="text-primary-light"  bg="bg-indigo-100" />
          <StatCard icon="⭐" label="Shortlisted"        value={s.totalShortlisted ?? 0}  color="text-warning"       bg="bg-amber-100" />
          <StatCard icon="✉️"  label="Offers Made"        value={s.totalOffered ?? 0}       color="text-accent"        bg="bg-emerald-100" />
          <StatCard icon="🎯" label="Students Placed"    value={s.totalPlaced ?? 0}        color="text-accent"        bg="bg-emerald-100"
            sub="Confirmed placements" />
        </div>
      </div>

      {/* Rates & analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rate bars */}
        <div className="card-md space-y-5">
          <h2 className="text-h3 pb-2 border-b border-slate-100">Placement Analytics</h2>
          <RateBar label="Placement Rate"  value={s.placementRate ?? 0} color="bg-accent" />
          <RateBar label="Offer Rate"      value={s.offerRate ?? 0}     color="bg-primary-light" />
          <RateBar label="Shortlist Rate"
            value={s.totalApplications > 0 ? Math.round((s.totalShortlisted / s.totalApplications) * 100) : 0}
            color="bg-warning" />

          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold font-mono text-primary">{s.avgSkillMatchScore ?? 0}%</p>
              <p className="text-xs text-slate-500 mt-0.5">Avg Skill Match Score</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold font-mono text-accent">{s.uniqueStudentsPlacedOrOffered ?? 0}</p>
              <p className="text-xs text-slate-500 mt-0.5">Unique Students with Offers</p>
            </div>
          </div>
        </div>

        {/* Pipeline funnel */}
        <div className="card-md">
          <h2 className="text-h3 pb-2 border-b border-slate-100 mb-4">Application Pipeline</h2>
          {[
            { label: 'Applied',      count: s.totalApplications ?? 0, color: 'bg-slate-200' },
            { label: 'Shortlisted',  count: s.totalShortlisted ?? 0,  color: 'bg-indigo-400' },
            { label: 'Offered',      count: s.totalOffered ?? 0,      color: 'bg-amber-400' },
            { label: 'Placed',       count: s.totalPlaced ?? 0,       color: 'bg-emerald-500' },
          ].map(({ label, count, color }) => {
            const pct = (s.totalApplications ?? 0) > 0
              ? Math.max(4, Math.round((count / s.totalApplications) * 100))
              : 4
            return (
              <div key={label} className="flex items-center gap-3 mb-3">
                <p className="text-xs text-slate-500 w-20 shrink-0">{label}</p>
                <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
                  <div className={`${color} h-6 rounded-full flex items-center pl-2 transition-all duration-500`}
                       style={{ width: `${pct}%` }}>
                    <span className="text-xs font-bold text-white font-mono">{count}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick nav */}
      <div>
        <h2 className="text-h3 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/admin/users" className="card hover:shadow-card-md transition-all flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-xl">👥</div>
            <div>
              <p className="font-semibold text-sm text-neutral-dark">User Management</p>
              <p className="text-xs text-slate-500">Enable, disable, or remove user accounts</p>
            </div>
            <span className="ml-auto text-slate-300">→</span>
          </Link>
          <Link to="/admin/recruiters" className="card hover:shadow-card-md transition-all flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-xl">🏢</div>
            <div>
              <p className="font-semibold text-sm text-neutral-dark">Recruiter Approvals</p>
              <p className="text-xs text-slate-500">Approve companies to post job listings</p>
              {s.pendingApprovals > 0 && (
                <span className="text-xs font-semibold text-warning">{s.pendingApprovals} pending</span>
              )}
            </div>
            <span className="ml-auto text-slate-300">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
