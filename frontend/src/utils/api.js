import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
});

// Add token to requests if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (username, password) => api.post('/auth/login', { username, password });
export const verifyToken = () => api.get('/auth/verify');

// Tenants (protected)
export const getTenants = () => api.get('/tenants/all');
export const getTenant = (id) => api.get(`/tenants/${id}`);
export const deleteTenant = (id) => api.delete(`/tenants/${id}`);

// Tenant submission (public)
export const submitTenantForm = (formData) => api.post('/tenants/submit', formData);

// Agreements
export const downloadAgreement = (tenantId) => `${API_BASE}/agreements/download/${tenantId}`;
export const downloadAgreementFile = (tenantId) => api.get(`/agreements/download/${tenantId}`, { responseType: 'blob' });
export const getAgreementLogs = () => api.get('/agreements/logs');

export default api;