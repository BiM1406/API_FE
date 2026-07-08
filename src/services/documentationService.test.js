import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as documentationService from './documentationService';
import { api } from './api';

vi.mock('./api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn()
  }
}));

describe('Documentation Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get documentation', async () => {
    api.get.mockResolvedValueOnce({ endpoints: [] });
    const docs = await documentationService.getDocumentation('p1');
    expect(docs.endpoints).toEqual([]);
    expect(api.get).toHaveBeenCalled();
  });

  it('should generate documentation from collections', async () => {
    api.post.mockResolvedValueOnce({ success: true });
    await documentationService.generateDocumentationFromCollections('p1');
    expect(api.post).toHaveBeenCalled();
  });

  it('should export markdown', async () => {
    api.get.mockResolvedValueOnce('# API Docs');
    const md = await documentationService.exportMarkdown('p1');
    expect(md).toBe('# API Docs');
  });

  it('should export html', async () => {
    api.get.mockResolvedValueOnce('<h1>API</h1>');
    const html = await documentationService.exportHtml('p1');
    expect(html).toContain('&lt;h1&gt;API&lt;/h1&gt;');
  });
});
