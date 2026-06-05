import { mockDelay } from './api';
import { addActivity } from './activityService';
import { createId, readStorage, removeStorage, writeStorage } from '../utils/storage';

const AUTH_KEYS = {
  AUTH: 'api_fe_auth',
  TOKEN: 'token',
  USER: 'api_fe_user',
  USERS: 'api_fe_users',
  PENDING_OTP: 'api_fe_pending_otp',
  RESET_EMAIL: 'api_fe_reset_email',
  USER_ROLE: 'userRole'
};

// SEED/DEMO data — chỉ dùng khi localStorage chưa có user nào.
// Không phải dữ liệu production. Ngày tháng tương đối để dễ nhận biết khi dev.
const _30daysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
const _25daysAgo = new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString();

const DEFAULT_USERS = [
  {
    id: 'admin-1',
    username: 'admin',
    name: 'Admin User',
    email: 'admin@example.com',
    password: '123456',
    role: 'ADMIN',
    plan: null,           // ADMIN không có gói cước
    status: 'ACTIVE',
    createdAt: _30daysAgo,
    lastLoginAt: null
  },
  {
    id: 'user-1',
    username: 'user',
    name: 'User Test',
    email: 'user@example.com',
    password: '123456',
    role: 'USER',
    plan: 'Free',         // Gói thật của tài khoản demo
    status: 'ACTIVE',
    createdAt: _25daysAgo,
    lastLoginAt: null
  }
];

const publicUser = (user) => {
  const { password: _password, ...safeUser } = user;
  return safeUser;
};

export const getUsers = () => {
  let users = readStorage(AUTH_KEYS.USERS, null);
  if (Array.isArray(users) && users.length > 0) {
    let updated = false;
    users = users.map(user => {
      // Normalize tên gói cũ sang tiếng Anh
      if (user.plan === 'Miễn Phí' || user.plan === 'miễn phí') {
        user.plan = 'Free';
        updated = true;
      }
      // Migration: đảm bảo field lastLoginAt tồn tại (null nếu chưa đăng nhập)
      if (!('lastLoginAt' in user)) {
        user.lastLoginAt = null;
        updated = true;
      }
      // Migration: ADMIN không có gói cước — chuẩn hóa về null
      if (user.role === 'ADMIN' && user.plan && user.plan !== '--') {
        user.plan = null;
        updated = true;
      }
      // Migration: Chuẩn hóa status cũ từ 'Active', 'Pending', 'Suspended' sang 'ACTIVE', 'PENDING', 'BANNED'
      if (user.status === 'Active') {
        user.status = 'ACTIVE';
        updated = true;
      } else if (user.status === 'Pending') {
        user.status = 'PENDING';
        updated = true;
      } else if (user.status === 'Suspended') {
        user.status = 'BANNED';
        updated = true;
      }
      return user;
    });
    if (updated) {
      writeStorage(AUTH_KEYS.USERS, users);
    }
    return users;
  }
  return writeStorage(AUTH_KEYS.USERS, DEFAULT_USERS);
};

export const saveUsers = (users) => writeStorage(AUTH_KEYS.USERS, users);

export function saveAuth(user, token) {
  writeStorage(AUTH_KEYS.AUTH, { user, token });
  writeStorage(AUTH_KEYS.USER, user);
  localStorage.setItem(AUTH_KEYS.TOKEN, token);
  localStorage.setItem(AUTH_KEYS.USER_ROLE, user.role === 'ADMIN' ? 'admin' : 'user');
}

/**
 * Đồng bộ session đang đăng nhập nếu userId trùng với user đang đăng nhập.
 * Gọi hàm này sau mỗi lần admin cập nhật thông tin user để tránh session cũ.
 */
export function syncUserSession(updatedUser) {
  const auth = readStorage(AUTH_KEYS.AUTH, null);
  if (!auth?.user) return; // chưa ai đăng nhập
  if (auth.user.id !== updatedUser.id) return; // không phải user đang đăng nhập

  const { password: _pw, ...safeUser } = updatedUser;
  writeStorage(AUTH_KEYS.AUTH, { ...auth, user: safeUser });
  writeStorage(AUTH_KEYS.USER, safeUser);
}

