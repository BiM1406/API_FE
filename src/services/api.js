const DEFAULT_BASE_URL = 'http://localhost:8080/api';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL;

const getAuthToken = () => {
  try {
    return localStorage.getItem('token') || localStorage.getItem('api_fe_token');
  } catch {
    return null;
  }
};

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();

  if (!text) {
    return null;
  }

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
  const headers = {
    Accept: 'application/json',
    ...(data instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    method,
    headers,
    body: data === undefined || data === null ? undefined : data instanceof FormData ? data : JSON.stringify(data),
    ...options
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    const message = typeof payload === 'object' && payload?.message ? payload.message : `HTTP ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

export const api = {
  get: (url, options) => request('GET', url, null, options),
  post: (url, data, options) => request('POST', url, data, options),
  put: (url, data, options) => request('PUT', url, data, options),
  patch: (url, data, options) => request('PATCH', url, data, options),
  delete: (url, options) => request('DELETE', url, null, options)
};

export const mockDelay = (value, delay = 350) => (
  new Promise((resolve) => {
    window.setTimeout(() => resolve(value), delay);
  })
);
