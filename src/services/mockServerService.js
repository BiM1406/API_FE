import { api } from './api';

const DEFAULT_PROJECT_UUID = '00000000-0000-0000-0000-000000000000';

const ensureUuid = (id) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) {
    return id;
  }
  return DEFAULT_PROJECT_UUID;
};

export async function getMockEndpoints(projectId = 'default') {
  const response = await api.get(`/projects/${ensureUuid(projectId)}/mock-endpoints`);
  return response?.data || [];
}

export async function createMockEndpoint(projectId = 'default', payload = {}) {
  const response = await api.post(`/projects/${ensureUuid(projectId)}/mock-endpoints`, {
    method: payload.method || 'GET',
    path: payload.path || '/api/mock',
    statusCode: Number(payload.statusCode || 200),
    responseBody: payload.responseBody || '{\n  "success": true\n}'
  });
  return response?.data;
}

export async function updateMockEndpoint(endpointId, payload) {
  const response = await api.patch(`/mock-endpoints/${endpointId}`, {
    responseBody: payload.responseBody
  });
  return response?.data;
}

export async function deleteMockEndpoint(endpointId) {
  const response = await api.delete(`/mock-endpoints/${endpointId}`);
  return response;
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
  return response;
}

export async function exportMockEndpoints(projectId = 'default') {
  const endpoints = await getMockEndpoints(projectId);
  return JSON.stringify(endpoints, null, 2);
}
