import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as projectService from './projectService';
import { api } from './api';
import * as authService from './authService';

vi.mock('./api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  },
  mockDelay: vi.fn((val) => Promise.resolve(val))
}));

vi.mock('./authService', () => ({
  getCurrentUser: vi.fn()
}));

describe('Project Service', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    authService.getCurrentUser.mockReturnValue({ id: 'u1' });
  });

  describe('Read and Normalize', () => {
    it('should read projects from local storage and normalize them', () => {
      projectService.saveProjects([{ id: 'proj1', name: 'Legacy Project' }]);
      const projects = projectService.readProjects();
      expect(projects.length).toBe(1);
      expect(projects[0].name).toBe('Legacy Project');
      expect(projects[0].status).toBe('ACTIVE'); // check normalization
    });
  });

  describe('API Operations', () => {
    it('should get projects from API', async () => {
      const mockApiProjects = [{ id: 'p1', name: 'API Project' }];
      api.get.mockResolvedValueOnce({ data: mockApiProjects });

      const result = await projectService.getProjects();
      expect(api.get).toHaveBeenCalledWith('/projects');
      expect(result[0].name).toBe('API Project');
      expect(result[0].status).toBe('ACTIVE');
    });

    it('should fallback to local storage when get projects from API fails', async () => {
      api.get.mockRejectedValueOnce(new Error('Network Error'));
      projectService.saveProjects([{ id: 'local1', name: 'Local Project' }]);

      const result = await projectService.getProjects();
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Local Project');
    });

    it('should create project via API', async () => {
      const payload = { name: 'New Project', description: 'Desc' };
      api.post.mockResolvedValueOnce({ id: 'p2', ...payload });

      const result = await projectService.createProject(payload);
      expect(api.post).toHaveBeenCalledWith('/projects', expect.any(Object));
      expect(result.name).toBe('New Project');
    });

    it('should update project via API', async () => {
      const payload = { name: 'Updated Project' };
      api.patch.mockResolvedValueOnce({ id: 'p1', ...payload });

      const result = await projectService.updateProject('p1', payload);
      expect(api.patch).toHaveBeenCalledWith('/projects/p1', expect.any(Object));
      expect(result.name).toBe('Updated Project');
    });

    it('should delete project via API', async () => {
      api.delete.mockResolvedValueOnce({ success: true });
      projectService.saveProjects([{ id: 'p1', name: 'ToDelete' }]);

      const result = await projectService.deleteProject('p1');
      expect(api.delete).toHaveBeenCalledWith('/projects/p1');
      expect(result.success).toBe(true);
      expect(projectService.readProjects().length).toBe(0);
    });
  });

  describe('Search and Duplicate', () => {
    it('should search projects via API', async () => {
      api.get.mockResolvedValueOnce({ data: [{ id: 'p1', name: 'Found' }] });
      const result = await projectService.searchProjects('Found');
      expect(api.get).toHaveBeenCalledWith('/projects', { keyword: 'found' });
      expect(result[0].name).toBe('Found');
    });

    it('should duplicate project via API', async () => {
      api.post.mockResolvedValueOnce({ id: 'p2', name: 'Original Copy' });
      const result = await projectService.duplicateProject('p1');
      expect(api.post).toHaveBeenCalledWith('/projects/p1/duplicate');
      expect(result.name).toBe('Original Copy');
    });
  });
});
