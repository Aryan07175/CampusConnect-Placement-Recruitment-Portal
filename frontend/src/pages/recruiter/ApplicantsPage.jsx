import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { recruiterService } from '../../services/apiService'
import StatusBadge from '../../components/shared/StatusBadge'
import MatchScoreBadge from '../../components/shared/MatchScoreBadge'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import EmptyState from '../../components/shared/EmptyState'
import InterviewScheduleModal from '../../components/recruiter/InterviewScheduleModal'

const STATUSES = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'OFFERED', 'REJECTED', 'PLACED']
const STATUS_FILTERS = ['All', ...STATUSES]

export default function ApplicantsPage() {
  const { jobId } = useParams()
  const navigate  = useNavigate()

  const [apps, setApps]         = useState([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [updating, setUpdating] = useState(null)
  const [filter, setFilter]     = useState('All')
  const [expanded, setExpanded] = useState(null)   // expanded candidate id
  const [noteModal, setNoteModal] = useState(null) // { appId, notes }
  const [interviewModal, setInterviewModal] = useState(null) // appId

  const load = useCallback(() => {
    setLoading(true)
    recruiterService.getApplications(jobId, { size: 50, sort: 'skillMatchScore,desc' })
      .then(r => { setApps(r.data.content ?? []); setTotal(r.data.totalElements ?? 0) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [jobId])

  useEffect(() => { load() }, [load])

  const updateStatus = async (appId, status) => {
    setUpdating(appId)
    try {
      await recruiterService.updateStatus(appId, status, null)
      setApps(prev => prev.map(a => a.applicationId === appId ? { ...a, status } : a))
    } finally { setUpdating(null) }
  }

  const saveNotes = async () => {
    if (!noteModal) return
    setUpdating(noteModal.appId)
    try {
      await recruiterService.updateStatus(noteModal.appId, null, noteModal.notes)
      setApps(prev => prev.map(a => a.applicationId === noteModal.appId
        ? { ...a, recruiterNotes: noteModal.notes } : a))
      setNoteModal(null)
    } finally { setUpdating(null) }
  }

  const filtered = filter === 'All' ? apps : apps.filter(a => a.status === filter)

  // Summary counts
  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = apps.filter(a => a.status === s).length
    return acc
  }, {})

  if (loading) return <LoadingSpinner text="Loading applicants…" />

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-ghost text-sm">← Back</button>
        <div>
          <h1 className="text-h2">Applicants</h1>
          <p className="text-sm text-slate-500">{total} application{total !== 1 ? 's' : ''} · sorted by skill match</p>
        </div>
      </div>

      {/* Status summary bar */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(f => f === s ? 'All' : s)}
            className={`card text-center p-3 transition-all ${filter === s ? 'ring-2 ring-primary' : 'hover:shadow-card-md'}`}>
            <p className={`text-lg font-bold font-mono ${counts[s] > 0 ? 'text-primary' : 'text-slate-300'}`}>{counts[s]}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.replace('_', ' ')}</p>
          </button>
        ))}
      </div>

      {/* Filter strip */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_FILTERS.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-btn text-xs font-medium whitespace-nowrap transition-colors ${
              filter === s ? 'bg-primary text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-primary/40'
            }`}>
            {s === 'All' ? `All (${apps.length})` : `${s.replace('_', ' ')} (${counts[s]})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="👥" title="No applicants in this category"
          description="Switch the filter to see applicants with a different status." />
      ) : (
        <div className="space-y-3">
          {filtered.map(app => (
            <CandidateCard
              key={app.applicationId}
              app={app}
              expanded={expanded === app.applicationId}
              onToggle={() => setExpanded(e => e === app.applicationId ? null : app.applicationId)}
              onStatusChange={updateStatus}
              onNoteClick={() => setNoteModal({ appId: app.applicationId, notes: app.recruiterNotes ?? '' })}
              onInterviewClick={() => setInterviewModal(app.applicationId)}
              updating={updating === app.applicationId}
            />
          ))}
        </div>
      )}

      {/* Interview Modal */}
      {interviewModal && (
        <InterviewScheduleModal
          appId={interviewModal}
          onClose={() => setInterviewModal(null)}
          onSuccess={() => {
            setInterviewModal(null)
            load() // Reload apps to get updated status and interview details
          }}
        />
      )}

      {/* Notes modal */}
      {noteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-h3">Recruiter Notes</h3>
            <p className="text-xs text-slate-500">These notes are for internal use. The candidate will not see them.</p>
            <textarea rows={5} className="input resize-none"
              value={noteModal.notes}
              onChange={e => setNoteModal({ ...noteModal, notes: e.target.value })}
              placeholder="Add feedback or notes about this candidate…" />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setNoteModal(null)} className="btn-ghost text-sm">Cancel</button>
              <button onClick={saveNotes} className="btn-primary text-sm" disabled={!!updating}>
                {updating ? 'Saving…' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CandidateCard({ app, expanded, onToggle, onStatusChange, onNoteClick, onInterviewClick, updating }) {
  const requiredSkills = []   // enriched from job context if needed
  const matchColor =
    (app.skillMatchScore ?? 0) >= 80 ? 'border-l-accent' :
    (app.skillMatchScore ?? 0) >= 50 ? 'border-l-warning' :
    'border-l-slate-200'

  return (
    <div className={`card border-l-4 ${matchColor} transition-shadow`}>
      {/* Summary row */}
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center shrink-0 font-bold text-primary">
          {app.studentFirstName?.charAt(0)}{app.studentLastName?.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-sm text-neutral-dark">
              {app.studentFirstName} {app.studentLastName}
            </p>
            {app.profileComplete && (
              <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">Complete profile</span>
            )}
          </div>
          <p className="text-xs text-slate-500">{app.studentEmail}</p>
          {(app.college || app.degree) && (
            <p className="text-xs text-slate-500 mt-0.5">
              {app.degree}{app.branch ? ` · ${app.branch}` : ''}{app.college ? ` — ${app.college}` : ''}
              {app.graduationYear ? ` · ${app.graduationYear}` : ''}
              {app.cgpa ? ` · CGPA: ${app.cgpa}` : ''}
            </p>
          )}
          <p className="text-xs text-slate-400 mt-0.5">
            Applied {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>

        {/* Right controls */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
          <MatchScoreBadge score={app.skillMatchScore} />
          <StatusBadge status={app.status} />
        </div>
      </div>

      {/* Skills chips */}
      {app.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {app.skills.map(skill => (
            <span key={skill} className="text-xs bg-primary-100 text-primary px-2 py-0.5 rounded-full font-medium">
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Actions row */}
      <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100">
        <select
          className="input !w-auto text-xs py-1 px-2"
          value={app.status}
          disabled={updating}
          onChange={e => onStatusChange(app.applicationId, e.target.value)}
        >
          {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>

        <button onClick={onNoteClick} className="btn-ghost text-xs">
          {app.recruiterNotes ? '📝 Edit Notes' : '+ Add Notes'}
        </button>

        <button onClick={onInterviewClick} className="btn-secondary text-xs">
          📅 Schedule Interview
        </button>

        {app.hasResume && (
          <span className="text-xs text-accent flex items-center gap-1">
            <span>📄</span> Resume on file
          </span>
        )}

        {(app.linkedinUrl || app.githubUrl || app.portfolioUrl) && (
          <div className="flex gap-2 ml-auto">
            {app.linkedinUrl && <a href={app.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">LinkedIn</a>}
            {app.githubUrl   && <a href={app.githubUrl}   target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">GitHub</a>}
            {app.portfolioUrl && <a href={app.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">Portfolio</a>}
          </div>
        )}

        <button onClick={onToggle} className="btn-ghost text-xs ml-auto">
          {expanded ? 'Hide details ↑' : 'View details ↓'}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
          {app.bio && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Bio</p>
              <p className="text-sm text-slate-600">{app.bio}</p>
            </div>
          )}
          {app.coverLetter && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Cover Letter</p>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{app.coverLetter}</p>
            </div>
          )}
          {app.recruiterNotes && (
            <div className="bg-amber-50 border border-amber-200 rounded-btn p-3">
              <p className="text-xs font-semibold text-amber-700 mb-1">Your Notes</p>
              <p className="text-sm text-amber-800">{app.recruiterNotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
