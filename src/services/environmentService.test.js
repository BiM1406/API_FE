import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as environmentService from './environmentService';
import { api } from './api';

vi.mock('./api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  }
}));

describe('Environment Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const DEFAULT_UUID = '00000000-0000-0000-0000-000000000000';
  const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

  describe('ensureUuid', () => {
    it('should use default UUID if invalid id is provided', async () => {
      api.get.mockResolvedValueOnce([]);
      await environmentService.getEnvironments('invalid-id');
      expect(api.get).toHaveBeenCalledWith(`/projects/${DEFAULT_UUID}/environments`);
    });

    it('should use the valid UUID if provided', async () => {
      api.get.mockResolvedValueOnce([]);
      await environmentService.getEnvironments(VALID_UUID);
      expect(api.get).toHaveBeenCalledWith(`/projects/${VALID_UUID}/environments`);
    });
  });

  describe('CRUD Operations', () => {
    it('should create an environment', async () => {
      const payload = { name: 'Dev' };
      api.post.mockResolvedValueOnce({ id: 1, ...payload });
      await environmentService.createEnvironment(VALID_UUID, payload);
      expect(api.post).toHaveBeenCalledWith(`/projects/${VALID_UUID}/environments`, payload);
    });

    it('should update an environment', async () => {
      const payload = { name: 'Prod' };
      api.patch.mockResolvedValueOnce({ id: 1, ...payload });
      await environmentService.updateEnvironment(1, payload);
      expect(api.patch).toHaveBeenCalledWith(`/environments/1`, payload);
    });

    it('should delete an environment', async () => {
      api.delete.mockResolvedValueOnce({ success: true });
      await environmentService.deleteEnvironment(1);
      expect(api.delete).toHaveBeenCalledWith(`/environments/1`);
    });
  });

  describe('Variables Management', () => {
    it('should add a variable', async () => {
      const payload = { key: 'API_URL', value: 'http://localhost' };
      api.post.mockResolvedValueOnce({ id: 1, ...payload });
      await environmentService.addVariable(1, payload);
      expect(api.post).toHaveBeenCalledWith(`/environments/1/variables`, payload);
    });

    it('should update a variable', async () => {
      const payload = { currentValue: 'http://prod' };
      api.patch.mockResolvedValueOnce({ id: 1, ...payload });
      await environmentService.updateVariable(1, 2, payload);
      expect(api.patch).toHaveBeenCalledWith(`/environments/variables/2`, payload);
    });

    it('should delete a variable', async () => {
      api.delete.mockResolvedValueOnce({ success: true });
      await environmentService.deleteVariable(1, 2);
      expect(api.delete).toHaveBeenCalledWith(`/environments/variables/2`);
    });
  });

  describe('resolveVariables', () => {
    const mockEnv = {
      variables: [
        { key: 'HOST', currentValue: 'localhost', enabled: true },
        { key: 'PORT', initialValue: '8080', enabled: true },
        { key: 'SECRET', currentValue: 'hidden', enabled: false },
      ]
    };

    it('should resolve currentValue if available', () => {
      const result = environmentService.resolveVariables('http://{{HOST}}', mockEnv);
      expect(result).toBe('http://localhost');
    });

    it('should resolve initialValue if currentValue is missing', () => {
      const result = environmentService.resolveVariables('port: {{PORT}}', mockEnv);
      expect(result).toBe('port: 8080');
    });

    it('should ignore disabled variables', () => {
      const result = environmentService.resolveVariables('secret={{SECRET}}', mockEnv);
      expect(result).toBe('secret={{SECRET}}'); // Unresolved placeholder remains
    });

    it('should handle missing variables by keeping placeholder', () => {
      const result = environmentService.resolveVariables('value={{UNKNOWN}}', mockEnv);
      expect(result).toBe('value={{UNKNOWN}}');
    });
  });

  describe('setVariableValue', () => {
    it('should set variable value when environment and variable exist', async () => {
      api.get.mockResolvedValueOnce({
        id: 1,
        variables: [{ id: 10, key: 'API_URL' }]
      });
      api.patch.mockResolvedValueOnce({ success: true });

      await environmentService.setVariableValue(VALID_UUID, 'API_URL', 'http://new-url');
      
      expect(api.patch).toHaveBeenCalledWith('/environments/variables/10', { currentValue: 'http://new-url' });
    });

    it('should throw error when environment or variable is not found', async () => {
      api.get.mockResolvedValueOnce({
        id: 1,
        variables: [{ id: 10, key: 'OTHER_KEY' }]
      });

      await expect(environmentService.setVariableValue(VALID_UUID, 'API_URL', 'value'))
        .rejects.toThrow('Không tìm thấy biến môi trường');
    });
  });
});
