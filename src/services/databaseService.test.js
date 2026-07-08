import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as databaseService from './databaseService';
import { api } from './api';

vi.mock('./api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}));

describe('Database Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get schema', async () => {
    api.get.mockResolvedValueOnce({ tables: [] });
    const schema = await databaseService.getSchema('p1');
    expect(schema.tables).toEqual([]);
    expect(api.get).toHaveBeenCalled();
  });

  it('should save schema', async () => {
    api.put.mockResolvedValueOnce({ success: true });
    await databaseService.saveSchema('p1', { name: 'public' });
    expect(api.put).toHaveBeenCalled();
  });

  it('should generate sql preview', () => {
    const schema = {
      tables: [{ name: 'users', columns: [{ name: 'id', type: 'UUID', primaryKey: true }] }]
    };
    const sql = databaseService.generateSqlPreview(schema);
    expect(sql).toContain('CREATE TABLE "users"');
    expect(sql).toContain('PRIMARY KEY');
  });
});
