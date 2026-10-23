import { useEffect, useState, useCallback } from 'react'
import { adminService } from '../../services/apiService'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import EmptyState from '../../components/shared/EmptyState'

export default function AdminJobsPage() {
  const [jobs, setJobs]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [approving, setApproving] = useState(null)
  const [error, setError]       = useState('')

  // BUG-27 FIX: previously no frontend page existed to approve job postings.
  const load = useCallback(() => {
    adminService.getPendingJobs({ size: 50, sort: 'createdAt,asc' })
      .then(r => setJobs(r.data.content ?? []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const approve = async (id) => {
    setApproving(id)
    setError('')
    try {
      await adminService.approveJob(id)
      setJobs(prev => prev.filter(j => j.id !== id))
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to approve job.')
    } finally { setApproving(null) }
  }

  if (loading) return <LoadingSpinner text="Loading pending jobs…" />

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="text-h2">Job Approval Queue</h1>
        <p className="text-sm text-slate-500 mt-1">
          {jobs.length === 0
            ? 'All job postings are up to date.'
            : `${jobs.length} job posting${jobs.length !== 1 ? 's' : ''} awaiting approval`}
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 bg-rose-50 border border-rose-200 rounded-btn text-sm text-rose-700">{error}</div>
      )}

      {jobs.length === 0 ? (
        <EmptyState icon="✅" title="No pending jobs" description="All job postings have been reviewed." />
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job.id} className="card flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="font-semibold text-sm text-neutral-dark">{job.title}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">
                    {job.status?.replaceAll('_', ' ')}
                  </span>
                  {job.jobType && (
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{job.jobType}</span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  {job.companyName}
                  {job.location ? ` · ${job.location}` : ''}
                  {job.salaryRange ? ` · ${job.salaryRange}` : ''}
                </p>
                {job.applicationDeadline && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    Deadline: {new Date(job.applicationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
                {job.requiredSkills && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {job.requiredSkills.split(',').map(s => s.trim()).filter(Boolean).slice(0, 5).map(s => (
                      <span key={s} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{s}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => approve(job.id)}
                  disabled={approving === job.id}
                  className="btn-primary text-xs px-4 py-1.5"
                >
                  {approving === job.id ? 'Approving…' : '✓ Approve'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
