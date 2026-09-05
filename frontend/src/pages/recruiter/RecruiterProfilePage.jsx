import { useEffect, useState } from 'react'
import { recruiterService } from '../../services/apiService'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

export default function RecruiterProfilePage() {
  const [form, setForm]     = useState({ companyName: '', companyWebsite: '', industry: '', companyDescription: '', companySize: '', headquarters: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [error, setError]   = useState('')

  useEffect(() => {
    recruiterService.getProfile()
      .then(r => setForm(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSave = async e => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      await recruiterService.upsertProfile(form)
      setSaved(true); setTimeout(() => setSaved(false), 3000)
    } catch { setError('Failed to save. Please try again.') }
    finally { setSaving(false) }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="page-container max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-h2">Company Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Keep your company information accurate for students applying to your jobs.</p>
      </div>
      {error && <div className="px-4 py-3 bg-rose-50 border border-rose-200 rounded-btn text-sm text-rose-700">{error}</div>}
      {saved && <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-btn text-sm text-emerald-700">Company profile saved successfully.</div>}
      <form onSubmit={handleSave} className="card-md space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="label">Company Name</label><input name="companyName" className="input" value={form.companyName ?? ''} onChange={handleChange} placeholder="Acme Corp" /></div>
          <div><label className="label">Website</label><input name="companyWebsite" type="url" className="input" value={form.companyWebsite ?? ''} onChange={handleChange} placeholder="https://acme.com" /></div>
          <div><label className="label">Industry</label><input name="industry" className="input" value={form.industry ?? ''} onChange={handleChange} placeholder="Software / Technology" /></div>
          <div><label className="label">Company Size</label>
            <select name="companySize" className="input" value={form.companySize ?? ''} onChange={handleChange}>
              <option value="">Select size</option>
              {['1–50','51–200','201–500','500+'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div><label className="label">Headquarters</label><input name="headquarters" className="input" value={form.headquarters ?? ''} onChange={handleChange} placeholder="Bangalore, India" /></div>
        </div>
        <div><label className="label">Company Description</label><textarea name="companyDescription" rows={4} className="input resize-none" value={form.companyDescription ?? ''} onChange={handleChange} placeholder="Tell students about your company…" /></div>
        <button type="submit" className="btn-primary px-6 py-2.5" disabled={saving}>{saving ? 'Saving…' : 'Save Profile'}</button>
      </form>
    </div>
  )
}
