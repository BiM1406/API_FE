import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as mockServerService from './mockServerService';
import { api } from './api';

vi.mock('./api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}));

describe('Mock Server Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get mock endpoints', async () => {
    api.get.mockResolvedValueOnce({ data: [{ id: 'e1' }] });
    const endpoints = await mockServerService.getMockEndpoints('p1');
    expect(endpoints[0].id).toBe('e1');
  });

  it('should create mock endpoint', async () => {
    api.post.mockResolvedValueOnce({ data: { id: 'e2' } });
    const endpoint = await mockServerService.createMockEndpoint('p1', { method: 'GET' });
    expect(endpoint.id).toBe('e2');
  });

  it('should generate mock response', async () => {
    const res = await mockServerService.generateMockResponse({ statusCode: 201 });
    expect(res.statusCode).toBe(201);
    expect(res.responseBody).toContain('Mock Response');
  });
});
