import { mockDelay } from './api';
import { getCurrentUser } from './authService';

const PROJECTS_KEY = 'api_fe_projects';
export const LEGACY_PROJECTS_KEY = 'my_dashboard_projects';

const defaultProjects = [
  {
    id: 'mp-1',
    name: 'E-commerce API',
    description: 'Main microservice for the storefront',
    type: 'API',
    status: 'Active',
    tech: ['Node', 'PostgreSQL', 'Redis'],
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
    tech: ['Python', 'Vector DB', 'LLM'],
    color: 'from-violet-500 to-purple-500',
    ownerId: 'user-1',
    createdAt: '2026-04-06T08:00:00.000Z',
    updatedAt: '2026-05-18T06:00:00.000Z'
  }
];

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const normalizeLegacy = (project) => ({
  id: project.id || `project-${Date.now()}`,
  name: project.name || 'Untitled Project',
  description: project.description || project.desc || '',
  type: project.type || 'API',
  status: project.status || 'Active',
  tech: project.tech || ['API'],
  color: project.color || 'from-indigo-500 to-violet-500',
  ownerId: project.ownerId || getCurrentUser()?.id || 'user-1',
  createdAt: project.createdAt || new Date().toISOString(),
  updatedAt: project.updatedAt || new Date().toISOString()
});

export function readProjects() {
  const current = safeParse(localStorage.getItem(PROJECTS_KEY), null);
  if (Array.isArray(current)) {
    return current;
  }

  const legacy = safeParse(localStorage.getItem(LEGACY_PROJECTS_KEY), null);
  const projects = Array.isArray(legacy) ? legacy.map(normalizeLegacy) : defaultProjects;
  saveProjects(projects);
  return projects;
}

export function saveProjects(projects) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  localStorage.setItem(LEGACY_PROJECTS_KEY, JSON.stringify(projects.map((project) => ({
    ...project,
    desc: project.description,
    updated: 'Vừa xong',
    activeColor: project.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'
  }))));
  return projects;
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
  const projects = readProjects();
  const now = new Date().toISOString();
  const project = {
    id: `project-${Date.now()}`,
    name: payload.name?.trim() || 'Dự án mới',
    description: payload.description?.trim() || 'Dự án API mới',
    type: payload.type || 'API',
    status: 'Active',
    tech: payload.tech || ['API'],
    color: payload.color || 'from-indigo-500 to-violet-500',
    ownerId: getCurrentUser()?.id || 'user-1',
    createdAt: now,
    updatedAt: now
  };
  saveProjects([project, ...projects]);
  return mockDelay(project);
}

export async function updateProject(id, payload) {
  const projects = readProjects();
  const nextProjects = projects.map((project) => (
    project.id === id ? { ...project, ...payload, updatedAt: new Date().toISOString() } : project
  ));
  saveProjects(nextProjects);
  return mockDelay(nextProjects.find((project) => project.id === id));
}

export async function deleteProject(id) {
  const projects = readProjects().filter((project) => project.id !== id);
  saveProjects(projects);
  return mockDelay({ success: true });
}

export async function searchProjects(keyword) {
  const value = String(keyword || '').trim().toLowerCase();
  const projects = readProjects();
  if (!value) return mockDelay(projects);
  return mockDelay(projects.filter((project) => (
    project.name.toLowerCase().includes(value) ||
    project.description.toLowerCase().includes(value) ||
    project.type.toLowerCase().includes(value)
  )));
}
