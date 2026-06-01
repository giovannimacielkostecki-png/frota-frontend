// src/api/client.js
import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Injeta token em todo request ─────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('frota_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Trata erros globalmente ───────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('frota_token');
      localStorage.removeItem('frota_usuario');
      window.location.href = '/login';
      return Promise.reject(err);
    }
    const msg = err.response?.data?.erro || 'Erro ao comunicar com o servidor';
    toast.error(msg);
    return Promise.reject(err);
  }
);

export default api;
