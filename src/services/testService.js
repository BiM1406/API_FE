import { createId, readStorage, writeStorage } from '../utils/storage';

const HISTORY_KEY = 'api_fe_api_test_history';

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
  if (bodyType === 'json') {
    try {
      return JSON.stringify(typeof body === 'string' ? JSON.parse(body) : body);
    } catch {
      throw new Error('Body JSON không hợp lệ');
    }
  }
  return body;
}

export function validateRequestConfig(config) {
  if (!config?.url?.trim()) throw new Error('Vui lòng nhập URL');
  try {
    new URL(config.url);
  } catch {
    throw new Error('URL không hợp lệ. Hãy nhập URL đầy đủ, ví dụ https://api.example.com/users hoặc cấu hình {{baseUrl}}');
  }
  if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'].includes(config.method)) throw new Error('HTTP method không hợp lệ');
  return true;
}

export async function sendApiRequest(config) {
  validateRequestConfig(config);
  const startedAt = performance.now();
  const headers = parseHeaders(config.headers);
  const shouldSendBody = !['GET', 'HEAD'].includes(config.method);
  const body = shouldSendBody ? parseBody(config.body, config.bodyType || 'json') : undefined;

  try {
    const response = await fetch(config.url, { method: config.method, headers, body });
    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    return {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      duration: Math.round(performance.now() - startedAt),
      headers: Object.fromEntries(response.headers.entries()),
      data,
      size: new Blob([text]).size
    };
  } catch (error) {
    throw new Error(error.message?.includes('Failed to fetch')
      ? 'Không thể gửi request. Có thể URL sai, server không chạy hoặc bị chặn CORS/network.'
      : error.message || 'Request thất bại');
  }
}

export function getRequestHistory() {
  return readStorage(HISTORY_KEY, []);
}

import { getCurrentUser } from './authService';

export function saveRequestHistory(item) {
  const currentUser = getCurrentUser();
  const userId = currentUser ? currentUser.id : null;
  const history = [
    { 
      id: item.id || createId('request'), 
      createdAt: new Date().toISOString(), 
      userId, 
      ...item 
    }, 
    ...getRequestHistory()
  ].slice(0, 100);
  writeStorage(HISTORY_KEY, history);
  return history;
}

export function clearRequestHistory() {
  localStorage.removeItem(HISTORY_KEY);
  return [];
}

export function deleteRequestHistoryItem(id) {
  const next = getRequestHistory().filter((item) => item.id !== id);
  writeStorage(HISTORY_KEY, next);
  return next;
}

