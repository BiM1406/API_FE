import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as aiService from './aiService';


vi.mock('./workspaceService', () => ({
  sendMessage: vi.fn()
}));

describe('AI Service', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should generate code response', async () => {
    const res = await aiService.generateCode({ prompt: 'react' });
    expect(res.content).toContain('Code React');
  });

  it('should analyze API response', async () => {
    const res = await aiService.analyzeApiResponse({ status: 401 });
    expect(res.content).toContain('401');
  });

  it('should return default response for unknown chat', async () => {
    const res = await aiService.sendChatMessage({ message: 'Hello' });
    expect(res.content).toContain('Mình đã nhận yêu cầu');
  });
});
