import axios from 'axios';
import toast from 'react-hot-toast';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 429) {
      const retryAfterSeconds = Number(
        error.response.data?.retryAfterSeconds ||
        error.response.headers?.['retry-after'] ||
        0
      );
      const suffix = retryAfterSeconds > 0 ? ` ${retryAfterSeconds} giây.` : '.';
      toast.error(`Bạn thao tác quá nhanh. Vui lòng thử lại sau${suffix}`, {
        id: 'rate-limit-429'
      });
    }
    return Promise.reject(error);
  }
);

export const unwrap = (response) => {
  const payload = response?.data;

  if (payload && typeof payload === 'object' && 'success' in payload) {
    if (payload.success === false) {
      throw new Error(payload.message || 'Request failed');
    }

    return payload.data ?? null;
  }

  return payload;
};

export const getErrorMessage = (error, fallback = 'Request failed') => (
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback
);

export const normalizeApiError = (error, fallback) => {
  const normalized = new Error(getErrorMessage(error, fallback));
  normalized.status = error?.response?.status;
  normalized.payload = error?.response?.data;
  normalized.retryAfterSeconds = Number(
    error?.response?.data?.retryAfterSeconds ||
    error?.response?.headers?.['retry-after'] ||
    0
  );
  return normalized;
};

export async function request(method, url, data, options = {}) {
  try {
    return unwrap(await api.request({ method, url, data, ...options }));
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export const get = (url, options) => request('GET', url, undefined, options);
export const post = (url, data, options) => request('POST', url, data, options);
export const put = (url, data, options) => request('PUT', url, data, options);
export const patch = (url, data, options) => request('PATCH', url, data, options);
export const del = (url, options) => request('DELETE', url, undefined, options);

export { api };
export default api;
