import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { recruiterService } from '../../services/apiService'
import StatusBadge from '../../components/shared/StatusBadge'
import MatchScoreBadge from '../../components/shared/MatchScoreBadge'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import EmptyState from '../../components/shared/EmptyState'

const STATUSES = ['APPLIED','UNDER_REVIEW','SHORTLISTED','OFFERED','REJECTED','PLACED']

export default function ApplicantsPage() {
  const { jobId }     = useParams()
  const [apps, setApps]   = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  const load = () => {
    recruiterService.getApplications(jobId, { size: 50, sort: 'skillMatchScore,desc' })
      .then(r => setApps(r.data.content ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [jobId])

  const updateStatus = async (appId, status) => {
    setUpdating(appId)
    try {
      await recruiterService.updateStatus(appId, status, null)
      setApps(apps.map(a => a.id === appId ? { ...a, status } : a))
    } finally { setUpdating(null) }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="text-h2">Applicants</h1>
        <p className="text-sm text-slate-500 mt-1">{apps.length} application{apps.length !== 1 ? 's' : ''} · Sorted by skill-match score</p>
      </div>

      {apps.length === 0 ? (
        <EmptyState icon="👥" title="No applications yet" description="Applications will appear here once students apply for this job." />
      ) : (
        <div className="space-y-3">
          {apps.map(app => (
            <div key={app.id} className="card flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-neutral-dark">
                  {app.student?.firstName} {app.student?.lastName}
                </p>
                <p className="text-xs text-slate-500">{app.student?.email}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Applied {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                {app.coverLetter && (
                  <p className="text-xs text-slate-500 mt-1 italic line-clamp-2">"{app.coverLetter}"</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <MatchScoreBadge score={app.skillMatchScore} />
                <StatusBadge status={app.status} />
                <select
                  className="input !w-auto text-xs py-1 px-2"
                  value={app.status}
                  disabled={updating === app.id}
                  onChange={e => updateStatus(app.id, e.target.value)}
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
