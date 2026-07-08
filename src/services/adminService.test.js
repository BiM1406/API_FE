import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as adminService from './adminService';
import * as authService from './authService';

vi.mock('./authService', () => ({
  getCurrentUser: vi.fn(),
  getUsers: vi.fn(() => []),
  saveUsers: vi.fn(),
  syncUserSession: vi.fn()
}));

describe('Admin Service', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should calculate overview stats', () => {
    const stats = adminService.calculateOverviewStats();
    expect(stats.totalUsers).toBe(0);
    expect(stats.totalProjects).toBe(0);
  });

  it('should return mock overview stats', async () => {
    const stats = await adminService.getOverviewStats();
    expect(stats.totalUsers).toBe(0);
  });

  it('should return mock plans', async () => {
    const plans = await adminService.getPlans();
    expect(plans.length).toBe(3);
    expect(plans[0].id).toBe('free');
  });

  it('should throw error when changing role of current user', async () => {
    authService.getCurrentUser.mockReturnValue({ id: 'u1' });
    await expect(adminService.updateUserRole('u1', 'ADMIN')).rejects.toThrow('Không thể đổi role của chính tài khoản hiện tại');
  });
});
