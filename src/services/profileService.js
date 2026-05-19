import { mockDelay } from './api';
import { getCurrentUser, getToken, getUsers, saveAuth, saveUsers } from './authService';
import { addActivity } from './activityService';
import { readStorage, removeStorage, writeStorage } from '../utils/storage';

const SUBSCRIPTION_KEY = 'api_fe_subscription';
const SELECTED_PLAN_KEY = 'api_fe_selected_plan';

export const PLANS = [
  {
    planId: 'free',
    planName: 'Miễn Phí',
    price: 0,
    cycle: 'tháng',
    description: 'Gói miễn phí cho người dùng mới'
  },
  {
    planId: 'pro',
    planName: 'Pro',
    price: 199999,
    cycle: 'tháng',
    badge: 'PHỔ BIẾN',
    description: 'Gói nâng cao cho người dùng chuyên nghiệp'
  },
  {
    planId: 'ultra',
    planName: 'Ultra',
    price: 999999,
    cycle: 'tháng',
    description: 'Gói cao cấp với đầy đủ tính năng'
  }
];

const DEFAULT_SUBSCRIPTION = () => ({
  planId: 'free',
  planName: 'Miễn Phí',
  price: 0,
  cycle: 'tháng',
  status: 'ACTIVE',
  startedAt: new Date().toISOString(),
  expiredAt: null
});

const PLAN_LIMITS = {
  free: {
    projects: 1,
    apiRequestsPerDay: 100,
    aiMessagesPerMonth: 100,
    storageMb: 100
  },
  pro: {
    projects: 10,
    apiRequestsPerDay: 5000,
    aiMessagesPerMonth: 5000,
    storageMb: 2048
  },
  ultra: {
    projects: -1,
    apiRequestsPerDay: -1,
    aiMessagesPerMonth: -1,
    storageMb: 10240
  }
};

const requireUser = () => {
  const user = getCurrentUser();
  if (!user) throw new Error('Bạn chưa đăng nhập');
  return user;
};

const syncUserPlan = (subscription) => {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;

  const updatedUser = {
    ...currentUser,
    plan: subscription.planName,
    planId: subscription.planId
  };

  saveUsers(getUsers().map((user) => (user.id === currentUser.id ? { ...user, ...updatedUser } : user)));
  saveAuth(updatedUser, getToken() || 'mock-token');
  return updatedUser;
};

export async function getProfile() {
  return mockDelay(requireUser());
}

export async function updateProfile(payload) {
  const currentUser = requireUser();
  const email = payload.email?.trim() || currentUser.email;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Email không hợp lệ');

  const updated = {
    ...currentUser,
    name: payload.name?.trim() || currentUser.name,
    email,
    plan: payload.plan || currentUser.plan,
    phone: payload.phone || currentUser.phone,
    updatedAt: new Date().toISOString()
  };

  saveUsers(getUsers().map((user) => (user.id === currentUser.id ? { ...user, ...updated } : user)));
  saveAuth(updated, getToken() || 'mock-token');
  addActivity({ module: 'profile', action: 'Update profile', description: `${updated.email} cập nhật hồ sơ`, status: 'success' });
  return mockDelay(updated);
}

export async function changePassword(payload) {
  const currentUser = requireUser();
  if (!payload.currentPassword) throw new Error('Vui lòng nhập mật khẩu hiện tại');
  if (payload.newPassword !== payload.confirmPassword) throw new Error('Mật khẩu xác nhận không khớp');
  if (String(payload.newPassword || '').length < 6) throw new Error('Mật khẩu mới tối thiểu 6 ký tự');

  const users = getUsers();
  const fullUser = users.find((user) => user.id === currentUser.id);
  if (fullUser?.password && fullUser.password !== payload.currentPassword) throw new Error('Mật khẩu hiện tại không chính xác');

  saveUsers(users.map((user) => (user.id === currentUser.id ? { ...user, password: payload.newPassword } : user)));
  addActivity({ module: 'profile', action: 'Change password', description: `${currentUser.email} đổi mật khẩu`, status: 'success' });
  return mockDelay({ success: true });
}

export async function getSubscription() {
  return mockDelay(ensureDefaultSubscription());
}

export async function updateSubscription(payload) {
  const plan = {
    planId: payload.planId,
    planName: payload.planName || payload.plan,
    price: Number(payload.price || 0),
    cycle: payload.cycle || 'tháng',
    status: payload.status || 'ACTIVE',
    startedAt: payload.startedAt || new Date().toISOString(),
    activatedAt: payload.activatedAt,
    expiredAt: payload.expiredAt ?? null,
    paymentOrderCode: payload.paymentOrderCode
  };

  writeStorage(SUBSCRIPTION_KEY, plan);
  syncUserPlan(plan);
  addActivity({ module: 'profile', action: 'Update subscription', description: `Kích hoạt gói ${plan.planName}`, status: 'success' });
  return mockDelay(plan);
}

export function ensureDefaultSubscription() {
  const current = readStorage(SUBSCRIPTION_KEY, null);
  if (current?.planId) return current;
  return writeStorage(SUBSCRIPTION_KEY, DEFAULT_SUBSCRIPTION());
}

export async function activateSubscription(plan, payment) {
  if (!plan?.planId || plan.planId === 'free') {
    throw new Error('Gói thanh toán không hợp lệ');
  }

  const current = ensureDefaultSubscription();
  if (payment?.orderCode && current?.paymentOrderCode === payment.orderCode) {
    return mockDelay(current);
  }

  const activatedAt = new Date().toISOString();
  const subscription = {
    planId: plan.planId,
    planName: plan.planName,
    price: Number(plan.price ?? payment?.amount ?? 0),
    cycle: plan.cycle || payment?.cycle || 'tháng',
    status: 'ACTIVE',
    startedAt: activatedAt,
    activatedAt,
    expiredAt: null,
    paymentOrderCode: payment?.orderCode
  };

  writeStorage(SUBSCRIPTION_KEY, subscription);
  syncUserPlan(subscription);
  addActivity({
    module: 'Payment',
    action: 'Activate subscription',
    description: `Đã kích hoạt gói ${subscription.planName}`,
    status: 'success',
    metadata: { orderCode: payment?.orderCode, planId: subscription.planId }
  });

  return mockDelay(subscription);
}

export function isPlanActive(planId) {
  return ensureDefaultSubscription().planId === planId;
}

export function getPlanLimits(planId) {
  return PLAN_LIMITS[planId] || PLAN_LIMITS.free;
}

export function getSelectedPlan() {
  return readStorage(SELECTED_PLAN_KEY, null);
}

export function saveSelectedPlan(plan) {
  if (!plan?.planId) throw new Error('Gói dịch vụ không hợp lệ');
  return writeStorage(SELECTED_PLAN_KEY, plan);
}

export function clearSelectedPlan() {
  removeStorage(SELECTED_PLAN_KEY);
}

export async function getUsageStats() {
  const apiHistory = JSON.parse(localStorage.getItem('api_fe_api_test_history') || '[]');
  const conversations = JSON.parse(localStorage.getItem('api_fe_ai_conversations') || '[]');
  const schemas = JSON.parse(localStorage.getItem('api_fe_database_schemas') || '{}');
  const tableCount = Object.values(schemas).reduce((sum, schema) => sum + (schema.tables?.length || 0), 0);
  return mockDelay({
    apiRequests: apiHistory.length,
    aiConversations: conversations.length,
    databaseTables: tableCount,
    storageUsed: `${Math.round(JSON.stringify(localStorage).length / 1024)} KB`
  });
}
