import { mockDelay } from './api';
import { createId, readStorage, writeStorage } from '../utils/storage';
import { getActiveEnvironment } from './environmentService';

const WORKSPACES_KEY = 'api_fe_workspaces';
const CONVERSATIONS_KEY = 'api_fe_ai_conversations';
const MESSAGES_KEY = 'api_fe_ai_messages';
const LEGACY_WORKSPACE_KEY = 'ai_projects_v2';

const now = () => new Date().toISOString();
const readWorkspaces = () => readStorage(WORKSPACES_KEY, {});
const saveWorkspaces = (data) => writeStorage(WORKSPACES_KEY, data);
const readConversations = () => readStorage(CONVERSATIONS_KEY, []);
const saveConversations = (items) => writeStorage(CONVERSATIONS_KEY, items);
const readMessages = () => readStorage(MESSAGES_KEY, {});
const saveAllMessages = (items) => writeStorage(MESSAGES_KEY, items);

export async function getWorkspace(projectId = 'default') {
  const workspaces = readWorkspaces();
  if (workspaces[projectId]) return mockDelay(workspaces[projectId]);
  const workspace = { projectId, settings: { defaultMode: 'chat' }, createdAt: now(), updatedAt: now() };
  workspaces[projectId] = workspace;
  saveWorkspaces(workspaces);
  return mockDelay(workspace);
}

export async function getConversations(projectId = 'default') {
  let conversations = readConversations().filter((item) => item.projectId === projectId);
  if (conversations.length === 0) {
    const legacy = readStorage(LEGACY_WORKSPACE_KEY, []).find((project) => project.id === projectId || project.mpId === projectId);
    if (legacy?.chats?.length) {
      conversations = legacy.chats.map((chat) => ({
        id: chat.id,
        projectId,
        title: chat.title || 'Đoạn chat mới',
        mode: 'chat',
        createdAt: new Date(chat.createdAt || Date.now()).toISOString(),
        updatedAt: now()
      }));
      const messages = readMessages();
      legacy.chats.forEach((chat) => {
        messages[chat.id] = chat.messages || [];
      });
      saveConversations([...readConversations(), ...conversations]);
      saveAllMessages(messages);
    }
  }
  return mockDelay(conversations);
}

export async function createConversation(projectId = 'default', payload = {}) {
  const conversation = {
    id: createId('conversation'),
    projectId,
    title: payload.title || 'Đoạn chat mới',
    mode: payload.mode || 'chat',
    createdAt: now(),
    updatedAt: now()
  };
  saveConversations([conversation, ...readConversations()]);
  return mockDelay(conversation);
}

export async function renameConversation(conversationId, title) {
  saveConversations(readConversations().map((item) => item.id === conversationId ? { ...item, title, updatedAt: now() } : item));
  return mockDelay({ success: true });
}

export async function deleteConversation(conversationId) {
  saveConversations(readConversations().filter((item) => item.id !== conversationId));
  const messages = readMessages();
  delete messages[conversationId];
  saveAllMessages(messages);
  return mockDelay({ success: true });
}

export async function getMessages(conversationId) {
  return mockDelay(readMessages()[conversationId] || []);
}

export async function saveMessages(conversationId, messages) {
  const all = readMessages();
  all[conversationId] = messages;
  saveAllMessages(all);
  return mockDelay(messages);
}

export async function addMessage(conversationId, message) {
  const all = readMessages();
  const next = [...(all[conversationId] || []), { id: message.id || createId('message'), conversationId, createdAt: now(), ...message }];
  all[conversationId] = next;
  saveAllMessages(all);
  saveConversations(readConversations().map((item) => item.id === conversationId ? { ...item, updatedAt: now() } : item));
  return mockDelay(next[next.length - 1]);
}

export async function clearMessages(conversationId) {
  const all = readMessages();
  all[conversationId] = [];
  saveAllMessages(all);
  return mockDelay([]);
}

export async function getEnvironmentVariables(projectId = 'default') {
  const env = await getActiveEnvironment(projectId);
  return mockDelay((env?.variables || []).map((item) => ({
    key: item.key,
    value: item.currentValue ?? item.initialValue ?? '',
    ...item
  })));
}

export async function saveEnvironmentVariables(projectId = 'default', variables) {
  const workspaces = readWorkspaces();
  workspaces[projectId] = { ...(workspaces[projectId] || { projectId }), variables, updatedAt: now() };
  saveWorkspaces(workspaces);
  return mockDelay(variables);
}

export async function updateProjectSettings(projectId = 'default', payload) {
  const workspaces = readWorkspaces();
  workspaces[projectId] = {
    ...(workspaces[projectId] || { projectId }),
    settings: { ...(workspaces[projectId]?.settings || {}), ...payload },
    updatedAt: now()
  };
  saveWorkspaces(workspaces);
  return mockDelay(workspaces[projectId]);
}

export async function sendMessage(conversationId, message) {
  const userMessage = await addMessage(conversationId, { role: 'user', content: message });
  return mockDelay({ userMessage, conversationId }, 350);
}

