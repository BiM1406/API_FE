import { api } from './api';

const DEFAULT_PROJECT_UUID = '00000000-0000-0000-0000-000000000000';

const ensureUuid = (id) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) {
    return id;
  }
  return DEFAULT_PROJECT_UUID;
};

export async function getEnvironments(projectId = 'default') {
  return api.get(`/projects/${ensureUuid(projectId)}/environments`);
}

export async function createEnvironment(projectId = 'default', payload = {}) {
  return api.post(`/projects/${ensureUuid(projectId)}/environments`, payload);
}

export async function updateEnvironment(environmentId, payload) {
  return api.patch(`/environments/${environmentId}`, payload);
}

export async function deleteEnvironment(environmentId) {
  return api.delete(`/environments/${environmentId}`);
}

export async function setActiveEnvironment(projectId = 'default', environmentId) {
  return api.put(`/projects/${ensureUuid(projectId)}/active-environment`, { environmentId });
}

export async function getActiveEnvironment(projectId = 'default') {
  return api.get(`/projects/${ensureUuid(projectId)}/active-environment`);
}

export async function addVariable(environmentId, variable) {
  return api.post(`/environments/${environmentId}/variables`, variable);
}

export async function updateVariable(environmentId, variableId, payload) {
  return api.patch(`/environments/variables/${variableId}`, payload);
}

export async function deleteVariable(environmentId, variableId) {
  return api.delete(`/environments/variables/${variableId}`);
}

export function resolveVariables(text, environment) {
  return String(text || '').replace(/{{\s*([^}]+)\s*}}/g, (_, key) => {
    const variable = environment?.variables?.find((item) => item.enabled !== false && item.key === key.trim());
    return variable ? (variable.currentValue ?? variable.initialValue ?? '') : `{{${key.trim()}}}`;
  });
}

export async function setVariableValue(projectId, key, value) {
  const env = await getActiveEnvironment(projectId);
  const variable = env?.variables?.find((item) => item.key === key);
  if (!env || !variable) throw new Error('Không tìm thấy biến môi trường');
  return updateVariable(env.id, variable.id, { currentValue: value });
}
