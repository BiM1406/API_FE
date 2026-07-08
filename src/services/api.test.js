import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api } from './api';

describe('API Service', () => {
  const originalFetch = globalThis.fetch;
  const mockFetch = vi.fn();

  beforeEach(() => {
    globalThis.fetch = mockFetch;
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it('should make a GET request correctly', async () => {
    const mockData = { id: 1, name: 'Test' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: () => Promise.resolve(JSON.stringify(mockData)),
    });

    const result = await api.get('/users');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toMatch(/\/users$/);
    expect(mockFetch.mock.calls[0][1].method).toBe('GET');
    expect(result).toEqual(mockData);
  });

  it('should include Authorization header if token exists in localStorage', async () => {
    localStorage.setItem('token', 'fake-token');
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: () => Promise.resolve(JSON.stringify({})),
    });

    await api.get('/protected-route');

    const fetchOptions = mockFetch.mock.calls[0][1];
    expect(fetchOptions.headers.Authorization).toBe('Bearer fake-token');
  });

  it('should make a POST request with correct body and headers', async () => {
    const postData = { title: 'New Post' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: () => Promise.resolve(JSON.stringify({ success: true })),
    });

    await api.post('/posts', postData);

    const fetchOptions = mockFetch.mock.calls[0][1];
    expect(fetchOptions.method).toBe('POST');
    expect(fetchOptions.headers['Content-Type']).toBe('application/json');
    expect(fetchOptions.body).toBe(JSON.stringify(postData));
  });

  it('should throw an error when response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: () => Promise.resolve(JSON.stringify({ message: 'Bad Request Error' })),
    });

    await expect(api.get('/error-endpoint')).rejects.toThrow('Bad Request Error');
  });
});
