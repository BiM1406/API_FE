import { mockDelay } from './api';

const WORKSPACE_KEY = 'ai_projects_v2';

const readWorkspaces = () => {
  try {
    return JSON.parse(localStorage.getItem(WORKSPACE_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveWorkspaces = (workspaces) => {
  localStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspaces));
  return workspaces;
};

export async function getWorkspace(projectId) {
  return mockDelay(readWorkspaces().find((project) => project.id === projectId) || null);
}

export async function getConversations(projectId) {
  return mockDelay((await getWorkspace(projectId))?.chats || []);
}

export async function createConversation(projectId) {
  const chat = { id: `chat-${Date.now()}`, title: 'Đoạn chat mới', messages: [], createdAt: Date.now() };
  saveWorkspaces(readWorkspaces().map((project) => project.id === projectId ? { ...project, chats: [chat, ...(project.chats || [])], activeChatId: chat.id } : project));
  return mockDelay(chat);
}

export async function sendMessage(conversationId, message) {
  return mockDelay({
    userMessage: { id: `msg-${Date.now()}`, role: 'USER', content: message, timestamp: Date.now() },
    assistantMessage: {
      id: `msg-${Date.now()}-ai`,
      role: 'ASSISTANT',
      content: 'Đây là phản hồi mô phỏng. Khi tích hợp backend, hàm sendMessage sẽ gọi API thật.',
      timestamp: Date.now()
    },
    conversationId
  }, 650);
}

export async function renameConversation(conversationId, title) {
  const workspaces = readWorkspaces().map((project) => ({
    ...project,
    chats: (project.chats || []).map((chat) => chat.id === conversationId ? { ...chat, title } : chat)
  }));
  saveWorkspaces(workspaces);
  return mockDelay({ success: true });
}

export async function deleteConversation(conversationId) {
  const workspaces = readWorkspaces().map((project) => ({
    ...project,
    chats: (project.chats || []).filter((chat) => chat.id !== conversationId)
  }));
  saveWorkspaces(workspaces);
  return mockDelay({ success: true });
}

export async function saveEnvironmentVariables(projectId, variables) {
  saveWorkspaces(readWorkspaces().map((project) => project.id === projectId ? { ...project, envs: variables } : project));
  return mockDelay(variables);
}

export async function updateProjectSettings(projectId, payload) {
  saveWorkspaces(readWorkspaces().map((project) => project.id === projectId ? { ...project, ...payload } : project));
  return mockDelay(payload);
}
