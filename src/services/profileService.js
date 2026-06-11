import { mockDelay } from './api';
import { getCurrentUser, getToken, getUsers, saveAuth, saveUsers } from './authService';
import { addActivity } from './activityService';
import { readArrayStorage, readObjectStorage, removeStorage, writeStorage } from '../utils/storage';
import { PLANS, PLAN_LIMITS } from '../pages/Payment/paymentConstants';

const SUBSCRIPTION_KEY = 'api_fe_subscription';
const SELECTED_PLAN_KEY = 'api_fe_selected_plan';

const getSubscriptionKey = () => {
  const user = getCurrentUser();
  return user ? `api_fe_subscription_${user.id}` : SUBSCRIPTION_KEY;
};

export { PLANS };

const DEFAULT_SUBSCRIPTION = () => {
  const now = new Date();
  const expiredDate = new Date();
  expiredDate.setMonth(now.getMonth() + 1);
  return {
    planId: 'free',
    planName: 'Free',
    price: 0,
    cycle: 'tháng',
    status: 'ACTIVE',
    startedAt: now.toISOString(),
    expiredAt: expiredDate.toISOString()
  };
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
    avatar: payload.avatar || currentUser.avatar,
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
  const started = payload.startedAt || new Date().toISOString();
  let expired = payload.expiredAt;
  if (!expired) {
    const expiredDate = new Date(started);
    expiredDate.setMonth(expiredDate.getMonth() + 1);
    expired = expiredDate.toISOString();
  }
  const plan = {
    planId: payload.planId,
    planName: payload.planName || payload.plan,
    price: Number(payload.price || 0),
    cycle: payload.cycle || 'tháng',
    status: payload.status || 'ACTIVE',
    startedAt: started,
    activatedAt: payload.activatedAt,
    expiredAt: expired,
    paymentOrderCode: payload.paymentOrderCode
  };

  writeStorage(getSubscriptionKey(), plan);
  syncUserPlan(plan);
  addActivity({ module: 'profile', action: 'Update subscription', description: `Kích hoạt gói ${plan.planName}`, status: 'success' });
  return mockDelay(plan);
}

export function ensureDefaultSubscription() {
  const key = getSubscriptionKey();
  const current = readObjectStorage(key, null);
  const user = getCurrentUser();

  if (current?.planId) {
    let updated = false;
    if (current.planName === 'Miễn Phí') {
      current.planName = 'Free';
      updated = true;
    }
    if (!current.expiredAt) {
      const started = current.startedAt || new Date().toISOString();
      const expiredDate = new Date(started);
      expiredDate.setMonth(expiredDate.getMonth() + 1);
      current.expiredAt = expiredDate.toISOString();
      updated = true;
    }

    // Check expiration
    const expiredObj = new Date(current.expiredAt);
    if (!isNaN(expiredObj.getTime()) && expiredObj < new Date()) {
      if (current.planId !== 'free') {
        if (current.status === 'ACTIVE') {
          // Auto-renew: extend by 1 month
          const newStart = current.expiredAt;
          const newExpiredDate = new Date(newStart);
          newExpiredDate.setMonth(newExpiredDate.getMonth() + 1);
          current.startedAt = newStart;
          current.expiredAt = newExpiredDate.toISOString();
          updated = true;

          // Record payment transaction
          try {
            const history = readArrayStorage('api_fe_payment_history', []);
            const orderCode = `API_FE_PRO_${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}_${Math.floor(100000 + Math.random() * 900000)}`;
            const newTransaction = {
              id: 'pay_' + Math.random().toString(36).substr(2, 9),
              userId: user?.id || null,
              orderCode: orderCode,
              planId: current.planId,
              planName: current.planName,
              amount: current.price,
              paidAt: new Date().toISOString(),
              status: 'PAID'
            };
            history.unshift(newTransaction);
            writeStorage('api_fe_payment_history', history);
          } catch (e) {
            console.error('Failed to write billing history:', e);
          }
        } else {
          // Downgrade to free
          current.planId = 'free';
          current.planName = 'Free';
          current.price = 0;
          current.cycle = 'tháng';
          current.status = 'ACTIVE';
          current.startedAt = new Date().toISOString();
          current.expiredAt = null;
          updated = true;
        }
      }
    }

    if (updated) {
      writeStorage(key, current);
      syncUserPlan(current);
    }
    return current;
  }

  // Khởi tạo từ gói cước của người dùng nếu có sẵn
  if (user && user.plan && user.plan !== 'Free' && user.plan !== '--') {
    const now = new Date();
    const expiredDate = new Date();
    expiredDate.setMonth(now.getMonth() + 1);
    const initialSub = {
      planId: user.plan.toLowerCase(),
      planName: user.plan,
      price: user.plan === 'Pro' ? 199999 : (user.plan === 'Ultra' ? 999999 : 0),
      cycle: 'tháng',
      status: 'ACTIVE',
      startedAt: now.toISOString(),
      expiredAt: expiredDate.toISOString()
    };
    return writeStorage(key, initialSub);
  }

  return writeStorage(key, DEFAULT_SUBSCRIPTION());
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
  const expiredDate = new Date(activatedAt);
  expiredDate.setMonth(expiredDate.getMonth() + 1);
  const subscription = {
    planId: plan.planId,
    planName: plan.planName,
    price: Number(plan.price ?? payment?.amount ?? 0),
    cycle: plan.cycle || payment?.cycle || 'tháng',
    status: 'ACTIVE',
    startedAt: activatedAt,
    activatedAt,
    expiredAt: expiredDate.toISOString(),
    paymentOrderCode: payment?.orderCode
  };

  writeStorage(getSubscriptionKey(), subscription);
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
  return readObjectStorage(SELECTED_PLAN_KEY, null);
}

export function saveSelectedPlan(plan) {
  if (!plan?.planId) throw new Error('Gói dịch vụ không hợp lệ');
  return writeStorage(SELECTED_PLAN_KEY, plan);
}

export function clearSelectedPlan() {
  removeStorage(SELECTED_PLAN_KEY);
}

export async function getUsageStats() {
  const apiHistory = readArrayStorage('api_fe_api_test_history', []);
  const conversations = readArrayStorage('api_fe_ai_conversations', []);
  const schemas = readObjectStorage('api_fe_database_schemas', {});
  const tableCount = Object.values(schemas).reduce((sum, schema) => sum + (schema?.tables?.length || 0), 0);
  return mockDelay({
    apiRequests: apiHistory.length,
    aiConversations: conversations.length,
    databaseTables: tableCount,
    storageUsed: `${Math.round(JSON.stringify(localStorage).length / 1024)} KB`
  });
}
