import { useState } from 'react'
import { recruiterService } from '../../services/apiService'

const ROUNDS = ['SCREENING', 'TECHNICAL_1', 'TECHNICAL_2', 'HR', 'MANAGERIAL', 'FINAL']
const MODES = ['ONLINE', 'OFFLINE', 'PHONE']

export default function InterviewScheduleModal({ appId, existingInterview, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    round: existingInterview?.round || 'SCREENING',
    scheduledAt: existingInterview?.scheduledAt 
      ? new Date(existingInterview.scheduledAt).toISOString().slice(0, 16) 
      : '',
    durationMinutes: existingInterview?.durationMinutes || 60,
    mode: existingInterview?.mode || 'ONLINE',
    location: existingInterview?.location || '',
    meetingLink: existingInterview?.meetingLink || '',
  })

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const payload = {
        ...formData,
        applicationId: appId,
        scheduledAt: new Date(formData.scheduledAt).toISOString()
      }
      
      if (existingInterview) {
        await recruiterService.updateInterview(existingInterview.interviewId, payload)
      } else {
        await recruiterService.scheduleInterview(payload)
      }
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule interview')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <h3 className="text-h3">{existingInterview ? 'Update Interview' : 'Schedule Interview'}</h3>
        
        {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Round</label>
              <select name="round" className="input" value={formData.round} onChange={handleChange}>
                {ROUNDS.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Mode</label>
              <select name="mode" className="input" value={formData.mode} onChange={handleChange}>
                {MODES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Date & Time</label>
              <input type="datetime-local" name="scheduledAt" required className="input" 
                value={formData.scheduledAt} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Duration (mins)</label>
              <input type="number" name="durationMinutes" min="15" step="15" required className="input" 
                value={formData.durationMinutes} onChange={handleChange} />
            </div>
          </div>

          {formData.mode === 'ONLINE' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Meeting Link (optional)</label>
              <input type="url" name="meetingLink" className="input" placeholder="https://meet.google.com/..."
                value={formData.meetingLink} onChange={handleChange} />
            </div>
          ) : formData.mode === 'OFFLINE' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Location</label>
              <input type="text" name="location" className="input" placeholder="Room 402, Building A"
                value={formData.location} onChange={handleChange} />
            </div>
          ) : null}

          <div className="flex gap-3 justify-end pt-4">
            <button type="button" onClick={onClose} className="btn-ghost text-sm">Cancel</button>
            <button type="submit" className="btn-primary text-sm" disabled={loading}>
              {loading ? 'Saving…' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
