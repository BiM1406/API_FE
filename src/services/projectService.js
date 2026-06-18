import { api, mockDelay } from './api';
import { getCurrentUser } from './authService';
import { createId, readArrayStorage, readObjectStorage, readStorage, writeStorage } from '../utils/storage';

const PROJECTS_KEY = 'api_fe_projects';
export const LEGACY_PROJECTS_KEY = 'my_dashboard_projects';

const defaultProjects = [];

const normalizeProject = (project) => {
  const tags = project.tags || project.tech || ['API'];
  const projectId = project.id || createId('project');

  // 1. Calculate actual apiCount
  const collections = readArrayStorage('api_fe_collections', []);
  const projectCollections = collections.filter((c) => c.projectId === projectId);
  let apiCount = 0;
  projectCollections.forEach((c) => {
    apiCount += (c.requests || []).length;
    (c.folders || []).forEach((f) => {
      apiCount += (f.requests || []).length;
    });
  });

  // 2. Calculate actual databaseTableCount
  const schemas = readObjectStorage('api_fe_database_schemas', {});
  const projectSchema = schemas[projectId] || { tables: [] };
  const databaseTableCount = (projectSchema.tables || []).length;

  // 3. Calculate actual aiChatCount
  const conversations = readArrayStorage('api_fe_ai_conversations', []);
  const projectConversations = conversations.filter((c) => c.projectId === projectId);
  const aiChatCount = projectConversations.length;

  return {
    id: projectId,
    name: project.name || 'Untitled Project',
    description: project.description || project.desc || '',
    type: project.type || 'API',
    status: project.status || 'ACTIVE',
    tags,
    tech: project.tech || tags,
    apiCount: project.apiCount !== undefined ? project.apiCount : apiCount,
    databaseTableCount: project.databaseTableCount !== undefined ? project.databaseTableCount : databaseTableCount,
    aiChatCount: project.aiChatCount !== undefined ? project.aiChatCount : aiChatCount,
    color: project.color || 'from-indigo-500 to-violet-500',
    ownerId: project.ownerId || getCurrentUser()?.id || 'user-1',
    createdAt: project.createdAt || new Date().toISOString(),
    updatedAt: project.updatedAt || new Date().toISOString()
  };
};

export function readProjects() {
  let current = readStorage(PROJECTS_KEY, null);
  if (Array.isArray(current)) {
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
    activeColor: project.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'
  })));
  return normalized;
}

export async function getProjects() {
  try {
    const response = await api.get('/projects');
    if (response) {
      const items = Array.isArray(response)
        ? response
        : Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.items)
            ? response.items
            : Array.isArray(response.content)
              ? response.content
              : [];
      return items.map(normalizeProject);
    }
  } catch (err) {
    console.error('Failed to get projects from backend, falling back to local:', err);
  }
  return mockDelay(readProjects());
}

export async function getProjectById(id) {
  try {
    const response = await api.get(`/projects/${id}`);
    if (response) {
      return normalizeProject(response);
    }
  } catch (err) {
    console.error(`Failed to get project ${id} from backend, falling back to local:`, err);
  }
  const project = readProjects().find((item) => item.id === id);
  if (!project) throw new Error('Không tìm thấy dự án');
  return mockDelay(project);
}

export async function createProject(payload) {
  try {
    const response = await api.post('/projects', {
      name: payload.name?.trim() || 'Dự án mới',
      description: payload.description?.trim() || 'Dự án API mới',
      type: payload.type || 'API',
      color: payload.color || 'from-indigo-500 to-violet-500'
    });
    if (response) {
      const created = normalizeProject(response);
      saveProjects([created, ...readProjects()]);
      return created;
    }
  } catch (err) {
    const isNetworkError = err?.message?.includes('fetch') || err?.message?.includes('NetworkError') || err?.message?.includes('Failed to fetch');
    if (!isNetworkError) {
      throw err;
    }
    console.error('Failed to create project in backend, falling back to local:', err);
  }

  // --- Fallback ---
  const now = new Date().toISOString();
  const tags = payload.tags || payload.tech || ['API'];
  const project = normalizeProject({
    id: createId('project'),
    name: payload.name?.trim() || 'Dự án mới',
    description: payload.description?.trim() || 'Dự án API mới',
    type: payload.type || 'API',
    status: payload.status || 'ACTIVE',
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
  try {
    const response = await api.patch(`/projects/${id}`, {
      name: payload.name,
      description: payload.description,
      type: payload.type,
      color: payload.color,
      status: payload.status
    });
    if (response) {
      const updated = normalizeProject(response);
      const projects = readProjects();
      const nextProjects = projects.map((project) => (project.id === id ? updated : project));
      saveProjects(nextProjects);
      return updated;
    }
  } catch (err) {
    const isNetworkError = err?.message?.includes('fetch') || err?.message?.includes('NetworkError') || err?.message?.includes('Failed to fetch');
    if (!isNetworkError) {
      throw err;
    }
    console.error(`Failed to update project ${id} in backend, falling back to local:`, err);
  }

  // --- Fallback ---
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
  try {
    await api.delete(`/projects/${id}`);
    saveProjects(readProjects().filter((project) => project.id !== id));
    return { success: true };
  } catch (err) {
    const isNetworkError = err?.message?.includes('fetch') || err?.message?.includes('NetworkError') || err?.message?.includes('Failed to fetch');
    if (!isNetworkError) {
      throw err;
    }
    console.error(`Failed to delete project ${id} in backend, falling back to local:`, err);
  }

  // --- Fallback ---
  saveProjects(readProjects().filter((project) => project.id !== id));
  return mockDelay({ success: true });
}

export async function searchProjects(keyword) {
  const value = String(keyword || '').trim().toLowerCase();
  try {
    const response = await api.get('/projects', { keyword: value });
    if (response) {
      const items = Array.isArray(response)
        ? response
        : Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.items)
            ? response.items
            : Array.isArray(response.content)
              ? response.content
              : [];
      return items.map(normalizeProject);
    }
  } catch (err) {
    console.error('Failed to search projects from backend, falling back to local:', err);
  }

  // --- Fallback ---
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
  try {
    const response = await api.post(`/projects/${id}/duplicate`);
    if (response) {
      const duplicated = normalizeProject(response);
      saveProjects([duplicated, ...readProjects()]);
      return duplicated;
    }
  } catch (err) {
    const isNetworkError = err?.message?.includes('fetch') || err?.message?.includes('NetworkError') || err?.message?.includes('Failed to fetch');
    if (!isNetworkError) {
      throw err;
    }
    console.error(`Failed to duplicate project ${id} in backend, falling back to local:`, err);
  }

  // --- Fallback ---
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
