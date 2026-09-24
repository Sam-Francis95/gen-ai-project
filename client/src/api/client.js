import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('careflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const unwrap = (response) => response.data?.data ?? response.data;

export const fetchReferrals = (params = {}) =>
  api.get('/referrals', { params }).then(unwrap);

export const fetchReferralById = (id) => api.get(`/referrals/${id}`).then(unwrap);

export const fetchReferralStats = () => api.get('/referrals/stats').then(unwrap);

export const createReferral = (data) => api.post('/referrals', data).then(unwrap);

export const updateReferralStatus = (id, data) => api.put(`/referrals/${id}/status`, data).then(unwrap);

// Feature 1: Patient Recovery Tracker
export const recordProgressNote = (data) => api.post('/discharge/progress-note', data).then(unwrap);
export const fetchProgressNotes = (referralId) => api.get(`/discharge/progress-notes/${referralId}`).then(unwrap);

// Feature 2: Health Insurance Claim Assistant
export const generateInsuranceClaim = (data) => api.post('/discharge/claim-assistant', data).then(unwrap);

// Feature 3: Multilingual Discharge Card
export const generateDischargeCard = (data) => api.post('/discharge/discharge-card', data).then(unwrap);

// Feature 4: Doctor Approval Checklist
export const approveDischarge = (data) => api.post('/discharge/approve', data).then(unwrap);
