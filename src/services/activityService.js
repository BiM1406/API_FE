import api, { normalizeApiError, unwrap } from './api';
import { createId, readStorage, writeStorage } from '../utils/storage';

const ACTIVITY_KEY = 'api_fe_activity_history';
const LEGACY_ACTIVITY_KEY = 'activity_history';

const normalizeActivity = (activity) => {
  const actionObject = typeof activity.action === 'object' ? activity.action : null;
  return {
    id: activity.id || createId('activity'),
    module: activity.module || activity.type || activity.category || 'system',
    category: activity.category || activity.module || activity.type || 'system',
    action: actionObject?.title || activity.action || activity.title || 'Hoat dong',
    description: actionObject?.description || activity.description || '',
    status: actionObject?.status || activity.status || 'success',
    createdAt: activity.createdAt || activity.timestamp || Date.now(),
    timestamp: activity.timestamp || activity.createdAt || Date.now(),
    metadata: activity.metadata || {}
  };
};

const readAll = () => {
  const current = readStorage(ACTIVITY_KEY, null);
  if (Array.isArray(current)) return current.map(normalizeActivity);

  const legacy = readStorage(LEGACY_ACTIVITY_KEY, []);
  const normalized = Array.isArray(legacy) ? legacy.map(normalizeActivity) : [];
  writeStorage(ACTIVITY_KEY, normalized);
  return normalized;
};

const saveAll = (activities) => {
  const limited = activities.slice(0, 200);
  writeStorage(ACTIVITY_KEY, limited);
  writeStorage(LEGACY_ACTIVITY_KEY, limited);
  window.dispatchEvent(new CustomEvent('activityLogged'));
  return limited;
};

export function addActivity(categoryOrActivity, action) {
  const activity = typeof categoryOrActivity === 'object' && categoryOrActivity !== null
    ? normalizeActivity(categoryOrActivity)
    : normalizeActivity({ module: categoryOrActivity, category: categoryOrActivity, action });

  saveAll([activity, ...readAll()]);
  api.post('/activities', activity).catch(() => {});
  return activity;
}

export async function getActivities() {
  try {
    const payload = unwrap(await api.get('/activities'));
    const items = Array.isArray(payload) ? payload : payload?.items || [];
    return saveAll(items.map(normalizeActivity));
  } catch (error) {
    if (error?.response?.status) {
      throw normalizeApiError(error, 'Khong the tai lich su hoat dong');
    }
    return readAll();
  }
}

export function readActivities() {
  return readAll();
}

export function getActivityHistory() {
  return getActivities();
}

export function clearActivities() {
  localStorage.removeItem(ACTIVITY_KEY);
  localStorage.removeItem(LEGACY_ACTIVITY_KEY);
  window.dispatchEvent(new CustomEvent('activityLogged'));
  api.delete('/activities').catch(() => {});
}

export function deleteActivity(id) {
  saveAll(readAll().filter((activity) => activity.id !== id));
  api.delete(`/activities/${id}`).catch(() => {});
}

export function removeActivity(id) {
  deleteActivity(id);
}

export function filterActivities(filters = {}) {
  const normalizedFilters = typeof filters === 'string' ? { module: filters } : filters;
  const keyword = String(normalizedFilters.keyword || '').trim().toLowerCase();
  return readAll().filter((activity) => {
    const moduleMatch = !normalizedFilters.module || activity.module === normalizedFilters.module || activity.category === normalizedFilters.module;
    const statusMatch = !normalizedFilters.status || activity.status === normalizedFilters.status;
    const keywordMatch = !keyword || `${activity.action} ${activity.description} ${activity.module}`.toLowerCase().includes(keyword);
    return moduleMatch && statusMatch && keywordMatch;
  });
}
