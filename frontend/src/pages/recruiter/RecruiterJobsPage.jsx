import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { recruiterService } from '../../services/apiService'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import EmptyState from '../../components/shared/EmptyState'

const EMPTY_JOB = {
  title: '', companyName: '', description: '', responsibilities: '', requirements: '',
  requiredSkills: '', jobType: 'Full-time', location: '', salaryRange: '',
  applicationDeadline: '', experienceLevel: 'Fresher', remote: false, status: 'ACTIVE'
}

export default function RecruiterJobsPage() {
  const [jobs, setJobs]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [formMode, setFormMode] = useState(null)  // null | 'create' | {id, ...editingJob}
  const [form, setForm]         = useState(EMPTY_JOB)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [togglingId, setTogglingId] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    recruiterService.getJobs({ size: 100, sort: 'createdAt,desc' })
      .then(r => setJobs(r.data.content ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setForm(EMPTY_JOB); setError(''); setFormMode('create') }
  const openEdit   = (job) => {
    setForm({
      title: job.title ?? '', companyName: job.companyName ?? '',
      description: job.description ?? '', responsibilities: job.responsibilities ?? '',
      requirements: job.requirements ?? '', requiredSkills: job.requiredSkills ?? '',
      jobType: job.jobType ?? 'Full-time', location: job.location ?? '',
      salaryRange: job.salaryRange ?? '',
      applicationDeadline: job.applicationDeadline ? job.applicationDeadline.split('T')[0] : '',
      experienceLevel: job.experienceLevel ?? 'Fresher',
      remote: job.remote ?? false, status: job.status ?? 'ACTIVE'
    })
    setError('')
    setFormMode({ id: job.id })
  }
  const closeForm = () => { setFormMode(null); setError('') }

  const handleChange = e => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [e.target.name]: val }))
  }

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      if (formMode === 'create') {
        await recruiterService.createJob(form)
      } else {
        await recruiterService.updateJob(formMode.id, form)
      }
      closeForm(); load()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to save job posting.')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    await recruiterService.deleteJob(id)
    setJobs(j => j.filter(x => x.id !== id))
  }

  const toggleStatus = async (job) => {
    setTogglingId(job.id)
    try {
      const newStatus = job.status === 'ACTIVE' ? 'CLOSED' : 'ACTIVE'
      const { data } = await recruiterService.updateJob(job.id, { ...job, status: newStatus })
      setJobs(j => j.map(x => x.id === job.id ? data : x))
    } finally { setTogglingId(null) }
  }

  const activeJobs = jobs.filter(j => j.status === 'ACTIVE').length
  const closedJobs = jobs.filter(j => j.status !== 'ACTIVE').length

  if (loading) return <LoadingSpinner />

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2">My Job Postings</h1>
          <p className="text-sm text-slate-500 mt-1">
            {activeJobs} active · {closedJobs} closed
          </p>
        </div>
        {formMode ? (
          <button onClick={closeForm} className="btn-secondary text-sm">✕ Cancel</button>
        ) : (
          <button onClick={openCreate} className="btn-primary text-sm">+ Post a Job</button>
        )}
      </div>

      {/* Form */}
      {formMode && (
        <form onSubmit={handleSubmit} className="card-md space-y-5">
          <h2 className="text-h3 pb-2 border-b border-slate-100">
            {formMode === 'create' ? 'New Job Posting' : 'Edit Job Posting'}
          </h2>
          {error && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-btn">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Job Title *</label>
              <input name="title" required className="input" value={form.title} onChange={handleChange} placeholder="Software Engineer" /></div>
            <div><label className="label">Company Name *</label>
              <input name="companyName" required className="input" value={form.companyName} onChange={handleChange} placeholder="Acme Corp" /></div>
            <div><label className="label">Job Type</label>
              <select name="jobType" className="input" value={form.jobType} onChange={handleChange}>
                {['Full-time','Internship','Part-time','Contract'].map(t => <option key={t}>{t}</option>)}</select></div>
            <div><label className="label">Location</label>
              <input name="location" className="input" value={form.location} onChange={handleChange} placeholder="Bangalore, India" /></div>
            <div><label className="label">Salary / Stipend</label>
              <input name="salaryRange" className="input" value={form.salaryRange} onChange={handleChange} placeholder="12–18 LPA" /></div>
            <div><label className="label">Application Deadline</label>
              <input name="applicationDeadline" type="date" className="input" value={form.applicationDeadline} onChange={handleChange} /></div>
            <div><label className="label">Experience Level</label>
              <select name="experienceLevel" className="input" value={form.experienceLevel} onChange={handleChange}>
                {['Fresher','0–1 year','1–3 years','3+ years'].map(t => <option key={t}>{t}</option>)}</select></div>
            <div><label className="label">Status</label>
              <select name="status" className="input" value={form.status} onChange={handleChange}>
                {['ACTIVE','CLOSED','DRAFT'].map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <input type="checkbox" id="remote" name="remote" checked={form.remote} onChange={handleChange} className="w-4 h-4 text-primary rounded" />
              <label htmlFor="remote" className="text-sm text-neutral-dark">Remote / Hybrid available</label>
            </div>
          </div>

          <div><label className="label">Required Skills <span className="text-slate-400 font-normal">(comma-separated)</span></label>
            <input name="requiredSkills" className="input" value={form.requiredSkills} onChange={handleChange} placeholder="Java, Spring Boot, React, MySQL" /></div>

          <div><label className="label">Job Description</label>
            <textarea name="description" rows={4} className="input resize-none" value={form.description} onChange={handleChange} placeholder="Describe the role and what the candidate will work on…" /></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Responsibilities</label>
              <textarea name="responsibilities" rows={4} className="input resize-none" value={form.responsibilities} onChange={handleChange} placeholder="Key responsibilities…" /></div>
            <div><label className="label">Requirements</label>
              <textarea name="requirements" rows={4} className="input resize-none" value={form.requirements} onChange={handleChange} placeholder="Must-have qualifications…" /></div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary px-6 py-2.5" disabled={saving}>
              {saving ? (formMode === 'create' ? 'Posting…' : 'Saving…') : (formMode === 'create' ? 'Post Job' : 'Save Changes')}
            </button>
            <button type="button" onClick={closeForm} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      {/* Jobs list */}
      {!formMode && (
        jobs.length === 0 ? (
          <EmptyState icon="📋" title="No job postings yet"
            description="Post your first job to start receiving applications from students."
            action={<button onClick={openCreate} className="btn-primary text-sm">Post a Job</button>} />
        ) : (
          <div className="space-y-3">
            {jobs.map(job => <JobRow key={job.id} job={job} onEdit={openEdit} onDelete={handleDelete} onToggle={toggleStatus} toggling={togglingId === job.id} />)}
          </div>
        )
      )}
    </div>
  )
}

function JobRow({ job, onEdit, onDelete, onToggle, toggling }) {
  const skills = (job.requiredSkills ?? '').split(',').map(s => s.trim()).filter(Boolean)
  const isActive = job.status === 'ACTIVE'

  return (
    <div className="card hover:shadow-card-md transition-all">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm text-neutral-dark">{job.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              {job.status}
            </span>
            {job.jobType && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{job.jobType}</span>}
            {job.remote && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Remote</span>}
          </div>
          <p className="text-xs text-slate-500">
            {job.companyName} {job.location ? `· ${job.location}` : ''} {job.salaryRange ? `· ${job.salaryRange}` : ''}
          </p>
          {job.applicationDeadline && (
            <p className="text-xs text-slate-400 mt-0.5">
              Deadline: {new Date(job.applicationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          )}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {skills.slice(0, 5).map(s => (
                <span key={s} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{s}</span>
              ))}
              {skills.length > 5 && <span className="text-xs text-slate-400">+{skills.length - 5} more</span>}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
          <Link to={`/recruiter/jobs/${job.id}/applicants`} className="btn-primary text-xs px-3 py-1.5">
            View Applicants
          </Link>
          <button onClick={() => onEdit(job)} className="btn-secondary text-xs px-3 py-1.5">Edit</button>
          <button onClick={() => onToggle(job)} disabled={toggling} className="btn-secondary text-xs px-3 py-1.5">
            {toggling ? '…' : isActive ? 'Close' : 'Reopen'}
          </button>
          <button onClick={() => onDelete(job.id, job.title)} className="btn-danger text-xs px-3 py-1.5">Delete</button>
        </div>
      </div>
    </div>
  )
}
