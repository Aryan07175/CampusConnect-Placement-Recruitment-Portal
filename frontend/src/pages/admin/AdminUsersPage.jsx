import { useEffect, useState, useCallback } from 'react'
import { adminService } from '../../services/apiService'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import EmptyState from '../../components/shared/EmptyState'

const ROLE_FILTERS = ['All', 'STUDENT', 'RECRUITER', 'ADMIN']

export default function AdminUsersPage() {
  const [users, setUsers]       = useState([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [toggling, setToggling] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [page, setPage]         = useState(0)
  const PAGE_SIZE = 20

  const load = useCallback(() => {
    setLoading(true)
    adminService.getUsers({ page, size: PAGE_SIZE, sort: 'createdAt,desc' })
      .then(r => { setUsers(r.data.content ?? []); setTotal(r.data.totalElements ?? 0) })
      .finally(() => setLoading(false))
  }, [page])

  useEffect(() => { load() }, [load])

  const toggle = async (id) => {
    setToggling(id)
    try {
      const { data } = await adminService.toggleUser(id)
      setUsers(u => u.map(x => x.id === id ? { ...x, enabled: data.enabled } : x))
    } finally { setToggling(null) }
  }

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Permanently delete ${name}? This cannot be undone.`)) return
    setDeleting(id)
    try {
      await adminService.deleteUser(id)
      setUsers(u => u.filter(x => x.id !== id))
      setTotal(t => t - 1)
    } finally { setDeleting(null) }
  }

  // Client-side filter on top of paginated data
  const filtered = users.filter(u => {
    const roleName = u.roles?.[0]?.name?.replace('ROLE_', '') ?? ''
    const matchesRole = roleFilter === 'All' || roleName === roleFilter
    const matchesSearch = !search ||
      `${u.firstName} ${u.lastName} ${u.email} ${u.username}`.toLowerCase().includes(search.toLowerCase())
    return matchesRole && matchesSearch
  })

  if (loading) return <LoadingSpinner text="Loading users…" />

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="text-h2">User Management</h1>
        <p className="text-sm text-slate-500 mt-1">{total} registered user{total !== 1 ? 's' : ''}</p>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          className="input flex-1"
          placeholder="Search by name, email, or username…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-1">
          {ROLE_FILTERS.map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-btn text-xs font-medium whitespace-nowrap transition-colors ${
                roleFilter === r ? 'bg-primary text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-primary/40'
              }`}>{r}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="👥" title="No users found"
          description={search ? `No users match "${search}".` : 'No users registered yet.'} />
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-neutral-light border-b border-slate-100">
                <tr>
                  {['User', 'Email', 'Role', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(user => {
                  const roleName = user.roles?.[0]?.name?.replace('ROLE_', '') ?? 'USER'
                  const isAdmin  = roleName === 'ADMIN'
                  return (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary font-bold text-xs shrink-0">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-neutral-dark">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-slate-400">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          roleName === 'ADMIN'     ? 'bg-rose-100 text-rose-700' :
                          roleName === 'RECRUITER' ? 'bg-amber-100 text-amber-700' :
                                                     'bg-indigo-100 text-indigo-700'
                        }`}>{roleName}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          user.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>{user.enabled ? 'Active' : 'Disabled'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {!isAdmin && (
                            <button onClick={() => toggle(user.id)} disabled={toggling === user.id}
                              className="text-xs btn-secondary px-2.5 py-1 disabled:opacity-50">
                              {toggling === user.id ? '…' : user.enabled ? 'Disable' : 'Enable'}
                            </button>
                          )}
                          {!isAdmin && (
                            <button onClick={() => deleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                              disabled={deleting === user.id}
                              className="text-xs btn-danger px-2.5 py-1 disabled:opacity-50">
                              {deleting === user.id ? '…' : 'Delete'}
                            </button>
                          )}
                          {isAdmin && <span className="text-xs text-slate-400 italic">Protected</span>}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-center gap-2">
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
