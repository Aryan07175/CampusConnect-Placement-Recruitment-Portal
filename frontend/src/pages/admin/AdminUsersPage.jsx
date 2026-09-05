import { useEffect, useState } from 'react'
import { adminService } from '../../services/apiService'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import EmptyState from '../../components/shared/EmptyState'

export default function AdminUsersPage() {
  const [users, setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(null)

  const load = () => {
    adminService.getUsers({ size: 100, sort: 'createdAt,desc' })
      .then(r => setUsers(r.data.content ?? []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const toggle = async (id) => {
    setToggling(id)
    try {
      const { data } = await adminService.toggleUser(id)
      setUsers(users.map(u => u.id === id ? { ...u, enabled: data.enabled } : u))
    } finally { setToggling(null) }
  }

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return
    await adminService.deleteUser(id)
    setUsers(users.filter(u => u.id !== id))
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="text-h2">User Management</h1>
        <p className="text-sm text-slate-500 mt-1">{users.length} registered users</p>
      </div>

      {users.length === 0 ? (
        <EmptyState icon="👥" title="No users yet" description="Registered users will appear here." />
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-neutral-light border-b border-slate-100">
              <tr>
                {['Name', 'Email', 'Role', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-neutral-dark">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      user.roles?.[0]?.name === 'ROLE_ADMIN'     ? 'bg-rose-100 text-rose-700' :
                      user.roles?.[0]?.name === 'ROLE_RECRUITER' ? 'bg-amber-100 text-amber-700' :
                                                                   'bg-indigo-100 text-indigo-700'
                    }`}>{(user.roles?.[0]?.name ?? 'USER').replace('ROLE_', '')}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {user.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggle(user.id)} disabled={toggling === user.id}
                        className="text-xs btn-secondary px-2.5 py-1">
                        {user.enabled ? 'Disable' : 'Enable'}
                      </button>
                      <button onClick={() => deleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                        className="text-xs btn-danger px-2.5 py-1">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