export function clearAuth() {
  removeStorage(AUTH_KEYS.AUTH);
  removeStorage(AUTH_KEYS.USER);
  localStorage.removeItem(AUTH_KEYS.TOKEN);
  localStorage.removeItem(AUTH_KEYS.USER_ROLE);
}

export function getToken() {
  return readStorage(AUTH_KEYS.AUTH, null)?.token || localStorage.getItem(AUTH_KEYS.TOKEN) || localStorage.getItem('api_fe_token');
}

export function getCurrentUser() {
  const sessionUser = readStorage(AUTH_KEYS.AUTH, null)?.user
    || readStorage(AUTH_KEYS.USER, null)
    || readStorage('currentUser', null);

  if (!sessionUser) return null;

  // Luôn lấy dữ liệu mới nhất từ danh sách users để tránh session cũ
  // (ví dụ: admin vừa đổi plan/role/status của user này)
  const allUsers = getUsers();
  const freshFromList = Array.isArray(allUsers)
    ? allUsers.find((u) => u.id === sessionUser.id)
    : null;

  // Merge: ưu tiên dữ liệu mới từ danh sách, giữ lại token-related fields từ session
  const user = freshFromList
    ? { ...sessionUser, ...freshFromList }
    : sessionUser;

  // Đảm bảo plan mặc định cho USER nếu vẫn trống
  if (!user.plan && user.role !== 'ADMIN') {
    user.plan = 'Free';
    const token = getToken() || 'mock-token';
    writeStorage(AUTH_KEYS.AUTH, { user, token });
    writeStorage(AUTH_KEYS.USER, user);

    if (Array.isArray(allUsers)) {
      writeStorage(AUTH_KEYS.USERS, allUsers.map(u => u.id === user.id ? { ...u, plan: 'Free' } : u));
    }

    const now = new Date();
    const expiredDate = new Date();
    expiredDate.setMonth(now.getMonth() + 1);
    writeStorage(`api_fe_subscription_${user.id}`, {
      planId: 'free',
      planName: 'Free',
      price: 0,
      cycle: 'monthly',
      status: 'ACTIVE',
      startedAt: now.toISOString(),
      expiredAt: expiredDate.toISOString()
    });
  }

  return user;
}

export function isAuthenticated() {
  return Boolean(getToken() && getCurrentUser());
}

export function getRole() {
  return getCurrentUser()?.role || null;
}

export function hasRole(role) {
  return getRole() === role;
}

export function isAdmin() {
  return hasRole('ADMIN');
}

export async function login(credentials) {
  const identifier = String(credentials.email || credentials.username || '').trim().toLowerCase();
  const password = String(credentials.password || '');
  if (!identifier || !password) throw new Error('Vui lòng nhập tài khoản và mật khẩu');

  const users = getUsers();
  const user = users.find((item) => (
    item.username.toLowerCase() === identifier || item.email.toLowerCase() === identifier
  ));

  if (!user || user.password !== password) throw new Error('Tài khoản hoặc mật khẩu không chính xác');
  if (user.status && user.status !== 'ACTIVE') throw new Error('Tài khoản đang bị khóa hoặc chưa xác thực');

  // Ghi nhận thời gian đăng nhập cuối vào bản ghi user
  const now = new Date().toISOString();
  const updatedUser = { ...user, lastLoginAt: now };
  saveUsers(users.map((u) => u.id === user.id ? updatedUser : u));

  const token = `mock-token-${user.id}-${Date.now()}`;
  const safeUser = publicUser(updatedUser);
  saveAuth(safeUser, token);
  addActivity({ module: 'auth', action: 'Login', description: `${safeUser.email} đăng nhập`, status: 'success' });
  return mockDelay({ user: safeUser, token });
}

