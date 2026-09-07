import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminService } from '../../services/apiService'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

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

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981']

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

  // Recharts Data Prep
  const pipelineData = [
    { name: 'Applied', count: s.totalApplications ?? 0, fill: '#94a3b8' },
    { name: 'Shortlisted', count: s.totalShortlisted ?? 0, fill: '#818cf8' },
    { name: 'Offered', count: s.totalOffered ?? 0, fill: '#fbbf24' },
    { name: 'Placed', count: s.totalPlaced ?? 0, fill: '#10b981' }
  ]

  const ratesData = [
    { name: 'Placement Rate', value: s.placementRate ?? 0 },
    { name: 'Offer Rate', value: s.offerRate ?? 0 },
    { name: 'Shortlist Rate', value: s.totalApplications > 0 ? Math.round((s.totalShortlisted / s.totalApplications) * 100) : 0 },
    { name: 'Other', value: 100 - Math.max(s.placementRate ?? 0, s.offerRate ?? 0) }
  ]

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="👥" label="Total Users"        value={s.totalUsers ?? 0}        color="text-primary"       bg="bg-primary-100" />
          <StatCard icon="📋" label="Active Jobs"        value={s.activeJobs ?? 0}         color="text-accent"        bg="bg-emerald-100" />
          <StatCard icon="📄" label="Applications"       value={s.totalApplications ?? 0} color="text-primary-light"  bg="bg-indigo-100" />
          <StatCard icon="🎯" label="Students Placed"    value={s.totalPlaced ?? 0}        color="text-accent"        bg="bg-emerald-100" />
        </div>
      </div>

      {/* Package & Match stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card text-center flex flex-col justify-center">
            <p className="text-3xl font-bold font-mono text-accent">{s.highestPackage ?? 'N/A'}</p>
            <p className="text-xs font-medium text-slate-500 mt-1">Highest Package</p>
          </div>
          <div className="card text-center flex flex-col justify-center">
            <p className="text-3xl font-bold font-mono text-primary">{s.averagePackage ?? 'N/A'}</p>
            <p className="text-xs font-medium text-slate-500 mt-1">Average Package</p>
          </div>
          <div className="card text-center flex flex-col justify-center">
            <p className="text-3xl font-bold font-mono text-primary-light">{s.avgSkillMatchScore ?? 0}%</p>
            <p className="text-xs font-medium text-slate-500 mt-1">Avg Skill Match Score</p>
          </div>
      </div>

      {/* Charts / Recharts visualisations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Application Funnel Chart */}
        <div className="card-md">
          <h2 className="text-h3 pb-2 border-b border-slate-100 mb-4">Application Pipeline</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rates Chart */}
        <div className="card-md">
          <h2 className="text-h3 pb-2 border-b border-slate-100 mb-4">Conversion Rates</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ratesData.slice(0, 3)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({name, value}) => `${name} (${value}%)`}
                  labelLine={false}
                >
                  {ratesData.slice(0, 3).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
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
