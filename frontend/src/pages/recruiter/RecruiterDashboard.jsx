import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { recruiterService } from '../../services/apiService'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

export default function RecruiterDashboard() {
  const { user } = useAuth()
  const [jobs, setJobs]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    recruiterService.getJobs({ size: 5, sort: 'createdAt,desc' })
      .then(r => setJobs(r.data.content ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="page-container space-y-8">
      <div className="bg-primary rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Welcome, {user.firstName}.</h1>
          <p className="text-white/80 text-sm">Manage your job postings and review applicants.</p>
        </div>
        <Link to="/recruiter/jobs" className="bg-white text-primary font-semibold text-sm px-4 py-2 rounded-btn hover:bg-primary-50 transition-colors">
          Post a Job →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Active Jobs', value: jobs.filter(j => j.status === 'ACTIVE').length, icon: '📋' },
          { label: 'Total Jobs',  value: jobs.length, icon: '📁' },
          { label: 'Company',     value: '—',         icon: '🏢' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="card text-center">
            <div className="text-2xl mb-1">{icon}</div>
            <p className="text-2xl font-bold text-primary font-mono">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h3 font-semibold">Recent Job Postings</h2>
          <Link to="/recruiter/jobs" className="text-sm text-primary hover:underline">Manage all</Link>
        </div>
        {jobs.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-slate-500 text-sm">No job postings yet.</p>
            <Link to="/recruiter/jobs" className="btn-primary mt-4 inline-block text-sm">Post your first job</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map(job => (
              <div key={job.id} className="card flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-sm text-neutral-dark">{job.title}</p>
                  <p className="text-xs text-slate-500">{job.jobType} · {job.location ?? 'Remote'}</p>
                </div>
                <Link to={`/recruiter/jobs/${job.id}/applicants`} className="btn-secondary text-xs px-3 py-1.5 shrink-0">
                  View Applicants
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
