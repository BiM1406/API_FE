import api, { normalizeApiError, unwrap } from './api';
import { fetchCurrentUser, saveAuth, getToken } from './auth.service';
import {
  getPlans,
  getSubscription,
  updateSubscription,
  confirmPayment
} from './billing.service';
import { PLANS, PLAN_LIMITS } from '../pages/Payment/paymentConstants';

export { PLANS, getSubscription, updateSubscription };

export async function getProfile() {
  return fetchCurrentUser();
}

export async function updateProfile(payload) {
  try {
    const data = unwrap(await api.patch('/profile', payload));
    const user = data.user || data;
    saveAuth(user, getToken());
    return user;
  } catch (error) {
    throw normalizeApiError(error, 'Không thể cập nhật hồ sơ');
  }
}

export async function changePassword(payload) {
  const changePasswordPayload = {
    oldPassword: payload.oldPassword ?? payload.currentPassword,
    newPassword: payload.newPassword,
    confirmPassword: payload.confirmPassword
  };

  try {
    return unwrap(await api.patch('/profile/password', changePasswordPayload));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể đổi mật khẩu');
  }
}

export async function activateSubscription(plan, payment) {
  if (payment?.orderCode) {
    return confirmPayment(payment.orderCode);
  }
  return updateSubscription(plan);
}

export function isPlanActive(planId) {
  const user = JSON.parse(localStorage.getItem('api_fe_user') || 'null');
  return String(user?.planId || user?.plan || 'free').toLowerCase() === String(planId).toLowerCase();
}

export function getPlanLimits(planId) {
  return PLAN_LIMITS[planId] || PLAN_LIMITS.free;
}

export function getSelectedPlan() {
  try {
    return JSON.parse(sessionStorage.getItem('api_fe_selected_plan') || 'null');
  } catch {
    return null;
  }
}

export function saveSelectedPlan(plan) {
  sessionStorage.setItem('api_fe_selected_plan', JSON.stringify(plan));
  return plan;
}

export function clearSelectedPlan() {
  sessionStorage.removeItem('api_fe_selected_plan');
}

export async function getUsageStats() {
  const [plans, subscription] = await Promise.all([getPlans(), getSubscription()]);
  return {
    plans,
    subscription,
    apiRequests: subscription?.usage?.apiRequests ?? 0,
    aiConversations: subscription?.usage?.aiConversations ?? 0,
    databaseTables: subscription?.usage?.databaseTables ?? 0,
    storageUsed: subscription?.usage?.storageUsed ?? '--'
  };
}
