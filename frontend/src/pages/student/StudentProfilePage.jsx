import { useEffect, useState, useRef } from 'react'
import { studentService } from '../../services/apiService'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

const SKILL_SUGGESTIONS = ['Java','Spring Boot','React','Node.js','Python','MySQL','MongoDB',
  'Docker','AWS','JavaScript','TypeScript','C++','Machine Learning','Git','REST APIs']

export default function StudentProfilePage() {
  const [profile, setProfile]   = useState(null)
  const [form, setForm]         = useState({})
  const [saving, setSaving]     = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved]       = useState(false)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const fileRef = useRef()

  useEffect(() => {
    studentService.getProfile()
      .then(r => { setProfile(r.data); setForm(r.data) })
      .catch(() => setForm({}))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const addSkill = (skill) => {
    const current = form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : []
    if (!current.includes(skill)) {
      setForm({ ...form, skills: [...current, skill].join(',') })
    }
  }
  const removeSkill = (skill) => {
    const updated = (form.skills ?? '').split(',').map(s => s.trim()).filter(s => s && s !== skill)
    setForm({ ...form, skills: updated.join(',') })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const r = await studentService.upsertProfile(form)
      setProfile(r.data)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch { setError('Failed to save profile. Please try again.') }
    finally { setSaving(false) }
  }

  const handleResume = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const r = await studentService.uploadResume(file)
      setProfile(r.data)
    } catch { setError('Resume upload failed.') }
    finally { setUploading(false) }
  }

  if (loading) return <LoadingSpinner text="Loading profile…" />

  const skillList = (form.skills ?? '').split(',').map(s => s.trim()).filter(Boolean)

  return (
    <div className="page-container max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-h2">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Keep your profile up to date to get better skill-match scores.</p>
      </div>

      {error && (
        <div className="px-4 py-3 bg-rose-50 border border-rose-200 rounded-btn text-sm text-rose-700">{error}</div>
      )}
      {saved && (
        <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-btn text-sm text-emerald-700">
          Profile saved successfully.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        {/* Academic Info */}
        <div className="card space-y-4">
          <h2 className="text-h3 pb-2 border-b border-slate-100">Academic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">College / University</label>
              <input name="college" className="input" value={form.college ?? ''} onChange={handleChange} placeholder="IIT Delhi" />
            </div>
            <div>
              <label className="label">Degree</label>
              <input name="degree" className="input" value={form.degree ?? ''} onChange={handleChange} placeholder="B.Tech" />
            </div>
            <div>
              <label className="label">Branch / Major</label>
              <input name="branch" className="input" value={form.branch ?? ''} onChange={handleChange} placeholder="Computer Science" />
            </div>
            <div>
              <label className="label">Graduation Year</label>
              <input name="graduationYear" type="number" className="input" value={form.graduationYear ?? ''} onChange={handleChange} placeholder="2025" min="2020" max="2030" />
            </div>
            <div>
              <label className="label">CGPA</label>
              <input name="cgpa" type="number" step="0.01" className="input" value={form.cgpa ?? ''} onChange={handleChange} placeholder="8.5" min="0" max="10" />
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="card space-y-3">
          <h2 className="text-h3 pb-2 border-b border-slate-100">Skills</h2>
          <p className="text-xs text-slate-500">These are used to compute your skill-match score with job postings.</p>

          {/* Skill chips */}
          {skillList.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skillList.map(skill => (
                <span key={skill} className="inline-flex items-center gap-1 bg-primary-100 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="hover:text-danger leading-none">×</button>
                </span>
              ))}
            </div>
          )}

          {/* Quick-add suggestions */}
          <div>
            <p className="text-xs text-slate-400 mb-2">Quick add:</p>
            <div className="flex flex-wrap gap-1.5">
              {SKILL_SUGGESTIONS.filter(s => !skillList.includes(s)).map(s => (
                <button key={s} type="button" onClick={() => addSkill(s)}
                  className="text-xs px-2 py-1 rounded border border-slate-200 text-slate-600 hover:border-primary hover:text-primary transition-colors">
                  + {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Or type comma-separated skills</label>
            <input name="skills" className="input" value={form.skills ?? ''} onChange={handleChange}
              placeholder="Java, Spring Boot, React, MySQL" />
          </div>
        </div>

        {/* Bio & Links */}
        <div className="card space-y-4">
          <h2 className="text-h3 pb-2 border-b border-slate-100">Bio & Links</h2>
          <div>
            <label className="label">Bio</label>
            <textarea name="bio" rows={3} className="input resize-none" value={form.bio ?? ''} onChange={handleChange}
              placeholder="A brief description about yourself…" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">LinkedIn URL</label>
              <input name="linkedinUrl" type="url" className="input" value={form.linkedinUrl ?? ''} onChange={handleChange} placeholder="https://linkedin.com/in/…" />
            </div>
            <div>
              <label className="label">GitHub URL</label>
              <input name="githubUrl" type="url" className="input" value={form.githubUrl ?? ''} onChange={handleChange} placeholder="https://github.com/…" />
            </div>
            <div>
              <label className="label">Portfolio URL</label>
              <input name="portfolioUrl" type="url" className="input" value={form.portfolioUrl ?? ''} onChange={handleChange} placeholder="https://yourportfolio.com" />
            </div>
          </div>
        </div>

        {/* Resume */}
        <div className="card space-y-3">
          <h2 className="text-h3 pb-2 border-b border-slate-100">Resume</h2>
          {profile?.resumeOriginalName ? (
            <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-btn">
              <svg className="w-5 h-5 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm text-emerald-700 font-medium truncate">{profile.resumeOriginalName}</p>
              <button type="button" onClick={() => fileRef.current.click()} className="ml-auto text-xs text-primary hover:underline shrink-0">
                Replace
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current.click()}
              className="w-full border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-primary/40 transition-colors">
              <p className="text-sm font-medium text-neutral-dark">
                {uploading ? 'Uploading…' : 'Click to upload your resume'}
              </p>
              <p className="text-xs text-slate-400 mt-1">PDF or DOCX, max 10 MB</p>
            </button>
          )}
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResume} />
          {uploading && <p className="text-xs text-slate-500">Uploading resume…</p>}
        </div>

        <button type="submit" className="btn-primary px-6 py-2.5" disabled={saving}>
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}
