import { mockDelay } from './api';
import { createId, readArrayStorage, writeStorage } from '../utils/storage';

const MOCK_KEY = 'api_fe_mock_endpoints';

const readAll = () => readArrayStorage(MOCK_KEY, []);
const saveAll = (items) => writeStorage(MOCK_KEY, items);
const now = () => new Date().toISOString();

const validateEndpoint = (endpoint) => {
  if (!endpoint.path?.trim()) throw new Error('Path không được để trống');
  if (!endpoint.path.startsWith('/')) throw new Error('Path phải bắt đầu bằng /');
  if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(endpoint.method)) throw new Error('Method không hợp lệ');
  const status = Number(endpoint.statusCode);
  if (status < 100 || status > 599) throw new Error('Status code không hợp lệ');
};

export async function getMockEndpoints(projectId = 'default') {
  return mockDelay(readAll().filter((endpoint) => endpoint.projectId === projectId));
}

export async function createMockEndpoint(projectId = 'default', payload = {}) {
  const endpoint = {
    id: createId('mock'),
    projectId,
    method: payload.method || 'GET',
    path: payload.path || '/api/mock',
    statusCode: Number(payload.statusCode || 200),
    delay: Number(payload.delay || 0),
    responseHeaders: payload.responseHeaders || [{ key: 'Content-Type', value: 'application/json' }],
    responseBody: payload.responseBody || '{\n  "success": true\n}',
    enabled: payload.enabled !== false,
    createdAt: now(),
    updatedAt: now()
  };
  validateEndpoint(endpoint);
  saveAll([endpoint, ...readAll()]);
  return mockDelay(endpoint);
}

export async function updateMockEndpoint(endpointId, payload) {
  let updated;
  const next = readAll().map((endpoint) => {
    if (endpoint.id !== endpointId) return endpoint;
    updated = { ...endpoint, ...payload, updatedAt: now() };
    validateEndpoint(updated);
    return updated;
  });
  saveAll(next);
  return mockDelay(updated);
}

export async function deleteMockEndpoint(endpointId) {
  saveAll(readAll().filter((endpoint) => endpoint.id !== endpointId));
  return mockDelay({ success: true });
}

export async function generateMockResponse(payload = {}) {
  const response = {
    statusCode: payload.statusCode || 200,
    responseBody: JSON.stringify({
      id: 'mock-1',
      name: 'Mock Response',
      status: 'ok',
      generatedAt: new Date().toISOString()
    }, null, 2)
  };
  return mockDelay(response);
}

export async function exportMockEndpoints(projectId = 'default') {
  const endpoints = await getMockEndpoints(projectId);
  return mockDelay(JSON.stringify(endpoints, null, 2));
}

