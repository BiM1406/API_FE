import api, { normalizeApiError, unwrap } from './api';

const listFrom = (payload, key) => Array.isArray(payload) ? payload : payload?.[key] || payload?.items || [];

const normalizeVariables = (environment = []) => {
  if (Array.isArray(environment)) return environment;
  return environment?.variables || [];
};

export function resolveEnvironmentVariables(value, environment = []) {
  const variables = normalizeVariables(environment);
  return String(value || '').replace(/{{\s*([^}]+)\s*}}/g, (_, key) => {
    const cleanKey = key.trim();
    const match = variables.find((item) => item.enabled !== false && item.key === cleanKey);
    return match ? (match.currentValue ?? match.value ?? match.initialValue ?? '') : `{{${cleanKey}}}`;
  });
}

export function parseHeaders(headers = []) {
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers.filter((item) => item.key).map((item) => [item.key, item.value || '']));
  }
  if (headers && typeof headers === 'object') return headers;
  return {};
}

export function parseBody(body, bodyType = 'json') {
  if (!body) return undefined;
  if (bodyType === 'raw' || bodyType === 'text') return String(body);
  if (bodyType === 'json') return typeof body === 'string' ? JSON.parse(body) : body;
  return body;
}

export function validateRequestConfig(config) {
  if (!config?.url?.trim()) throw new Error('Vui long nhap URL');
  try {
    new URL(config.url);
  } catch {
    throw new Error('URL khong hop le. Hay nhap URL day du, vi du https://api.example.com/users hoac cau hinh {{baseUrl}}');
  }
  if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'].includes(config.method)) {
    throw new Error('HTTP method khong hop le');
  }
  return true;
}

export async function sendApiRequest(config) {
  validateRequestConfig(config);
  try {
    return unwrap(await api.post('/api-tester/send', config));
  } catch (error) {
    throw normalizeApiError(error, 'Khong the gui API test');
  }
}

export async function getRequestHistory(projectId = 'default') {
  try {
    return listFrom(unwrap(await api.get(`/projects/${projectId}/api-test-history`)), 'history');
  } catch (error) {
    throw normalizeApiError(error, 'Khong the tai lich su API test');
  }
}

export async function saveRequestHistory(item) {
  return item;
}

export async function clearRequestHistory(projectId = 'default') {
  try {
    return unwrap(await api.delete(`/projects/${projectId}/api-test-history`));
  } catch (error) {
    throw normalizeApiError(error, 'Khong the xoa lich su API test');
  }
}

export async function deleteRequestHistoryItem(historyId) {
  try {
    return unwrap(await api.delete(`/test-history/${historyId}`));
  } catch (error) {
    throw normalizeApiError(error, 'Khong the xoa muc lich su API test');
  }
}
