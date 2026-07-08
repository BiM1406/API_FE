import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as testService from './testService';


vi.mock('./authService', () => ({
  getCurrentUser: vi.fn()
}));

describe('Test Service', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('resolveEnvironmentVariables', () => {
    it('should resolve variables correctly', () => {
      const env = { variables: [{ key: 'HOST', currentValue: 'localhost', enabled: true }] };
      const result = testService.resolveEnvironmentVariables('http://{{HOST}}/api', env);
      expect(result).toBe('http://localhost/api');
    });

    it('should not resolve disabled variables', () => {
      const env = { variables: [{ key: 'HOST', currentValue: 'localhost', enabled: false }] };
      const result = testService.resolveEnvironmentVariables('http://{{HOST}}/api', env);
      expect(result).toBe('http://{{HOST}}/api');
    });
  });

  describe('parseHeaders', () => {
    it('should convert array to object', () => {
      const headers = [{ key: 'Content-Type', value: 'application/json' }];
      expect(testService.parseHeaders(headers)).toEqual({ 'Content-Type': 'application/json' });
    });
  });

  describe('validateRequestConfig', () => {
    it('should throw error for empty url', () => {
      expect(() => testService.validateRequestConfig({ url: '' })).toThrow('Vui lòng nhập URL');
    });

    it('should throw error for invalid url', () => {
      expect(() => testService.validateRequestConfig({ url: 'not-a-url' })).toThrow('URL không hợp lệ');
    });

    it('should throw error for invalid method', () => {
      expect(() => testService.validateRequestConfig({ url: 'http://localhost', method: 'INVALID' })).toThrow('HTTP method không hợp lệ');
    });

    it('should pass valid config', () => {
      expect(testService.validateRequestConfig({ url: 'http://localhost', method: 'GET' })).toBe(true);
    });
  });

  describe('sendApiRequest', () => {
    it('should send fetch request and return parsed data', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        status: 200,
        statusText: 'OK',
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: () => Promise.resolve(JSON.stringify({ success: true }))
      });

      const config = { url: 'http://localhost/api', method: 'GET', headers: [] };
      const res = await testService.sendApiRequest(config);

      expect(globalThis.fetch).toHaveBeenCalledWith('http://localhost/api', expect.any(Object));
      expect(res.data.success).toBe(true);
      expect(res.status).toBe(200);
    });

    it('should throw error on fetch failure', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network failure'));
      const config = { url: 'http://localhost/api', method: 'GET' };

      await expect(testService.sendApiRequest(config)).rejects.toThrow('Không thể gửi request');
    });
  });
});
