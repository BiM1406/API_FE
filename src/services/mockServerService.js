import api, { normalizeApiError, unwrap } from './api';

const listFrom = (payload, key) => Array.isArray(payload) ? payload : payload?.[key] || payload?.items || [];

export async function getMockEndpoints(projectId = 'default') {
  try {
    return listFrom(unwrap(await api.get(`/projects/${projectId}/mock-endpoints`)), 'mockEndpoints');
  } catch (error) {
    throw normalizeApiError(error, 'Không thể tải mock endpoints');
  }
}

export async function createMockEndpoint(projectId = 'default', payload = {}) {
  try {
    return unwrap(await api.post(`/projects/${projectId}/mock-endpoints`, payload));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể tạo mock endpoint');
  }
}

export async function updateMockEndpoint(endpointId, payload) {
  try {
    return unwrap(await api.patch(`/mock-endpoints/${endpointId}`, payload));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể cập nhật mock endpoint');
  }
}

export async function deleteMockEndpoint(endpointId) {
  try {
    return unwrap(await api.delete(`/mock-endpoints/${endpointId}`));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể xóa mock endpoint');
  }
}

export async function generateMockResponse(payload = {}) {
  try {
    return unwrap(await api.post('/ai/chat', {
      mode: 'generate_mock_response',
      ...payload
    }));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể tạo mock response bằng AI');
  }
}

export async function exportMockEndpoints(projectId = 'default') {
  const endpoints = await getMockEndpoints(projectId);
  return JSON.stringify(endpoints, null, 2);
}
