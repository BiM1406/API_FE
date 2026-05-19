import { mockDelay } from './api';
import { createId, readStorage, writeStorage } from '../utils/storage';

const ENV_KEY = 'api_fe_environments';
const ACTIVE_KEY = 'api_fe_active_environment';

const readAll = () => readStorage(ENV_KEY, []);
const saveAll = (items) => writeStorage(ENV_KEY, items);
const readActiveMap = () => readStorage(ACTIVE_KEY, {});
const saveActiveMap = (value) => writeStorage(ACTIVE_KEY, value);
const now = () => new Date().toISOString();

const defaultEnvironment = (projectId) => ({
  id: createId('env'),
  projectId,
  name: 'Local',
  variables: [
    { id: createId('var'), key: 'baseUrl', initialValue: 'http://localhost:8080/api', currentValue: 'http://localhost:8080/api', type: 'text', enabled: true },
    { id: createId('var'), key: 'token', initialValue: 'mock-token', currentValue: 'mock-token', type: 'secret', enabled: true }
  ],
  createdAt: now(),
  updatedAt: now()
});

export async function getEnvironments(projectId = 'default') {
  let envs = readAll().filter((env) => env.projectId === projectId);
  if (envs.length === 0) {
    const env = defaultEnvironment(projectId);
    saveAll([env, ...readAll()]);
    setActiveEnvironment(projectId, env.id);
    envs = [env];
  }
  return mockDelay(envs);
}

export async function createEnvironment(projectId = 'default', payload = {}) {
  const env = { id: createId('env'), projectId, name: payload.name?.trim() || 'New Environment', variables: payload.variables || [], createdAt: now(), updatedAt: now() };
  saveAll([env, ...readAll()]);
  const active = readActiveMap();
  if (!active[projectId]) saveActiveMap({ ...active, [projectId]: env.id });
  return mockDelay(env);
}

export async function updateEnvironment(environmentId, payload) {
  const next = readAll().map((env) => env.id === environmentId ? { ...env, ...payload, updatedAt: now() } : env);
  saveAll(next);
  return mockDelay(next.find((env) => env.id === environmentId));
}

export async function deleteEnvironment(environmentId) {
  saveAll(readAll().filter((env) => env.id !== environmentId));
  return mockDelay({ success: true });
}

export function setActiveEnvironment(projectId = 'default', environmentId) {
  const active = { ...readActiveMap(), [projectId]: environmentId };
  saveActiveMap(active);
  return active;
}

export async function getActiveEnvironment(projectId = 'default') {
  const envs = await getEnvironments(projectId);
  const activeId = readActiveMap()[projectId] || envs[0]?.id;
  return mockDelay(envs.find((env) => env.id === activeId) || envs[0] || null);
}

export async function addVariable(environmentId, variable) {
  const nextVariable = { id: createId('var'), key: variable.key?.trim() || 'newVar', initialValue: variable.initialValue || '', currentValue: variable.currentValue ?? variable.value ?? '', type: variable.type || 'text', enabled: variable.enabled !== false };
  const next = readAll().map((env) => env.id === environmentId ? { ...env, variables: [...(env.variables || []), nextVariable], updatedAt: now() } : env);
  saveAll(next);
  return mockDelay(nextVariable);
}

export async function updateVariable(environmentId, variableId, payload) {
  const next = readAll().map((env) => env.id === environmentId
    ? { ...env, variables: (env.variables || []).map((variable) => variable.id === variableId ? { ...variable, ...payload } : variable), updatedAt: now() }
    : env);
  saveAll(next);
  return mockDelay({ success: true });
}

export async function deleteVariable(environmentId, variableId) {
  const next = readAll().map((env) => env.id === environmentId
    ? { ...env, variables: (env.variables || []).filter((variable) => variable.id !== variableId), updatedAt: now() }
    : env);
  saveAll(next);
  return mockDelay({ success: true });
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

