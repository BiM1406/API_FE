import { mockDelay } from './api';
import { getCurrentUser, getUsers, saveAuth, saveUsers } from './authService';

export async function getProfile() {
  const user = getCurrentUser();
  if (!user) throw new Error('Bạn chưa đăng nhập');
  return mockDelay(user);
}

export async function updateProfile(payload) {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Bạn chưa đăng nhập');

  const updated = {
    ...currentUser,
    name: payload.name?.trim() || currentUser.name,
    email: payload.email?.trim() || currentUser.email,
    phone: payload.phone || currentUser.phone,
    updatedAt: new Date().toISOString()
  };

  const users = getUsers().map((user) => (
    user.id === currentUser.id ? { ...user, ...updated } : user
  ));
  saveUsers(users);
  saveAuth(updated, localStorage.getItem('token') || 'mock-token');
  return mockDelay(updated);
}

export async function changePassword(payload) {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Bạn chưa đăng nhập');
  if (payload.newPassword !== payload.confirmPassword) throw new Error('Mật khẩu xác nhận không khớp');
  if (payload.newPassword.length < 6) throw new Error('Mật khẩu mới tối thiểu 6 ký tự');

  const users = getUsers();
  const fullUser = users.find((user) => user.id === currentUser.id);
  if (fullUser?.password && fullUser.password !== payload.currentPassword) {
    throw new Error('Mật khẩu hiện tại không chính xác');
  }

  saveUsers(users.map((user) => (
    user.id === currentUser.id ? { ...user, password: payload.newPassword } : user
  )));
  return mockDelay({ success: true });
}

export async function getSubscription() {
  const user = getCurrentUser();
  return mockDelay({
    plan: user?.plan || 'Free',
    cycle: 'Hàng tháng',
    status: 'Active'
  });
}

export async function updateSubscription(payload) {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Bạn chưa đăng nhập');
  return updateProfile({ ...currentUser, plan: payload.plan });
}
