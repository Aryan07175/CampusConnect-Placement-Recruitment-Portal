import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { studentService } from '../../services/apiService'
import StatusBadge from '../../components/shared/StatusBadge'
import MatchScoreBadge from '../../components/shared/MatchScoreBadge'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import EmptyState from '../../components/shared/EmptyState'

const STATUS_FILTERS = ['All', 'APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'OFFERED', 'PLACED', 'REJECTED']

export default function MyApplicationsPage() {
  const [apps, setApps]       = useState([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('All')
  const [page, setPage]       = useState(0)
  const PAGE_SIZE = 10

  const fetchApps = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await studentService.getApplications({ page, size: PAGE_SIZE, sort: 'appliedAt,desc' })
      setApps(data.content ?? [])
      setTotal(data.totalElements ?? 0)
    } catch { setApps([]) }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { fetchApps() }, [fetchApps])

  const filtered = filter === 'All' ? apps : apps.filter(a => a.status === filter)

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="text-h2">My Applications</h1>
        <p className="text-sm text-slate-500 mt-1">{total} application{total !== 1 ? 's' : ''} total</p>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_FILTERS.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-btn text-xs font-medium whitespace-nowrap transition-colors ${
              filter === s
                ? 'bg-primary text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-primary/40'
            }`}>
            {s === 'All' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner text="Loading applications…" /> :
       filtered.length === 0 ? (
        <EmptyState
          icon="📋"
          title={filter === 'All' ? "No applications yet" : `No ${filter.replace('_', ' ').toLowerCase()} applications`}
          description={filter === 'All' ? "You haven't applied to any jobs yet. Explore open roles to get started." : "No applications match this filter."}
          action={filter === 'All' && <Link to="/student/jobs" className="btn-primary text-sm">Browse open jobs</Link>}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(app => (
            <ApplicationRow key={app.id} app={app} />
          ))}
        </div>
      )}

      {total > PAGE_SIZE && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            className="btn-secondary text-sm disabled:opacity-40">← Prev</button>
          <span className="text-sm text-slate-500">Page {page + 1}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * PAGE_SIZE >= total}
            className="btn-secondary text-sm disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  )
}

function ApplicationRow({ app }) {
  return (
    <div className="card flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-primary font-bold text-sm">
            {app.job?.companyName?.charAt(0) ?? '?'}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-neutral-dark truncate">{app.job?.title}</p>
          <p className="text-xs text-slate-500">{app.job?.companyName}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Applied {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {app.skillMatchScore != null && (
          <MatchScoreBadge score={app.skillMatchScore} />
        )}
        <StatusBadge status={app.status} />
      </div>

      {app.recruiterNotes && app.status === 'REJECTED' && (
        <div className="w-full sm:w-auto mt-1 sm:mt-0">
          <p className="text-xs text-slate-400 italic">{app.recruiterNotes}</p>
        </div>
      )}
    </div>
  )
}
