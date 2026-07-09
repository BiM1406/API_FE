import api, { normalizeApiError, unwrap } from './api';

const listFrom = (payload, key) => Array.isArray(payload) ? payload : payload?.[key] || payload?.items || [];

export function calculateOverviewStats() {
  return null;
}

export async function getOverviewStats() {
  try {
    return unwrap(await api.get('/admin/overview'));
  } catch (error) {
    throw normalizeApiError(error, 'Khong the tai thong ke admin');
  }
}

export async function getUsers() {
  try {
    return listFrom(unwrap(await api.get('/admin/users')), 'users');
  } catch (error) {
    throw normalizeApiError(error, 'Khong the tai nguoi dung');
  }
}

export const getAdminUsers = getUsers;

export async function updateAdminUser(userId, payload) {
  try {
    return unwrap(await api.patch(`/admin/users/${userId}`, payload));
  } catch (error) {
    throw normalizeApiError(error, 'Khong the cap nhat nguoi dung');
  }
}

export async function updateUserStatus(userId, status) {
  try {
    return unwrap(await api.patch(`/admin/users/${userId}/status`, { status }));
  } catch (error) {
    throw normalizeApiError(error, 'Khong the cap nhat trang thai nguoi dung');
  }
}

export async function updateUserRole(userId, role) {
  try {
    return unwrap(await api.patch(`/admin/users/${userId}/role`, { role }));
  } catch (error) {
    throw normalizeApiError(error, 'Khong the cap nhat vai tro nguoi dung');
  }
}

export async function resetUserPassword(userId) {
  try {
    return unwrap(await api.post(`/admin/users/${userId}/reset-password`));
  } catch (error) {
    throw normalizeApiError(error, 'Khong the reset mat khau');
  }
}

export async function deleteUser(userId) {
  try {
    return unwrap(await api.delete(`/admin/users/${userId}`));
  } catch (error) {
    throw normalizeApiError(error, 'Khong the xoa nguoi dung');
  }
}

export async function getTransactions() {
  try {
    return listFrom(unwrap(await api.get('/payment-history')), 'payments');
  } catch (error) {
    throw normalizeApiError(error, 'Khong the tai giao dich');
  }
}

export async function getRevenue() {
  try {
    return unwrap(await api.get('/admin/revenue'));
  } catch (error) {
    throw normalizeApiError(error, 'Khong the tai doanh thu');
  }
}

export async function getAiUsage() {
  try {
    return unwrap(await api.get('/admin/ai-usage'));
  } catch (error) {
    throw normalizeApiError(error, 'Khong the tai thong ke AI');
  }
}

export async function getPlans() {
  try {
    return listFrom(unwrap(await api.get('/plans')), 'plans');
  } catch (error) {
    throw normalizeApiError(error, 'Khong the tai goi dich vu');
  }
}

export async function updatePlan(planId, payload = {}) {
  try {
    return unwrap(await api.patch(`/admin/plans/${planId}`, payload));
  } catch (error) {
    throw normalizeApiError(error, 'Khong the cap nhat goi dich vu');
  }
}
