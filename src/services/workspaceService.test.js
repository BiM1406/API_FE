import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as workspaceService from './workspaceService';
import { get, post, patch, del } from './api';

vi.mock('./api', () => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  del: vi.fn(),
  mockDelay: vi.fn((val) => Promise.resolve(val))
}));

describe('Workspace Service', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Workspace Methods', () => {
    it('should get workspace via API', async () => {
      get.mockResolvedValueOnce({ projectId: 'p1', configJson: '{"defaultMode":"chat"}' });
      const ws = await workspaceService.getWorkspace('p1');
      
      expect(get).toHaveBeenCalledWith('/projects/' + workspaceService.toUUID('p1') + '/workspace');
      expect(ws.projectId).toBe('p1');
      expect(ws.settings.defaultMode).toBe('chat');
    });

    it('should fallback to local workspace creation if API fails', async () => {
      get.mockRejectedValueOnce(new Error('Network'));
      const ws = await workspaceService.getWorkspace('p2');
      
      expect(ws.projectId).toBe('p2');
      expect(ws.settings.defaultMode).toBe('chat');
    });
  });

  describe('Conversations', () => {
    it('should get conversations via API', async () => {
      get.mockResolvedValueOnce([{ id: 'c1', title: 'Test' }]);
      const convs = await workspaceService.getConversations('p1');
      expect(convs[0].id).toBe('c1');
    });

    it('should create conversation via API', async () => {
      post.mockResolvedValueOnce({ id: 'c2', title: 'New Chat' });
      const conv = await workspaceService.createConversation('p1', { title: 'New Chat' });
      expect(conv.id).toBe('c2');
    });

    it('should rename conversation via API', async () => {
      patch.mockResolvedValueOnce({ id: 'c1', title: 'Renamed' });
      const res = await workspaceService.renameConversation('c1', 'Renamed');
      expect(res.success).toBe(true);
    });

    it('should delete conversation via API', async () => {
      del.mockResolvedValueOnce({ success: true });
      const res = await workspaceService.deleteConversation('c1');
      expect(res.success).toBe(true);
    });
  });

  describe('Messages', () => {
    it('should get messages via API', async () => {
      get.mockResolvedValueOnce([{ id: 'm1', content: 'hello' }]);
      const msgs = await workspaceService.getMessages('c1');
      expect(msgs[0].id).toBe('m1');
    });

    it('should send message via API', async () => {
      post.mockResolvedValueOnce({
        userMessage: { id: 'u1', content: 'hello' },
        assistantMessage: { id: 'a1', content: 'hi' }
      });
      const res = await workspaceService.sendMessage('c1', 'hello');
      
      expect(res.userMessage.content).toBe('hello');
      expect(res.assistantMessage.content).toBe('hi');
    });
  });
});
