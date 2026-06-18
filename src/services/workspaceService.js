import { mockDelay, get, post, patch, del } from './api';
import { createId, readArrayStorage, readObjectStorage, writeStorage } from '../utils/storage';
import { getActiveEnvironment } from './environmentService';

const WORKSPACES_KEY = 'api_fe_workspaces';
const CONVERSATIONS_KEY = 'api_fe_ai_conversations';
const MESSAGES_KEY = 'api_fe_ai_messages';
const LEGACY_WORKSPACE_KEY = 'ai_projects_v2';

const now = () => new Date().toISOString();
const readWorkspaces = () => readObjectStorage(WORKSPACES_KEY, {});
const saveWorkspaces = (data) => writeStorage(WORKSPACES_KEY, data);
const readConversations = () => readArrayStorage(CONVERSATIONS_KEY, []);
const saveConversations = (items) => writeStorage(CONVERSATIONS_KEY, items);
const readMessages = () => readObjectStorage(MESSAGES_KEY, {});
const saveAllMessages = (items) => writeStorage(MESSAGES_KEY, items);
const parseJsonObject = (json) => {
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
};

export const toUUID = (str) => {
  if (!str) return '00000000-0000-0000-0000-000000000000';
  const looseUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (looseUuidRegex.test(str)) return str;

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  
  const hex = Math.abs(hash).toString(16).padStart(8, '0') + 
              str.length.toString(16).padStart(4, '0') + 
              '40008000' + 
              Math.abs(hash * 31).toString(16).padStart(12, '0');
  
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
};

export async function getWorkspace(projectId = 'default') {
  const uuid = toUUID(projectId);
  try {
    const res = await get(`/projects/${uuid}/workspace`);
    let settings = { defaultMode: 'chat' };
    if (res.configJson) {
      settings = parseJsonObject(res.configJson);
    }
    return {
      projectId: res.projectId,
      settings,
      createdAt: res.createdAt,
      updatedAt: res.updatedAt
    };
  } catch {
    const workspaces = readWorkspaces();
    if (workspaces[projectId]) return mockDelay(workspaces[projectId]);
    const workspace = { projectId, settings: { defaultMode: 'chat' }, createdAt: now(), updatedAt: now() };
    workspaces[projectId] = workspace;
    saveWorkspaces(workspaces);
    return mockDelay(workspace);
  }
}

export async function getConversations(projectId = 'default') {
  const uuid = toUUID(projectId);
  try {
    const items = await get(`/projects/${uuid}/conversations`);
    return items.map(c => ({
      id: c.id,
      projectId: c.projectId,
      title: c.title,
      mode: c.mode,
      pinned: c.pinned,
      archived: c.archived,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    }));
  } catch {
    let conversations = readConversations().filter((item) => item.projectId === projectId);
    if (conversations.length === 0) {
      const legacy = readArrayStorage(LEGACY_WORKSPACE_KEY, []).find((project) => project.id === projectId || project.mpId === projectId);
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
}

export async function createConversation(projectId = 'default', payload = {}) {
  const uuid = toUUID(projectId);
  try {
    const res = await post(`/projects/${uuid}/conversations`, {
      title: payload.title || 'Đoạn chat mới',
      mode: payload.mode || 'chat'
    });
    return {
      id: res.id,
      projectId: res.projectId,
      title: res.title,
      mode: res.mode,
      pinned: res.pinned,
      archived: res.archived,
      createdAt: res.createdAt,
      updatedAt: res.updatedAt
    };
  } catch {
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
}

export async function renameConversation(conversationId, title) {
  const uuid = toUUID(conversationId);
  try {
    const res = await patch(`/conversations/${uuid}`, { title });
    return { success: true, conversation: res };
  } catch {
    saveConversations(readConversations().map((item) => item.id === conversationId ? { ...item, title, updatedAt: now() } : item));
    return mockDelay({ success: true });
  }
}

export async function deleteConversation(conversationId) {
  const uuid = toUUID(conversationId);
  try {
    await del(`/conversations/${uuid}`);
    return { success: true };
  } catch {
    saveConversations(readConversations().filter((item) => item.id !== conversationId));
    const messages = readMessages();
    delete messages[conversationId];
    saveAllMessages(messages);
    return mockDelay({ success: true });
  }
}

export async function getMessages(conversationId) {
  const uuid = toUUID(conversationId);
  try {
    const items = await get(`/conversations/${uuid}/messages`);
    return items.map(m => {
      let metadata = {};
      if (m.metadataJson) {
        metadata = parseJsonObject(m.metadataJson);
      }
      return {
        id: m.id,
        conversationId: m.conversationId,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
        timestamp: new Date(m.createdAt).getTime(),
        metadata
      };
    });
  } catch {
    return mockDelay(readMessages()[conversationId] || []);
  }
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
  const uuid = toUUID(conversationId);
  try {
    const res = await post(`/conversations/${uuid}/messages`, { content: message });
    let userMetadata = {};
    if (res.userMessage?.metadataJson) {
      userMetadata = parseJsonObject(res.userMessage.metadataJson);
    }
    let assistantMetadata = {};
    if (res.assistantMessage?.metadataJson) {
      assistantMetadata = parseJsonObject(res.assistantMessage.metadataJson);
    }

    const userMessage = {
      id: res.userMessage?.id || createId('message'),
      role: 'user',
      content: res.userMessage?.content || message,
      timestamp: res.userMessage?.createdAt ? new Date(res.userMessage.createdAt).getTime() : Date.now(),
      metadata: userMetadata
    };

    const assistantMessage = {
      id: res.assistantMessage?.id || createId('message'),
      role: 'assistant',
      content: res.assistantMessage?.content || '',
      timestamp: res.assistantMessage?.createdAt ? new Date(res.assistantMessage.createdAt).getTime() : Date.now(),
      metadata: assistantMetadata
    };

    return {
      userMessage,
      assistantMessage,
      conversationId
    };
  } catch {
    const userMessage = await addMessage(conversationId, { role: 'user', content: message });
    return mockDelay({ userMessage, conversationId }, 350);
  }
}
