import api, { normalizeApiError, unwrap } from './api';

const listFrom = (payload, key) => Array.isArray(payload) ? payload : payload?.[key] || payload?.items || [];

export async function getProjects() {
  try {
    return listFrom(unwrap(await api.get('/projects')), 'projects');
  } catch (error) {
    throw normalizeApiError(error, 'Không thể tải dự án');
  }
}

export async function getProjectById(id) {
  try {
    return unwrap(await api.get(`/projects/${id}`));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể tải dự án');
  }
}

export async function createProject(payload) {
  try {
    return unwrap(await api.post('/projects', payload));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể tạo dự án');
  }
}

export async function updateProject(id, payload) {
  try {
    return unwrap(await api.patch(`/projects/${id}`, payload));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể cập nhật dự án');
  }
}

export async function deleteProject(id) {
  try {
    return unwrap(await api.delete(`/projects/${id}`));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể xóa dự án');
  }
}

export async function duplicateProject(id) {
  try {
    return unwrap(await api.post(`/projects/${id}/duplicate`));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể nhân bản dự án');
  }
}

export async function searchProjects(keyword) {
  const projects = await getProjects();
  const value = String(keyword || '').trim().toLowerCase();
  if (!value) return projects;
  return projects.filter((project) => (
    project.name?.toLowerCase().includes(value) ||
    project.description?.toLowerCase().includes(value) ||
    project.type?.toLowerCase().includes(value)
  ));
}

export async function readProjects() {
  return getProjects();
}

export function saveProjects(projects) {
  return projects;
}
