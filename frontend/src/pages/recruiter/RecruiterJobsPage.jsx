import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { recruiterService } from '../../services/apiService'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import EmptyState from '../../components/shared/EmptyState'

const EMPTY_JOB = { title: '', companyName: '', description: '', requiredSkills: '', jobType: 'Full-time', location: '', salaryRange: '', applicationDeadline: '', experienceLevel: 'Fresher', remote: false }

export default function RecruiterJobsPage() {
  const [jobs, setJobs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]       = useState(EMPTY_JOB)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  const load = () => {
    setLoading(true)
    recruiterService.getJobs({ size: 50 })
      .then(r => setJobs(r.data.content ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleChange = e => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [e.target.name]: val })
  }

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      await recruiterService.createJob(form)
      setShowForm(false); setForm(EMPTY_JOB); load()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to post job.')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job posting?')) return
    await recruiterService.deleteJob(id)
    load()
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2">My Job Postings</h1>
          <p className="text-sm text-slate-500 mt-1">{jobs.length} posting{jobs.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="btn-primary text-sm">
          {showForm ? 'Cancel' : '+ Post a Job'}
        </button>
      </div>

      {/* Job posting form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card-md space-y-4">
          <h2 className="text-h3">New Job Posting</h2>
          {error && <p className="text-xs text-rose-600">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Job Title *</label><input name="title" required className="input" value={form.title} onChange={handleChange} placeholder="Software Engineer" /></div>
            <div><label className="label">Company Name *</label><input name="companyName" required className="input" value={form.companyName} onChange={handleChange} placeholder="Acme Corp" /></div>
            <div><label className="label">Job Type</label>
              <select name="jobType" className="input" value={form.jobType} onChange={handleChange}>
                {['Full-time','Internship','Part-time','Contract'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label className="label">Location</label><input name="location" className="input" value={form.location} onChange={handleChange} placeholder="Bangalore, India" /></div>
            <div><label className="label">Salary Range</label><input name="salaryRange" className="input" value={form.salaryRange} onChange={handleChange} placeholder="12–18 LPA" /></div>
            <div><label className="label">Application Deadline</label><input name="applicationDeadline" type="date" className="input" value={form.applicationDeadline} onChange={handleChange} /></div>
            <div><label className="label">Experience Level</label>
              <select name="experienceLevel" className="input" value={form.experienceLevel} onChange={handleChange}>
                {['Fresher','0–1 year','1–3 years','3+ years'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" id="remote" name="remote" checked={form.remote} onChange={handleChange} className="w-4 h-4 text-primary" />
              <label htmlFor="remote" className="text-sm text-neutral-dark">Remote / Hybrid</label>
            </div>
          </div>
          <div><label className="label">Required Skills (comma-separated)</label><input name="requiredSkills" className="input" value={form.requiredSkills} onChange={handleChange} placeholder="Java, Spring Boot, React" /></div>
          <div><label className="label">Job Description</label><textarea name="description" rows={4} className="input resize-none" value={form.description} onChange={handleChange} placeholder="Describe the role…" /></div>
          <div><label className="label">Responsibilities</label><textarea name="responsibilities" rows={3} className="input resize-none" value={form.responsibilities} onChange={handleChange} placeholder="Key responsibilities…" /></div>
          <div><label className="label">Requirements</label><textarea name="requirements" rows={3} className="input resize-none" value={form.requirements} onChange={handleChange} placeholder="Must-have qualifications…" /></div>
          <button type="submit" className="btn-primary px-6 py-2.5" disabled={saving}>{saving ? 'Posting…' : 'Post Job'}</button>
        </form>
      )}

      {/* Jobs list */}
      {jobs.length === 0 ? (
        <EmptyState icon="📋" title="No job postings yet" description="Post your first job to start receiving applications from students." action={<button onClick={() => setShowForm(true)} className="btn-primary text-sm">Post a Job</button>} />
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job.id} className="card flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-neutral-dark">{job.title}</p>
                <p className="text-xs text-slate-500">{job.jobType} · {job.location || 'Location not specified'} {job.remote ? '· Remote' : ''}</p>
                {job.applicationDeadline && (
                  <p className="text-xs text-slate-400 mt-0.5">Due {new Date(job.applicationDeadline).toLocaleDateString('en-IN')}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${job.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {job.status}
                </span>
                <Link to={`/recruiter/jobs/${job.id}/applicants`} className="btn-secondary text-xs px-3 py-1.5">Applicants</Link>
                <button onClick={() => handleDelete(job.id)} className="btn-danger text-xs px-3 py-1.5">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
