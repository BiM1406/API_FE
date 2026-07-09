import api, { normalizeApiError, unwrap } from './api';

const ACTIVE_ENV_KEY = 'api_fe_active_environment';
const listFrom = (payload, key) => Array.isArray(payload) ? payload : payload?.[key] || payload?.items || [];
const readActiveMap = () => {
  try {
    return JSON.parse(localStorage.getItem(ACTIVE_ENV_KEY) || '{}');
  } catch {
    return {};
  }
};
const writeActiveMap = (value) => localStorage.setItem(ACTIVE_ENV_KEY, JSON.stringify(value));

export async function getEnvironments(projectId = 'default') {
  try {
    return listFrom(unwrap(await api.get(`/projects/${projectId}/environments`)), 'environments');
  } catch (error) {
    throw normalizeApiError(error, 'Không thể tải environments');
  }
}

export async function createEnvironment(projectId = 'default', payload = {}) {
  try {
    return unwrap(await api.post(`/projects/${projectId}/environments`, payload));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể tạo environment');
  }
}

export async function updateEnvironment(environmentId, payload) {
  try {
    return unwrap(await api.patch(`/environments/${environmentId}`, payload));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể cập nhật environment');
  }
}

export async function deleteEnvironment(environmentId) {
  try {
    return unwrap(await api.delete(`/environments/${environmentId}`));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể xóa environment');
  }
}

export async function setActiveEnvironment(projectId = 'default', environmentId) {
  const active = { ...readActiveMap(), [projectId]: environmentId };
  writeActiveMap(active);
  try {
    await api.put(`/projects/${projectId}/active-environment`, { environmentId });
  } catch (error) {
    throw normalizeApiError(error, 'Khong the cap nhat active environment');
  }
  return active;
}

export async function getActiveEnvironment(projectId = 'default') {
  try {
    const active = unwrap(await api.get(`/projects/${projectId}/active-environment`));
    if (active?.id) {
      writeActiveMap({ ...readActiveMap(), [projectId]: active.id });
    }
    return active;
  } catch {
    const envs = await getEnvironments(projectId);
    const activeId = readActiveMap()[projectId];
    return envs.find((env) => env.id === activeId) || envs.find((env) => env.active) || envs[0] || null;
  }
}

export async function addVariable(environmentId, variable) {
  try {
    return unwrap(await api.post(`/environments/${environmentId}/variables`, variable));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể thêm biến môi trường');
  }
}

export async function updateVariable(_environmentId, variableId, payload) {
  try {
    return unwrap(await api.patch(`/environment-variables/${variableId}`, payload));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể cập nhật biến môi trường');
  }
}

export async function deleteVariable(_environmentId, variableId) {
  try {
    return unwrap(await api.delete(`/environment-variables/${variableId}`));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể xóa biến môi trường');
  }
}

export function resolveVariables(text, environment) {
  return String(text || '').replace(/{{\s*([^}]+)\s*}}/g, (_, key) => {
    const variable = environment?.variables?.find((item) => item.enabled !== false && item.key === key.trim());
    return variable ? (variable.currentValue ?? variable.value ?? variable.initialValue ?? '') : `{{${key.trim()}}}`;
  });
}

export async function setVariableValue(projectId, key, value) {
  const env = await getActiveEnvironment(projectId);
  const variable = env?.variables?.find((item) => item.key === key);
  if (!variable) throw new Error('Không tìm thấy biến môi trường');
  return updateVariable(env.id, variable.id, { currentValue: value });
}
