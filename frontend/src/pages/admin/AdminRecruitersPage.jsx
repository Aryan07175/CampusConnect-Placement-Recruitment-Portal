import { useEffect, useState } from 'react'
import { adminService } from '../../services/apiService'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import EmptyState from '../../components/shared/EmptyState'

export default function AdminRecruitersPage() {
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(null)

  const load = () => {
    adminService.getPendingRecruiters()
      .then(r => setPending(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const approve = async (id, company) => {
    setApproving(id)
    try {
      await adminService.approveRecruiter(id)
      setPending(pending.filter(p => p.id !== id))
    } finally { setApproving(null) }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="text-h2">Recruiter Approvals</h1>
        <p className="text-sm text-slate-500 mt-1">
          {pending.length === 0 ? 'All recruiter accounts are approved.' : `${pending.length} account${pending.length !== 1 ? 's' : ''} awaiting review`}
        </p>
      </div>

      {pending.length === 0 ? (
        <EmptyState icon="✅" title="No pending approvals" description="All recruiter accounts have been reviewed." />
      ) : (
        <div className="space-y-3">
          {pending.map(profile => (
            <div key={profile.id} className="card flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-amber-700 font-bold text-lg">{profile.companyName?.charAt(0) ?? '?'}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-neutral-dark">{profile.companyName}</p>
                  <p className="text-xs text-slate-500">{profile.industry} · {profile.headquarters}</p>
                  {profile.companyWebsite && (
                    <a href={profile.companyWebsite} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline">{profile.companyWebsite}</a>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="badge-under-review text-xs">Pending</span>
                <button
                  onClick={() => approve(profile.id, profile.companyName)}
                  disabled={approving === profile.id}
                  className="btn-primary text-xs px-4 py-1.5"
                >
                  {approving === profile.id ? 'Approving…' : 'Approve'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
