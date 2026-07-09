import api, { normalizeApiError, unwrap } from './api';

const listFrom = (payload, key) => Array.isArray(payload) ? payload : payload?.[key] || payload?.items || [];

export async function getConversations(projectId = 'default') {
  try {
    return listFrom(unwrap(await api.get(`/projects/${projectId}/conversations`)), 'conversations');
  } catch (error) {
    throw normalizeApiError(error, 'Không thể tải hội thoại');
  }
}

export async function createConversation(projectId = 'default', payload = {}) {
  try {
    return unwrap(await api.post(`/projects/${projectId}/conversations`, payload));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể tạo hội thoại');
  }
}

export async function renameConversation(conversationId, title) {
  try {
    return unwrap(await api.patch(`/conversations/${conversationId}`, { title }));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể đổi tên hội thoại');
  }
}

export async function deleteConversation(conversationId) {
  try {
    return unwrap(await api.delete(`/conversations/${conversationId}`));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể xóa hội thoại');
  }
}

export async function getMessages(conversationId) {
  try {
    return listFrom(unwrap(await api.get(`/conversations/${conversationId}/messages`)), 'messages');
  } catch (error) {
    throw normalizeApiError(error, 'Không thể tải tin nhắn');
  }
}

export async function addMessage(conversationId, message) {
  try {
    return unwrap(await api.post(`/conversations/${conversationId}/messages`, message));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể gửi tin nhắn');
  }
}

export async function saveMessages(conversationId, messages) {
  return Promise.all(messages.map((message) => addMessage(conversationId, message)));
}

export async function clearMessages() {
  return [];
}

export async function sendMessage(conversationId, message) {
  return addMessage(conversationId, { role: 'user', content: message });
}
