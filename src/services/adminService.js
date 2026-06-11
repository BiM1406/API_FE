import { mockDelay } from './api';
import { getCurrentUser, getUsers as readAuthUsers, saveUsers, syncUserSession } from './authService';
import { readProjects } from './projectService';
import { readPaymentHistory, calculateRevenue, calculateDailyRevenue } from './paymentService';
import { readArrayStorage } from '../utils/storage';
import { 
  SERVER_LOAD_PER_PROJECT, 
  SERVER_LOAD_MAX, 
  RECENT_TRANSACTIONS_LIMIT 
} from '../config/adminConfig';

const readApiHistory = () => readArrayStorage('api_fe_api_test_history', []);
const readConversations = () => readArrayStorage('api_fe_ai_conversations', []);

export function calculateOverviewStats() {
  const users = readAuthUsers();
  const projects = readProjects();
  const { revenue, count: paidCount } = calculateDailyRevenue();
  const apiCalls = readApiHistory().length;
  const aiUsage = readConversations().length;
  const payments = readPaymentHistory();

  const serverLoad = projects.length > 0 
    ? Math.min(SERVER_LOAD_MAX, projects.length * SERVER_LOAD_PER_PROJECT) 
    : null;

  return {
    totalUsers: users.length,
    totalProjects: projects.length,
    revenue,
    isRevenueEstimated: false,
    revenueSource: 'transactions',
    paidCount,
    apiCalls: apiCalls > 0 ? apiCalls : null,
    aiUsage,
    serverLoad,
    recentTransactions: payments.slice(0, RECENT_TRANSACTIONS_LIMIT)
  };
}

export async function getOverviewStats() {
  return mockDelay(calculateOverviewStats());
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
  const updated = users.find((user) => user.id === userId);
  if (updated) syncUserSession(updated);
  return mockDelay(updated);
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
  const users = readAuthUsers();
  const { total, isEstimated, transactions } = calculateRevenue(null, users);
  return mockDelay({ total, isEstimated, transactions });
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
  const users = readAuthUsers();
  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) throw new Error('Không tìm thấy người dùng');

  const updatedUser = {
    ...users[userIndex],
    ...payload,
    updatedAt: new Date().toISOString()
  };

  // Nếu vai trò chuyển thành ADMIN, reset gói cước về '--'
  if (updatedUser.role === 'ADMIN') {
    updatedUser.plan = '--';
  }

  users[userIndex] = updatedUser;
  saveUsers(users);
  syncUserSession(updatedUser); // Đồng bộ session nếu đây là user đang đăng nhập
  return mockDelay(updatedUser);
}

export async function resetUserPassword(userId) {
  const users = readAuthUsers();
  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) throw new Error('Không tìm thấy người dùng');

  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let newPass = '';
  for (let i = 0; i < 8; i++) {
    newPass += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const updatedUser = {
    ...users[userIndex],
    password: newPass,
    updatedAt: new Date().toISOString()
  };

  users[userIndex] = updatedUser;
  saveUsers(users);
  return mockDelay({ success: true, password: newPass });
}
