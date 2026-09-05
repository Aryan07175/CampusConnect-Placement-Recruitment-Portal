import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/apiService'

const ROLES = [
  { value: 'STUDENT',   label: 'Student',   desc: 'Browse jobs and track applications' },
  { value: 'RECRUITER', label: 'Recruiter', desc: 'Post jobs and find candidates' },
]

export default function RegisterPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [form, setForm]       = useState({ firstName: '', lastName: '', username: '', email: '', password: '', role: 'STUDENT' })
  const [error, setError]     = useState('')
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const validate = () => {
    const e = {}
    if (!form.firstName.trim())          e.firstName = 'First name is required'
    if (!form.lastName.trim())           e.lastName  = 'Last name is required'
    if (form.username.length < 3)        e.username  = 'Username must be at least 3 characters'
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email   = 'Enter a valid email'
    if (form.password.length < 6)        e.password  = 'Password must be at least 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setError('')
    setLoading(true)
    try {
      const { data } = await authService.register(form)
      login(data, data.token)
      navigate(form.role === 'RECRUITER' ? '/recruiter' : '/student', { replace: true })
    } catch (err) {
      const msg = err.response?.data
      if (typeof msg === 'object') setErrors(msg)
      else setError(msg?.message ?? 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-light flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-neutral-dark">Create your account</h1>
          <p className="text-slate-500 text-sm mt-1">Join CampusConnect today</p>
        </div>

        <div className="card-md">
          {error && (
            <div className="mb-4 px-4 py-3 bg-rose-50 border border-rose-200 rounded-btn text-sm text-rose-700">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector */}
            <div>
              <label className="label">I am a</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.value })}
                    className={`p-3 rounded-btn border-2 text-left transition-all ${
                      form.role === r.value
                        ? 'border-primary bg-primary-50 text-primary'
                        : 'border-slate-200 text-neutral-dark hover:border-primary/40'
                    }`}
                  >
                    <p className="font-semibold text-sm">{r.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="label">First name</label>
                <input id="firstName" name="firstName" className="input" value={form.firstName} onChange={handleChange} placeholder="Aryan" />
                {errors.firstName && <p className="text-xs text-danger mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label htmlFor="lastName" className="label">Last name</label>
                <input id="lastName" name="lastName" className="input" value={form.lastName} onChange={handleChange} placeholder="Sharma" />
                {errors.lastName && <p className="text-xs text-danger mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="username" className="label">Username</label>
              <input id="username" name="username" className="input" value={form.username} onChange={handleChange} placeholder="aryan123" />
              {errors.username && <p className="text-xs text-danger mt-1">{errors.username}</p>}
            </div>

            <div>
              <label htmlFor="email" className="label">Email</label>
              <input id="email" name="email" type="email" className="input" value={form.email} onChange={handleChange} placeholder="you@example.com" />
              {errors.email && <p className="text-xs text-danger mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <input id="password" name="password" type="password" className="input" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" />
              {errors.password && <p className="text-xs text-danger mt-1">{errors.password}</p>}
            </div>

            <button type="submit" className="btn-primary w-full justify-center py-2.5" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
