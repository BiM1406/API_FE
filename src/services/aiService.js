import { mockDelay } from './api';

export async function sendPrompt(prompt) {
  return mockDelay({
    content: `Đây là phản hồi mô phỏng cho: "${prompt}". Khi có backend, aiService.sendPrompt sẽ gọi API thật.`
  }, 650);
}
