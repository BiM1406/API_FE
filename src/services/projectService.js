import { mockDelay } from './api';
import { getCurrentUser } from './authService';
import { createId, readStorage, writeStorage } from '../utils/storage';

const PROJECTS_KEY = 'api_fe_projects';
export const LEGACY_PROJECTS_KEY = 'my_dashboard_projects';

const defaultProjects = [
  {
    id: 'mp-1',
    name: 'E-commerce API',
    description: 'Main microservice for the storefront',
    type: 'API',
    status: 'Active',
    tags: ['Node', 'PostgreSQL', 'Redis'],
    tech: ['Node', 'PostgreSQL', 'Redis'],
    apiCount: 12,
    databaseTableCount: 8,
    aiChatCount: 3,
    color: 'from-blue-500 to-indigo-500',
    ownerId: 'user-1',
    createdAt: '2026-04-01T08:00:00.000Z',
    updatedAt: '2026-05-18T08:00:00.000Z'
  },
  {
    id: 'mp-2',
    name: 'Support AI Bot',
    description: 'RAG-based customer support assistant',
    type: 'AI',
    status: 'Active',
    tags: ['Python', 'Vector DB', 'LLM'],
    tech: ['Python', 'Vector DB', 'LLM'],
    apiCount: 6,
    databaseTableCount: 4,
    aiChatCount: 9,
    color: 'from-violet-500 to-purple-500',
    ownerId: 'user-1',
    createdAt: '2026-04-06T08:00:00.000Z',
    updatedAt: '2026-05-18T06:00:00.000Z'
  }
];

const normalizeProject = (project) => {
  const tags = project.tags || project.tech || ['API'];
  return {
    id: project.id || createId('project'),
    name: project.name || 'Untitled Project',
    description: project.description || project.desc || '',
    type: project.type || 'API',
    status: project.status || 'Active',
    tags,
    tech: project.tech || tags,
    apiCount: Number(project.apiCount || 0),
    databaseTableCount: Number(project.databaseTableCount || 0),
    aiChatCount: Number(project.aiChatCount || 0),
    color: project.color || 'from-indigo-500 to-violet-500',
    ownerId: project.ownerId || getCurrentUser()?.id || 'user-1',
    createdAt: project.createdAt || new Date().toISOString(),
    updatedAt: project.updatedAt || new Date().toISOString()
  };
};

export function readProjects() {
  const current = readStorage(PROJECTS_KEY, null);
  if (Array.isArray(current)) return current.map(normalizeProject);

  const legacy = readStorage(LEGACY_PROJECTS_KEY, null);
  const projects = Array.isArray(legacy) ? legacy.map(normalizeProject) : defaultProjects;
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

