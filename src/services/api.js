const DEFAULT_BASE_URL = 'http://localhost:8080/api';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL;

const isAbsoluteUrl = (url) => /^https?:\/\//i.test(url);

const getAuthToken = () => {
  try {
    const auth = JSON.parse(localStorage.getItem('api_fe_auth') || 'null');
    return auth?.token || localStorage.getItem('token') || localStorage.getItem('api_fe_token');
  } catch {
    return localStorage.getItem('token') || localStorage.getItem('api_fe_token');
  }
};

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();
  if (!text) return null;

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export async function request(method, url, data, options = {}) {
  const token = getAuthToken();
  const isFormData = data instanceof FormData;
  const hasBody = data !== undefined && data !== null;
  const headers = {
    Accept: 'application/json',
    ...(hasBody && !isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(isAbsoluteUrl(url) ? url : `${API_BASE_URL}${url}`, {
    ...options,
    method,
    headers,
    body: hasBody ? (isFormData || typeof data === 'string' ? data : JSON.stringify(data)) : undefined
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    let message = `Request failed with HTTP ${response.status}`;
    if (typeof payload === 'object' && payload !== null) {
      if (Array.isArray(payload.errors) && payload.errors.length > 0) {
        message = payload.errors.join('\n');
      } else if (payload.message) {
        message = payload.message;
      }
    } else if (typeof payload === 'string' && payload) {
      message = payload;
    }
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export const get = (url, options) => request('GET', url, null, options);
export const post = (url, data, options) => request('POST', url, data, options);
export const put = (url, data, options) => request('PUT', url, data, options);
export const patch = (url, data, options) => request('PATCH', url, data, options);
export const del = (url, options) => request('DELETE', url, null, options);

export const api = { request, get, post, put, patch, delete: del, del };

export const mockDelay = (value, delay = 250) => (
  new Promise((resolve) => {
    window.setTimeout(() => resolve(value), delay);
  })
);

