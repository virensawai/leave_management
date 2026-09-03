import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on login/register page
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ===== Auth API =====
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

// ===== Student API =====
export const studentAPI = {
  getDashboard: () => api.get('/student/dashboard'),
  submitLeave: (data) => api.post('/student/leaves', data),
  getMyLeaves: (params) => api.get('/student/leaves/my', { params }),
  getLeaveDetail: (id) => api.get(`/student/leaves/${id}`),
  cancelLeave: (id) => api.patch(`/student/leaves/${id}/cancel`),
};

// ===== HOD API =====
export const hodAPI = {
  getDashboard: () => api.get('/hod/dashboard'),
  getLeaves: (params) => api.get('/hod/leaves', { params }),
  getLeaveDetail: (id) => api.get(`/hod/leaves/${id}`),
  approveLeave: (id) => api.patch(`/hod/leaves/${id}/approve`),
  rejectLeave: (id, data) => api.patch(`/hod/leaves/${id}/reject`, data),
  getStudents: () => api.get('/hod/students'),
};

export default api;
