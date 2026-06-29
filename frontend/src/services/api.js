import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Scan a prompt
export const scanPrompt = async (prompt) => {
  const response = await api.post('/scan', { prompt });
  return response.data;
};

// Get all logs
export const getLogs = async () => {
  const response = await api.get('/logs');
  return response.data;
};

// Get stats
export const getStats = async () => {
  const response = await api.get('/stats');
  return response.data;
};

// Get all rules
export const getRules = async () => {
  const response = await api.get('/rules');
  return response.data;
};

// Add new rule (requires admin password)
export const addRule = async (rule, adminPassword) => {
  const response = await api.post('/rules', rule, {
    headers: { 'X-Admin-Password': adminPassword }
  });
  return response.data;
};

// Delete rule (requires admin password)
export const deleteRule = async (id, adminPassword) => {
  const response = await api.delete(`/rules/${id}`, {
    headers: { 'X-Admin-Password': adminPassword }
  });
  return response.data;
};

// Toggle rule (requires admin password)
export const toggleRule = async (id, adminPassword) => {
  const response = await api.put(`/rules/${id}/toggle`, {}, {
    headers: { 'X-Admin-Password': adminPassword }
  });
  return response.data;
};

// Verify admin password
export const verifyAdminPassword = async (password) => {
  const response = await api.post('/auth/verify', { password });
  return response.data;
};

export default api;