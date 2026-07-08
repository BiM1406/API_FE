import { describe, it, expect, beforeEach } from 'vitest';
import * as collectionService from './collectionService';

describe('Collection Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should create and read collection', async () => {
    const col = await collectionService.createCollection('p1', { name: 'My Col' });
    expect(col.name).toBe('My Col');

    const all = await collectionService.getCollections('p1');
    expect(all.length).toBe(1);
    expect(all[0].id).toBe(col.id);
  });

  it('should update collection', async () => {
    const col = await collectionService.createCollection('p1', { name: 'Old' });
    const updated = await collectionService.updateCollection(col.id, { name: 'New' });
    expect(updated.name).toBe('New');
  });

  it('should delete collection', async () => {
    const col = await collectionService.createCollection('p1', { name: 'To Delete' });
    await collectionService.deleteCollection(col.id);
    const all = await collectionService.getCollections('p1');
    expect(all.length).toBe(0);
  });

  it('should create folder inside collection', async () => {
    const col = await collectionService.createCollection('p1', { name: 'Col' });
    const folder = await collectionService.createFolder(col.id, { name: 'My Folder' });
    expect(folder.name).toBe('My Folder');
  });
});
