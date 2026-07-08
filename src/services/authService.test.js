import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authService from './authService';
import { api } from './api';
import * as activityService from './activityService';

vi.mock('./api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn()
  },
  mockDelay: vi.fn((val) => Promise.resolve(val))
}));

vi.mock('./activityService', () => ({
  addActivity: vi.fn()
}));

describe('Auth Service', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('User Management', () => {
    it('should initialize default users if none exist', () => {
      const users = authService.getUsers();
      expect(users.length).toBe(2);
      expect(users[0].username).toBe('admin');
      expect(users[1].username).toBe('user');
    });

    it('should save and retrieve users correctly', () => {
      const mockUsers = [{ id: 'test-1', username: 'testuser', role: 'USER', email: 'test@example.com' }];
      authService.saveUsers(mockUsers);
      const users = authService.getUsers();
      expect(users.length).toBe(1);
      expect(users[0].username).toBe('testuser');
    });
  });

  describe('Session Management', () => {
    it('should save auth data and retrieve token', () => {
      const user = { id: 'u1', role: 'ADMIN' };
      authService.saveAuth(user, 'fake-token');
      expect(authService.getToken()).toBe('fake-token');
      expect(authService.isAdmin()).toBe(true);
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should clear auth data on logout', () => {
      authService.saveAuth({ id: 'u1', role: 'USER' }, 'fake-token');
      authService.logout();
      expect(authService.getToken()).toBeNull();
      expect(authService.isAuthenticated()).toBe(false);
      expect(activityService.addActivity).toHaveBeenCalled();
    });
  });

  describe('Authentication (Login/Register)', () => {
    it('should throw error on missing credentials', async () => {
      await expect(authService.login({})).rejects.toThrow('Vui lòng nhập tài khoản và mật khẩu');
    });

    it('should login successfully with BE mock when email is provided', async () => {
      api.post.mockResolvedValueOnce({
        success: true,
        data: { accessToken: 'be-token', refreshToken: 'be-refresh' }
      });
      api.get.mockResolvedValueOnce({
        data: { id: 'be-1', email: 'be@example.com', role: 'ADMIN' }
      });

      const result = await authService.login({ email: 'be@example.com', password: 'password123' });
      
      expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'be@example.com', password: 'password123' });
      expect(result.token).toBe('be-token');
      expect(result.user.email).toBe('be@example.com');
      expect(authService.getToken()).toBe('be-token');
    });

    it('should fallback to mock login if BE fails with network error', async () => {
      api.post.mockRejectedValueOnce(new Error('Failed to fetch')); // Simulate network error
      
      // Seed local user
      authService.saveUsers([{
        id: 'local-1',
        email: 'local@example.com',
        username: 'localuser',
        password: 'password123',
        status: 'ACTIVE',
        role: 'USER'
      }]);

      const result = await authService.login({ email: 'local@example.com', password: 'password123' });
      
      expect(result.token).toMatch(/^mock-token-local-1/);
      expect(result.user.email).toBe('local@example.com');
    });

    it('should register successfully via BE mock', async () => {
      api.post.mockResolvedValueOnce({ success: true });
      
      const result = await authService.register({
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123'
      });

      expect(api.post).toHaveBeenCalledWith('/auth/register', expect.any(Object));
      expect(result.requiresOtp).toBe(true);
      expect(result.email).toBe('new@example.com');
    });
  });

  describe('OTP and Password Reset', () => {
    it('should verify OTP successfully via BE', async () => {
      api.post.mockResolvedValueOnce({ success: true });
      const result = await authService.verifyOtp({ email: 'test@example.com', otp: '123456' });
      expect(api.post).toHaveBeenCalledWith('/auth/verify-otp', { email: 'test@example.com', otp: '123456' });
      expect(result.success).toBe(true);
    });

    it('should handle forgot password via BE', async () => {
      api.post.mockResolvedValueOnce({ success: true });
      const result = await authService.forgotPassword('test@example.com');
      expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'test@example.com' });
      expect(result.success).toBe(true);
    });

    it('should handle reset password via BE', async () => {
      api.post.mockResolvedValueOnce({ success: true });
      const result = await authService.resetPassword({ token: 'abc', newPassword: 'newpass' });
      expect(api.post).toHaveBeenCalledWith('/auth/reset-password', expect.any(Object));
      expect(result.success).toBe(true);
    });
  });
});
