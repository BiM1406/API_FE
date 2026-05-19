import { mockDelay } from './api';
import { getCurrentUser, getUsers as readAuthUsers, saveUsers } from './authService';
import { readProjects } from './projectService';

const readJson = (key, fallback = []) => {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
};

const readPaymentHistory = () => readJson('api_fe_payment_history', []);
const readApiHistory = () => readJson('api_fe_api_test_history', []);
const readConversations = () => readJson('api_fe_ai_conversations', []);

export async function getOverviewStats() {
  const users = readAuthUsers();
  const projects = readProjects();
  const payments = readPaymentHistory();
  const revenue = payments.filter((payment) => ['PAID', 'SUCCESS'].includes(payment.status)).reduce((total, payment) => total + Number(payment.amount || 0), 0);
  return mockDelay({
    totalUsers: users.length,
    totalProjects: projects.length,
    revenue,
    apiCalls: readApiHistory().length,
    aiUsage: readConversations().length,
    serverLoad: Math.min(95, 25 + projects.length * 3),
    recentTransactions: payments.slice(0, 5)
  });
}

export async function getUsers() {
  return mockDelay(readAuthUsers().map(({ password: _password, ...user }) => user));
}

export async function getAdminUsers() {
  return getUsers();
}

export async function updateUserStatus(userId, status) {
  const users = readAuthUsers().map((user) => user.id === userId ? { ...user, status, updatedAt: new Date().toISOString() } : user);
  saveUsers(users);
  return mockDelay(users.find((user) => user.id === userId));
}

export async function updateUserRole(userId, role) {
  const current = getCurrentUser();
  if (current?.id === userId) throw new Error('Không thể đổi role của chính tài khoản hiện tại');
  const users = readAuthUsers().map((user) => user.id === userId ? { ...user, role, updatedAt: new Date().toISOString() } : user);
  saveUsers(users);
  return mockDelay(users.find((user) => user.id === userId));
}

export async function deleteUser(userId) {
  const current = getCurrentUser();
  const users = readAuthUsers();
  const target = users.find((user) => user.id === userId);
  if (current?.id === userId) throw new Error('Không thể xóa tài khoản đang đăng nhập');
  if (target?.role === 'ADMIN') throw new Error('Không thể xóa tài khoản admin');
  saveUsers(users.filter((user) => user.id !== userId));
  return mockDelay({ success: true });
}

export async function getTransactions() {
  return mockDelay(readPaymentHistory());
}

export async function getRevenue() {
  const transactions = readPaymentHistory();
  return mockDelay({
    total: transactions.filter((item) => ['PAID', 'SUCCESS'].includes(item.status)).reduce((sum, item) => sum + Number(item.amount || 0), 0),
    transactions
  });
}

export async function getAiUsage() {
  const conversations = readConversations();
  return mockDelay({ total: conversations.length, byUser: [] });
}

export async function getPlans() {
  return mockDelay([
    { id: 'free', name: 'Free', price: 0, limits: { ai: 100, requests: 500 } },
    { id: 'pro', name: 'Pro', price: 199999, limits: { ai: 5000, requests: 50000 } },
    { id: 'enterprise', name: 'Enterprise', price: 0, limits: { ai: 'custom', requests: 'custom' } }
  ]);
}

export async function updatePlan(planId, payload) {
  return mockDelay({ id: planId, ...payload, updatedAt: new Date().toISOString() });
}


export async function updateAdminUser(userId, payload) {
  return mockDelay({ id: userId, ...payload, updatedAt: new Date().toISOString() });
}
