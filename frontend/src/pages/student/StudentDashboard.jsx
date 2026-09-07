import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { studentService } from '../../services/apiService'
import StatusBadge from '../../components/shared/StatusBadge'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

const ROUND_LABELS = {
  SCREENING: 'Screening', TECHNICAL_1: 'Technical Round 1',
  TECHNICAL_2: 'Technical Round 2', HR: 'HR Round',
  MANAGERIAL: 'Managerial Round', FINAL: 'Final Round',
}
const MODE_ICONS = { ONLINE: '💻', OFFLINE: '🏢', PHONE: '📞' }

export default function StudentDashboard() {
  const { user } = useAuth()
  const [profile, setProfile]       = useState(null)
  const [apps, setApps]             = useState([])
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    Promise.allSettled([
      studentService.getProfile(),
      studentService.getApplications({ size: 5, sort: 'appliedAt,desc' }),
      studentService.getUpcomingInterviews(),
    ]).then(([prof, appsRes, ivRes]) => {
      if (prof.status === 'fulfilled')   setProfile(prof.value.data)
      if (appsRes.status === 'fulfilled') setApps(appsRes.value.data.content ?? [])
      if (ivRes.status === 'fulfilled')  setInterviews(ivRes.value.data ?? [])
      setLoading(false)
    })
  }, [])

  if (loading) return <LoadingSpinner text="Loading your dashboard…" />

  const completionPct = profile ? [
    profile.college, profile.degree, profile.branch,
    profile.skills, profile.resumePath
  ].filter(Boolean).length * 20 : 0

  return (
    <div className="page-container space-y-8">
      {/* Welcome banner */}
      <div className="bg-primary rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            Welcome back, {user.firstName}.
          </h1>
          <p className="text-white/80 text-sm">Where Talent Meets Opportunity</p>
        </div>
        <Link to="/student/jobs"
          className="bg-white text-primary font-semibold text-sm px-4 py-2 rounded-btn hover:bg-primary-50 transition-colors">
          Browse Jobs →
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Applications', value: apps.length, icon: '📄' },
          { label: 'Profile',      value: `${completionPct}%`, icon: '👤', sub: 'complete' },
          { label: 'Shortlisted',  value: apps.filter(a => a.status === 'SHORTLISTED').length, icon: '⭐' },
          { label: 'Interviews',   value: interviews.length, icon: '📅' },
        ].map(({ label, value, icon, sub }) => (
          <div key={label} className="card text-center">
            <div className="text-2xl mb-1">{icon}</div>
            <p className="text-2xl font-bold text-primary font-mono">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}{sub ? ` ${sub}` : ''}</p>
          </div>
        ))}
      </div>

      {/* Profile completion */}
      {completionPct < 100 && (
        <div className="card border-l-4 border-l-warning">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold text-sm text-neutral-dark">Complete your profile</p>
            <span className="text-xs font-mono text-warning font-semibold">{completionPct}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="bg-warning h-2 rounded-full transition-all" style={{ width: `${completionPct}%` }} />
          </div>
          <p className="text-xs text-slate-500 mt-2">A complete profile improves your skill-match score with recruiters.</p>
          <Link to="/student/profile" className="btn-secondary mt-3 text-xs inline-block">
            Update Profile
          </Link>
        </div>
      )}

      {/* Upcoming Interviews (Phase 3) */}
      {interviews.length > 0 && (
        <div>
          <h2 className="text-h3 font-semibold text-neutral-dark mb-4">📅 Upcoming Interviews</h2>
          <div className="space-y-3">
            {interviews.map(iv => (
              <div key={iv.interviewId} className="card border-l-4 border-l-primary flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-neutral-dark">{iv.jobTitle}</span>
                    <span className="text-xs bg-primary-100 text-primary px-2 py-0.5 rounded-full font-medium">
                      {ROUND_LABELS[iv.round] ?? iv.round}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{iv.companyName}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {MODE_ICONS[iv.mode]} {new Date(iv.scheduledAt).toLocaleString('en-IN', {
                      weekday: 'short', day: 'numeric', month: 'short',
                      hour: '2-digit', minute: '2-digit',
                    })}
                    {iv.durationMinutes ? ` · ${iv.durationMinutes} min` : ''}
                  </p>
                  {iv.meetingLink && (
                    <a href={iv.meetingLink} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline mt-1 inline-block">
                      Join meeting →
                    </a>
                  )}
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium shrink-0">
                  SCHEDULED
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent applications */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h3 font-semibold text-neutral-dark">Recent Applications</h2>
          <Link to="/student/applications" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        {apps.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-slate-500 text-sm">You haven't applied to any jobs yet. Explore open roles below.</p>
            <Link to="/student/jobs" className="btn-primary mt-4 inline-block text-sm">Browse open jobs</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {apps.map((app) => (
              <div key={app.id} className="card flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-neutral-dark truncate">
                    {app.job?.title ?? 'Job'}
                  </p>
                  <p className="text-xs text-slate-500">{app.job?.companyName}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {app.skillMatchScore != null && (
                    <span className="text-xs font-mono font-semibold text-slate-500">
                      {app.skillMatchScore}% match
                    </span>
                  )}
                  <StatusBadge status={app.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
