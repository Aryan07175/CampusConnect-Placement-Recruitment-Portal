import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { studentService } from '../../services/apiService'
import MatchScoreBadge from '../../components/shared/MatchScoreBadge'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

export default function JobDetailPage() {
  const { id }        = useParams()
  const navigate      = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied]   = useState(false)
  const [error, setError]       = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    studentService.getJob(id)
      .then(r => setJob(r.data))
      .catch(() => navigate('/student/jobs'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleApply = async () => {
    setApplying(true); setError('')
    try {
      await studentService.apply(id, coverLetter || null)
      setApplied(true)
      setShowForm(false)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Application failed. Please try again.')
    } finally { setApplying(false) }
  }

  if (loading) return <LoadingSpinner text="Loading job details…" />
  if (!job) return null

  const skills = (job.requiredSkills ?? '').split(',').map(s => s.trim()).filter(Boolean)
  const isPast = job.applicationDeadline && new Date(job.applicationDeadline) < new Date()

  return (
    <div className="page-container max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-6 text-sm flex items-center gap-1">
        ← Back to jobs
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card-md">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                <span className="text-primary font-bold text-xl">{job.companyName?.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-neutral-dark leading-tight">{job.title}</h1>
                <p className="text-slate-500 text-sm mt-0.5">{job.companyName}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              {job.jobType && <span className="badge-applied">{job.jobType}</span>}
              {job.location && <span className="badge-applied">📍 {job.location}{job.remote ? ' · Remote' : ''}</span>}
              {job.salaryRange && <span className="badge-applied">💰 {job.salaryRange}</span>}
              {job.experienceLevel && <span className="badge-applied">{job.experienceLevel}</span>}
            </div>

            {job.description && (
              <div className="mb-5">
                <h2 className="text-h3 mb-2">About this role</h2>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{job.description}</p>
              </div>
            )}
            {job.responsibilities && (
              <div className="mb-5">
                <h2 className="text-h3 mb-2">Responsibilities</h2>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{job.responsibilities}</p>
              </div>
            )}
            {job.requirements && (
              <div>
                <h2 className="text-h3 mb-2">Requirements</h2>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{job.requirements}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Apply card */}
          <div className="card-md">
            {applied ? (
              <div className="text-center py-4">
                <div className="text-3xl mb-2">✓</div>
                <p className="font-semibold text-emerald-700 text-sm">Application submitted.</p>
                <p className="text-xs text-slate-500 mt-1">You'll be notified when your application is reviewed.</p>
              </div>
            ) : isPast ? (
              <div className="text-center py-4">
                <p className="font-semibold text-slate-500 text-sm">Applications closed</p>
                <p className="text-xs text-slate-400 mt-1">The deadline for this role has passed.</p>
              </div>
            ) : (
              <>
                {error && <p className="text-xs text-rose-600 mb-3">{error}</p>}
                {showForm ? (
                  <div className="space-y-3">
                    <label className="label">Cover letter (optional)</label>
                    <textarea rows={5} className="input resize-none text-sm" placeholder="Briefly describe why you're a good fit for this role…"
                      value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
                    <button onClick={handleApply} className="btn-primary w-full py-2.5" disabled={applying}>
                      {applying ? 'Submitting…' : 'Submit Application'}
                    </button>
                    <button onClick={() => setShowForm(false)} className="btn-ghost w-full text-sm">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setShowForm(true)} className="btn-primary w-full py-2.5">
                    Apply for this role
                  </button>
                )}
              </>
            )}

            {job.applicationDeadline && !isPast && (
              <p className="text-xs text-slate-400 text-center mt-3">
                Apply before {new Date(job.applicationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>

          {/* Required skills */}
          {skills.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-neutral-dark mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {skills.map(s => (
                  <span key={s} className="text-xs bg-primary-100 text-primary px-2.5 py-1 rounded-full font-medium">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
