import { mockDelay } from './api';

const AUTH_KEYS = {
  TOKEN: 'token',
  USER: 'api_fe_user',
  USERS: 'api_fe_users',
  PENDING_OTP: 'api_fe_pending_otp',
  USER_ROLE: 'userRole'
};

const DEFAULT_USERS = [
  {
    id: 'admin-1',
    username: 'admin',
    name: 'Admin User',
    email: 'admin@example.com',
    password: '123456',
    role: 'ADMIN',
    plan: 'Pro',
    status: 'Active',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'user-1',
    username: 'user',
    name: 'Khách Hàng',
    email: 'user@example.com',
    password: '123456',
    role: 'USER',
    plan: 'Free',
    status: 'Active',
    createdAt: '2026-01-02T00:00:00.000Z'
  }
];

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const getUsers = () => {
  const users = safeParse(localStorage.getItem(AUTH_KEYS.USERS), null);
  if (Array.isArray(users) && users.length > 0) {
    return users;
  }
  localStorage.setItem(AUTH_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
  return DEFAULT_USERS;
};

export const saveUsers = (users) => {
  localStorage.setItem(AUTH_KEYS.USERS, JSON.stringify(users));
  return users;
};

const publicUser = (user) => {
  const { password: _password, ...safeUser } = user;
  return safeUser;
};

export async function login(credentials) {
  const identifier = String(credentials.email || credentials.username || '').trim().toLowerCase();
  const password = String(credentials.password || '');

  const user = getUsers().find((item) => (
    item.username.toLowerCase() === identifier || item.email.toLowerCase() === identifier
  ));

  if (!user || user.password !== password) {
    throw new Error('Tài khoản hoặc mật khẩu không chính xác');
  }

  if (user.status && user.status !== 'Active') {
    throw new Error('Tài khoản đang bị khóa');
  }

  const token = `mock-token-${user.id}-${Date.now()}`;
  const safeUser = publicUser(user);
  saveAuth(safeUser, token);
  return mockDelay({ user: safeUser, token });
}

export async function register(payload) {
  const users = getUsers();
  const email = String(payload.email || '').trim().toLowerCase();
  const username = String(payload.name || payload.username || '').trim();

  if (users.some((user) => user.email.toLowerCase() === email)) {
    throw new Error('Email đã được sử dụng');
  }

  const user = {
    id: `user-${Date.now()}`,
    username,
    name: username,
    email,
    password: payload.password,
    role: 'USER',
    plan: 'Free',
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  saveUsers([...users, user]);
  localStorage.setItem(AUTH_KEYS.PENDING_OTP, JSON.stringify({ email, otp: '123456', createdAt: Date.now() }));
  return mockDelay({ user: publicUser(user), requiresOtp: true });
}

export async function verifyOtp(payload) {
  const pending = safeParse(localStorage.getItem(AUTH_KEYS.PENDING_OTP), null);

  if (!pending || pending.email !== payload.email || payload.otp !== pending.otp) {
    throw new Error('Mã OTP không hợp lệ. Mã mock là 123456');
  }

  const users = getUsers().map((user) => (
    user.email.toLowerCase() === pending.email.toLowerCase() ? { ...user, status: 'Active' } : user
  ));
  saveUsers(users);
  localStorage.removeItem(AUTH_KEYS.PENDING_OTP);
  return mockDelay({ success: true });
}

export async function forgotPassword(email) {
  const exists = getUsers().some((user) => user.email.toLowerCase() === String(email).trim().toLowerCase());
  if (!exists) {
    throw new Error('Email không tồn tại trong hệ thống');
  }
  localStorage.setItem('api_fe_reset_email', String(email).trim().toLowerCase());
  return mockDelay({ success: true });
}

export async function resetPassword(payload) {
  const email = payload.email || localStorage.getItem('api_fe_reset_email');
  if (!email) {
    throw new Error('Không tìm thấy yêu cầu đặt lại mật khẩu');
  }

  const users = getUsers().map((user) => (
    user.email.toLowerCase() === email.toLowerCase() ? { ...user, password: payload.password } : user
  ));
  saveUsers(users);
  localStorage.removeItem('api_fe_reset_email');
  return mockDelay({ success: true });
}

export function saveAuth(user, token) {
  localStorage.setItem(AUTH_KEYS.TOKEN, token);
  localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user));
  localStorage.setItem(AUTH_KEYS.USER_ROLE, user.role === 'ADMIN' ? 'admin' : 'user');
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEYS.TOKEN);
  localStorage.removeItem(AUTH_KEYS.USER);
  localStorage.removeItem(AUTH_KEYS.USER_ROLE);
}

export function logout() {
  clearAuth();
}

export function getCurrentUser() {
  return safeParse(localStorage.getItem(AUTH_KEYS.USER), null);
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem(AUTH_KEYS.TOKEN) && getCurrentUser());
}

export function getRole() {
  return getCurrentUser()?.role || null;
}
