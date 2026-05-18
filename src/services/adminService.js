import { mockDelay } from './api';
import { getUsers, saveUsers } from './authService';
import { readProjects } from './projectService';

const readPaymentHistory = () => {
  try {
    return JSON.parse(localStorage.getItem('api_fe_payment_history') || '[]');
  } catch {
    return [];
  }
};

export async function getOverviewStats() {
  const users = getUsers();
  const projects = readProjects();
  const payments = readPaymentHistory();
  const revenue = payments
    .filter((payment) => payment.status === 'PAID')
    .reduce((total, payment) => total + Number(payment.amount || 0), 0);

  return mockDelay({
    totalUsers: users.length,
    totalProjects: projects.length,
    revenue,
    apiCalls: Number(localStorage.getItem('api_fe_api_call_count') || 0),
    serverLoad: 45,
    recentTransactions: payments.slice(0, 5)
  });
}

export async function getAdminUsers() {
  return mockDelay(getUsers().map(({ password: _password, ...user }) => user));
}

export async function updateUserStatus(userId, status) {
  const users = getUsers().map((user) => user.id === userId ? { ...user, status } : user);
  saveUsers(users);
  return mockDelay(users.find((user) => user.id === userId));
}

export async function deleteUser(userId) {
  const users = getUsers();
  const target = users.find((user) => user.id === userId);
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
    total: transactions.filter((item) => item.status === 'PAID').reduce((sum, item) => sum + Number(item.amount || 0), 0),
    transactions
  });
}
