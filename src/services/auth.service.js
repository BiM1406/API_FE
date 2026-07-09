import api, { normalizeApiError, unwrap } from './api';

const AUTH_KEYS = {
  AUTH: 'api_fe_auth',
  TOKEN: 'token',
  USER: 'api_fe_user',
  USER_ROLE: 'userRole'
};

const normalizeUser = (payload = {}) => payload.user || payload.account || payload;
const normalizeToken = (payload = {}) => payload.token || payload.accessToken || payload.jwt;
const unwrapEnvelope = (payload = {}) => {
  if (payload && typeof payload === 'object' && 'success' in payload) {
    if (payload.success === false) {
      throw new Error(payload.message || 'Request failed');
    }

    return 'data' in payload ? payload.data ?? {} : payload;
  }

  return payload;
};

export function saveAuth(user, token) {
  if (user) {
    localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(AUTH_KEYS.AUTH, JSON.stringify({ user, token }));
    localStorage.setItem(AUTH_KEYS.USER_ROLE, user.role === 'ADMIN' ? 'admin' : 'user');
  }

  if (token) {
    localStorage.setItem(AUTH_KEYS.TOKEN, token);
  }
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEYS.AUTH);
  localStorage.removeItem(AUTH_KEYS.USER);
  localStorage.removeItem(AUTH_KEYS.TOKEN);
  localStorage.removeItem(AUTH_KEYS.USER_ROLE);
}

export function getToken() {
  return localStorage.getItem(AUTH_KEYS.TOKEN);
}

export function getCurrentUser() {
  try {
    const auth = JSON.parse(localStorage.getItem(AUTH_KEYS.AUTH) || 'null');
    if (auth?.user) return auth.user;
  } catch {
    // Ignore corrupted client session.
  }

  try {
    return JSON.parse(localStorage.getItem(AUTH_KEYS.USER) || 'null');
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getToken());
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
  try {
    const payload = unwrapEnvelope(unwrap(await api.post('/auth/login', credentials)));
    const token = normalizeToken(payload);
    if (token) {
      localStorage.setItem(AUTH_KEYS.TOKEN, token);
    }

    const user = normalizeUser(unwrap(await api.get('/auth/me')));
    saveAuth(user, token);
    return { ...payload, user, token };
  } catch (error) {
    throw normalizeApiError(error, 'Đăng nhập thất bại');
  }
}

export async function register(payload) {
  const registerPayload = {
    username: payload.username,
    email: payload.email,
    password: payload.password,
    confirmPassword: payload.confirmPassword
  };

  if (import.meta.env.DEV) {
    console.log('[auth.register] request payload', registerPayload);
  }

  try {
    return unwrapEnvelope(unwrap(await api.post('/auth/register', registerPayload)));
  } catch (error) {
    throw normalizeApiError(error, 'Đăng ký thất bại');
  }
}

export async function verifyOtp(payload) {
  try {
    return unwrap(await api.post('/auth/verify-otp', payload));
  } catch (error) {
    throw normalizeApiError(error, 'Xác thực OTP thất bại');
  }
}

export async function resendOtp(payload = {}) {
  try {
    return unwrap(await api.post('/auth/resend-otp', payload));
  } catch (error) {
    throw normalizeApiError(error, 'Gửi lại OTP thất bại');
  }
}

export async function forgotPassword(emailOrPayload) {
  const payload = typeof emailOrPayload === 'string' ? { email: emailOrPayload } : emailOrPayload;
  try {
    return unwrap(await api.post('/auth/forgot-password', payload));
  } catch (error) {
    throw normalizeApiError(error, 'Yêu cầu đặt lại mật khẩu thất bại');
  }
}

export async function resetPassword(payload) {
  try {
    return unwrap(await api.post('/auth/reset-password', payload));
  } catch (error) {
    throw normalizeApiError(error, 'Đặt lại mật khẩu thất bại');
  }
}

export async function logout() {
  try {
    await api.post('/auth/logout');
  } catch {
    // Client session still needs to be cleared when the server logout call fails.
  } finally {
    clearAuth();
  }
}

export async function fetchCurrentUser() {
  try {
    const payload = unwrap(await api.get('/auth/me'));
    const user = normalizeUser(payload);
    saveAuth(user, getToken());
    return user;
  } catch (error) {
    throw normalizeApiError(error, 'Không thể tải thông tin người dùng');
  }
}

export const getMe = fetchCurrentUser;

export async function getUsers() {
  try {
    const payload = unwrap(await api.get('/admin/users'));
    return Array.isArray(payload) ? payload : payload.items || payload.users || [];
  } catch (error) {
    throw normalizeApiError(error, 'Không thể tải danh sách người dùng');
  }
}

export function saveUsers() {
  return [];
}

export function syncUserSession(updatedUser) {
  saveAuth(updatedUser, getToken());
}