export async function register(payload) {
  const users = getUsers();
  const email = String(payload.email || '').trim().toLowerCase();
  const username = String(payload.name || payload.username || '').trim();
  const password = String(payload.password || '');

  if (!username) throw new Error('Tên không được để trống');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Email không hợp lệ');
  if (password.length < 6) throw new Error('Mật khẩu tối thiểu 6 ký tự');
  if (users.some((user) => user.email.toLowerCase() === email)) throw new Error('Email đã được sử dụng');

  const user = {
    id: createId('user'),
    username,
    name: username,
    email,
    password,
    role: 'USER',
    plan: 'Free',
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };

  saveUsers([...users, user]);
  writeStorage(AUTH_KEYS.PENDING_OTP, { email, otp: '123456', createdAt: Date.now(), expiresAt: Date.now() + 10 * 60 * 1000 });
  addActivity({ module: 'auth', action: 'Register', description: `${email} đăng ký tài khoản`, status: 'success' });
  return mockDelay({ user: publicUser(user), requiresOtp: true });
}

export async function verifyOtp(payload) {
  const pending = readStorage(AUTH_KEYS.PENDING_OTP, null);
  const email = String(payload.email || pending?.email || '').trim().toLowerCase();
  const otp = String(payload.otp || '').trim();

  if (!pending || pending.email !== email || otp !== pending.otp) throw new Error('Mã OTP không hợp lệ. Mã mock là 123456');
  if (Date.now() > pending.expiresAt) throw new Error('Mã OTP đã hết hạn. Vui lòng gửi lại mã');

  saveUsers(getUsers().map((user) => (
    user.email.toLowerCase() === email ? { ...user, status: 'ACTIVE', updatedAt: new Date().toISOString() } : user
  )));
  removeStorage(AUTH_KEYS.PENDING_OTP);
  addActivity({ module: 'auth', action: 'Verify OTP', description: `${email} xác thực OTP`, status: 'success' });
  return mockDelay({ success: true });
}

export async function resendOtp(payload = {}) {
  const current = readStorage(AUTH_KEYS.PENDING_OTP, null);
  const email = String(payload.email || current?.email || '').trim().toLowerCase();
  if (!email) throw new Error('Không tìm thấy email để gửi lại OTP');
  writeStorage(AUTH_KEYS.PENDING_OTP, { email, otp: '123456', createdAt: Date.now(), expiresAt: Date.now() + 10 * 60 * 1000 });
  return mockDelay({ success: true, otp: '123456' });
}

export async function forgotPassword(email) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) throw new Error('Email không hợp lệ');
  if (!getUsers().some((user) => user.email.toLowerCase() === normalized)) throw new Error('Email không tồn tại trong hệ thống');
  localStorage.setItem(AUTH_KEYS.RESET_EMAIL, normalized);
  addActivity({ module: 'auth', action: 'Forgot password', description: `${normalized} yêu cầu đặt lại mật khẩu`, status: 'success' });
  return mockDelay({ success: true });
}

export async function resetPassword(payload) {
  const email = String(payload.email || localStorage.getItem(AUTH_KEYS.RESET_EMAIL) || '').trim().toLowerCase();
  const password = String(payload.password || payload.newPassword || '');
  if (!email) throw new Error('Không tìm thấy yêu cầu đặt lại mật khẩu');
  if (password.length < 6) throw new Error('Mật khẩu mới tối thiểu 6 ký tự');

  saveUsers(getUsers().map((user) => (
    user.email.toLowerCase() === email ? { ...user, password, updatedAt: new Date().toISOString() } : user
  )));
  localStorage.removeItem(AUTH_KEYS.RESET_EMAIL);
  addActivity({ module: 'auth', action: 'Reset password', description: `${email} đặt lại mật khẩu`, status: 'success' });
  return mockDelay({ success: true });
}

export function logout() {
  const user = getCurrentUser();
  clearAuth();
  addActivity({ module: 'auth', action: 'Logout', description: `${user?.email || 'User'} đăng xuất`, status: 'success' });
}
