import api, { normalizeApiError, unwrap } from './api';
export {
  addMessage,
  clearMessages,
  createConversation,
  deleteConversation,
  getConversations,
  getMessages,
  renameConversation,
  saveMessages,
  sendMessage
} from './conversation.service';

export async function getWorkspace(projectId = 'default') {
  try {
    return unwrap(await api.get(`/projects/${projectId}/workspace`));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể tải workspace');
  }
}

export async function updateProjectSettings(projectId = 'default', payload) {
  try {
    return unwrap(await api.patch(`/projects/${projectId}/workspace`, payload));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể cập nhật workspace');
  }
}

export async function getEnvironmentVariables(projectId = 'default') {
  try {
    const payload = unwrap(await api.get(`/projects/${projectId}/environments`));
    const envs = Array.isArray(payload) ? payload : payload.items || payload.environments || [];
    const active = envs.find((env) => env.active) || envs[0];
    return active?.variables || [];
  } catch (error) {
    throw normalizeApiError(error, 'Không thể tải biến môi trường');
  }
}

export async function saveEnvironmentVariables(projectId = 'default', variables) {
  return updateProjectSettings(projectId, { variables });
}
