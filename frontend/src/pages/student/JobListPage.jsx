import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { studentService, recommendationService } from '../../services/apiService'
import MatchScoreBadge from '../../components/shared/MatchScoreBadge'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import EmptyState from '../../components/shared/EmptyState'

const JOB_TYPES = ['All', 'Full-time', 'Internship', 'Part-time', 'Contract']

export default function JobListPage() {
  const [jobs, setJobs]       = useState([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [search, setSearch]   = useState('')
  const [jobType, setJobType] = useState('All')
  const [page, setPage]       = useState(0)
  const PAGE_SIZE = 12

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await recommendationService.getMyRecommendations()
      // Fallback search since recommendation API doesn't support query params yet
      let results = data ?? []
      if (search) {
        const lowerSearch = search.toLowerCase()
        results = results.filter(j => 
          (j.title && j.title.toLowerCase().includes(lowerSearch)) || 
          (j.companyName && j.companyName.toLowerCase().includes(lowerSearch)) ||
          (j.requiredSkills && j.requiredSkills.toLowerCase().includes(lowerSearch))
        )
      }
      setJobs(results)
      setTotal(results.length)
    } catch { setJobs([]) }
    finally { setLoading(false) }
  }, [search])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  const handleSearch = (e) => { e.preventDefault(); setSearch(keyword); setPage(0) }

  const filtered = jobType === 'All' ? jobs : jobs.filter(j => j.jobType === jobType)
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="text-h2">Browse Jobs</h1>
        <p className="text-sm text-slate-500 mt-1">{total} open position{total !== 1 ? 's' : ''} matched to your skills</p>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <input
            className="input flex-1"
            placeholder="Search by title, company, or skill…"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
          <button type="submit" className="btn-primary px-4 shrink-0">Search</button>
        </form>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {JOB_TYPES.map(t => (
            <button key={t} onClick={() => setJobType(t)}
              className={`px-3 py-1.5 rounded-btn text-xs font-medium whitespace-nowrap transition-colors ${
                jobType === t
                  ? 'bg-primary text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-primary/40'
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? <LoadingSpinner text="Loading jobs…" /> : filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No jobs found"
          description={search ? `No results for "${search}". Try a different keyword or clear the search.` : 'No active job postings at the moment. Check back soon.'}
          action={search && <button onClick={() => { setSearch(''); setKeyword('') }} className="btn-secondary text-sm">Clear search</button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map(job => (
            <JobCard key={job.jobId} job={job} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            className="btn-secondary text-sm disabled:opacity-40">← Prev</button>
          <span className="text-sm text-slate-500">Page {page + 1} of {Math.ceil(total / PAGE_SIZE)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * PAGE_SIZE >= total}
            className="btn-secondary text-sm disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  )
}

function JobCard({ job }) {
  const skills = (job.requiredSkills ?? '').split(',').map(s => s.trim()).filter(Boolean)

  return (
    <Link to={`/student/jobs/${job.jobId}`}
      className="card hover:shadow-card-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col relative overflow-hidden">
      
      {job.matchScore > 0 && (
        <div className="absolute top-0 right-0">
           <MatchScoreBadge score={job.matchScore} />
        </div>
      )}

      <div className="flex-1 mt-2">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-primary font-bold text-sm">
              {job.companyName?.charAt(0) ?? '?'}
            </span>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            job.jobType === 'Full-time' ? 'bg-indigo-100 text-indigo-700' :
            job.jobType === 'Internship' ? 'bg-amber-100 text-amber-700' :
            'bg-slate-100 text-slate-600'
          }`}>{job.jobType ?? 'Full-time'}</span>
        </div>

        <h3 className="font-semibold text-sm text-neutral-dark leading-snug">{job.title}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{job.companyName}</p>

        {job.location && (
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span>📍</span> {job.location} {job.remote && '· Remote'}
          </p>
        )}
        {job.salaryRange && (
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
            <span>💰</span> {job.salaryRange}
          </p>
        )}

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {skills.slice(0, 4).map(s => (
              <span key={s} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{s}</span>
            ))}
            {skills.length > 4 && <span className="text-xs text-slate-400">+{skills.length - 4}</span>}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        {job.applicationDeadline && (
          <p className="text-xs text-slate-400">Due {new Date(job.applicationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
        )}
        <span className="text-xs text-primary font-medium ml-auto">View details →</span>
      </div>
    </Link>
  )
}
