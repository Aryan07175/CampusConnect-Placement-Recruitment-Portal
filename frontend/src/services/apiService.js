import api from './api'

export const authService = {
  register: (data) => api.post('/api/auth/register', data),
  login:    (data) => api.post('/api/auth/login', data),
}

export const studentService = {
  getProfile:    ()       => api.get('/api/student/profile'),
  upsertProfile: (data)   => api.put('/api/student/profile', data),
  uploadResume:  (file)   => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/api/student/profile/resume', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  getJobs:       (params) => api.get('/api/student/jobs', { params }),
  getJob:        (id)     => api.get(`/api/student/jobs/${id}`),
  apply:         (jobId, coverLetter) =>
    api.post(`/api/student/jobs/${jobId}/apply`, { coverLetter }),
  getApplications: (params) => api.get('/api/student/applications', { params }),
}

export const recruiterService = {
  getProfile:    ()       => api.get('/api/recruiter/profile'),
  upsertProfile: (data)   => api.put('/api/recruiter/profile', data),
  getJobs:       (params) => api.get('/api/recruiter/jobs', { params }),
  createJob:     (data)   => api.post('/api/recruiter/jobs', data),
  updateJob:     (id, d)  => api.put(`/api/recruiter/jobs/${id}`, d),
  deleteJob:     (id)     => api.delete(`/api/recruiter/jobs/${id}`),
  getApplications: (jobId, params) =>
    api.get(`/api/recruiter/jobs/${jobId}/applications`, { params }),
  updateStatus:  (appId, status, notes) =>
    api.patch(`/api/recruiter/applications/${appId}/status`, { status, notes }),
}

export const adminService = {
  getStats:         ()   => api.get('/api/admin/stats'),
  getUsers:         (p)  => api.get('/api/admin/users', { params: p }),
  toggleUser:       (id) => api.patch(`/api/admin/users/${id}/toggle`),
  deleteUser:       (id) => api.delete(`/api/admin/users/${id}`),
  getPendingRecruiters: () => api.get('/api/admin/recruiters/pending'),
  approveRecruiter: (id) => api.post(`/api/admin/recruiters/${id}/approve`),
}
