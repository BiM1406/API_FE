import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as profileService from './profileService';
import { api } from './api';
import * as authService from './authService';


vi.mock('./api', () => ({
  api: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn()
  },
  mockDelay: vi.fn((val) => Promise.resolve(val))
}));

vi.mock('./authService', () => ({
  getCurrentUser: vi.fn(),
  getToken: vi.fn(),
  getUsers: vi.fn(() => []),
  saveAuth: vi.fn(),
  saveUsers: vi.fn()
}));

vi.mock('./activityService', () => ({
  addActivity: vi.fn()
}));

describe('Profile Service', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    authService.getCurrentUser.mockReturnValue({ id: 'u1', email: 'test@example.com', plan: 'Free' });
  });

  describe('getProfile', () => {
    it('should get profile from API', async () => {
      const mockProfile = { id: 'u1', email: 'api@example.com', plan: 'Pro' };
      api.get.mockResolvedValueOnce(mockProfile);

      const profile = await profileService.getProfile();
      
      expect(api.get).toHaveBeenCalledWith('/profile');
      expect(profile.email).toBe('api@example.com');
      expect(profile.plan).toBe('Pro');
    });

    it('should fallback to local currentUser if API fails', async () => {
      api.get.mockRejectedValueOnce(new Error('API Down'));

      const profile = await profileService.getProfile();
      
      expect(profile.email).toBe('test@example.com');
    });
  });

  describe('updateProfile', () => {
    it('should update profile via API', async () => {
      const payload = { name: 'New Name' };
      api.patch.mockResolvedValueOnce({ id: 'u1', email: 'test@example.com', name: 'New Name' });

      const updated = await profileService.updateProfile(payload);
      
      expect(api.patch).toHaveBeenCalledWith('/profile', expect.objectContaining(payload));
      expect(updated.name).toBe('New Name');
    });
  });

  describe('Subscription Management', () => {
    it('should get subscription from API', async () => {
      const mockSub = { planId: 'pro', planName: 'Pro' };
      api.get.mockResolvedValueOnce({ success: true, data: mockSub });

      const sub = await profileService.getSubscription();
      
      expect(api.get).toHaveBeenCalledWith('/subscription');
      expect(sub.planId).toBe('pro');
    });

    it('should fallback to ensureDefaultSubscription if API fails', async () => {
      api.get.mockRejectedValueOnce(new Error('API Down'));

      const sub = await profileService.getSubscription();
      expect(sub.planId).toBe('free'); // Default
    });
  });
});
