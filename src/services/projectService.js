import { mockDelay } from './api';
import { getCurrentUser } from './authService';
import { createId, readStorage, writeStorage } from '../utils/storage';

const PROJECTS_KEY = 'api_fe_projects';
export const LEGACY_PROJECTS_KEY = 'my_dashboard_projects';

const defaultProjects = [];

const normalizeProject = (project) => {
  const tags = project.tags || project.tech || ['API'];
  const projectId = project.id || createId('project');

  // 1. Calculate actual apiCount
  const collections = readStorage('api_fe_collections', []);
  const projectCollections = collections.filter((c) => c.projectId === projectId);
  let apiCount = 0;
  projectCollections.forEach((c) => {
    apiCount += (c.requests || []).length;
    (c.folders || []).forEach((f) => {
      apiCount += (f.requests || []).length;
    });
  });

  // 2. Calculate actual databaseTableCount
  const schemas = readStorage('api_fe_database_schemas', {});
  const projectSchema = schemas[projectId] || { tables: [] };
  const databaseTableCount = (projectSchema.tables || []).length;

  // 3. Calculate actual aiChatCount
  const conversations = readStorage('api_fe_ai_conversations', []);
  const projectConversations = conversations.filter((c) => c.projectId === projectId);
  const aiChatCount = projectConversations.length;

  return {
    id: projectId,
    name: project.name || 'Untitled Project',
    description: project.description || project.desc || '',
    type: project.type || 'API',
    status: project.status || 'Active',
    tags,
    tech: project.tech || tags,
    apiCount,
    databaseTableCount,
    aiChatCount,
    color: project.color || 'from-indigo-500 to-violet-500',
    ownerId: project.ownerId || getCurrentUser()?.id || 'user-1',
    createdAt: project.createdAt || new Date().toISOString(),
    updatedAt: project.updatedAt || new Date().toISOString()
  };
};

export function readProjects() {
  let current = readStorage(PROJECTS_KEY, null);
  if (Array.isArray(current)) {
    // Filter out the lifeless default projects by ID
    const filtered = current.filter(
      (p) => p.id !== 'mp-1' && p.id !== 'mp-2'
    );
    if (filtered.length !== current.length) {
      saveProjects(filtered);
    }
    return filtered.map(normalizeProject);
  }

  let legacy = readStorage(LEGACY_PROJECTS_KEY, null);
  if (Array.isArray(legacy)) {
    const filtered = legacy.filter(
      (p) => p.id !== 'mp-1' && p.id !== 'mp-2'
    );
    const projects = filtered.map(normalizeProject);
    saveProjects(projects);
    return projects;
  }

  const projects = defaultProjects;
  saveProjects(projects);
  return projects;
}

export function saveProjects(projects) {
  const normalized = projects.map(normalizeProject);
  writeStorage(PROJECTS_KEY, normalized);
  writeStorage(LEGACY_PROJECTS_KEY, normalized.map((project) => ({
    ...project,
    desc: project.description,
    updated: 'Vừa xong',
    activeColor: project.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'
  })));
  return normalized;
}

export async function getProjects() {
  return mockDelay(readProjects());
}

export async function getProjectById(id) {
  const project = readProjects().find((item) => item.id === id);
  if (!project) throw new Error('Không tìm thấy dự án');
  return mockDelay(project);
}

export async function createProject(payload) {
  const now = new Date().toISOString();
  const tags = payload.tags || payload.tech || ['API'];
  const project = normalizeProject({
    id: createId('project'),
    name: payload.name?.trim() || 'Dự án mới',
    description: payload.description?.trim() || 'Dự án API mới',
    type: payload.type || 'API',
    status: payload.status || 'Active',
    tags,
    tech: tags,
    apiCount: payload.apiCount || 0,
    databaseTableCount: payload.databaseTableCount || 0,
    aiChatCount: payload.aiChatCount || 0,
    color: payload.color || 'from-indigo-500 to-violet-500',
    ownerId: getCurrentUser()?.id || 'user-1',
    createdAt: now,
    updatedAt: now
  });
  saveProjects([project, ...readProjects()]);
  return mockDelay(project);
}

export async function updateProject(id, payload) {
  const projects = readProjects();
  const nextProjects = projects.map((project) => (
    project.id === id ? normalizeProject({ ...project, ...payload, updatedAt: new Date().toISOString() }) : project
  ));
  saveProjects(nextProjects);
  const updated = nextProjects.find((project) => project.id === id);
  if (!updated) throw new Error('Không tìm thấy dự án');
  return mockDelay(updated);
}

export async function deleteProject(id) {
  saveProjects(readProjects().filter((project) => project.id !== id));
  return mockDelay({ success: true });
}

export async function searchProjects(keyword) {
  const value = String(keyword || '').trim().toLowerCase();
  const projects = readProjects();
  if (!value) return mockDelay(projects);
  return mockDelay(projects.filter((project) => (
    project.name.toLowerCase().includes(value) ||
    project.description.toLowerCase().includes(value) ||
    project.type.toLowerCase().includes(value) ||
    (project.tags || []).some((tag) => tag.toLowerCase().includes(value))
  )));
}

export async function duplicateProject(id) {
  const source = readProjects().find((project) => project.id === id);
  if (!source) throw new Error('Không tìm thấy dự án');
  const now = new Date().toISOString();
  const clone = normalizeProject({
    ...source,
    id: createId('project'),
    name: `${source.name} Copy`,
    createdAt: now,
    updatedAt: now
  });
  saveProjects([clone, ...readProjects()]);
  return mockDelay(clone);
}

