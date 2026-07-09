import api, { normalizeApiError, unwrap } from './api';

export function getFriendlyAiError(error) {
  const code = error?.payload?.errorCode || error?.response?.data?.errorCode;
  if (code === 'AI_PLAN_LIMIT_EXCEEDED') {
    return 'Bạn đã vượt giới hạn Chat AI của gói hiện tại. Vui lòng thử lại sau hoặc nâng cấp gói.';
  }
  if (code === 'GEMINI_QUOTA_EXCEEDED') {
    return 'Hệ thống AI đang vượt giới hạn Gemini. Vui lòng thử lại sau.';
  }
  if (code === 'GEMINI_MODEL_NOT_FOUND') {
    return 'Model AI của gói hiện tại chưa khả dụng. Vui lòng kiểm tra cấu hình hoặc thử lại sau.';
  }
  if (code === 'GEMINI_API_KEY_INVALID') {
    return 'Hệ thống AI chưa được cấu hình đúng. Vui lòng liên hệ quản trị viên.';
  }
  return error?.message || 'Không thể gửi yêu cầu AI. Vui lòng thử lại sau.';
}

export async function sendChatMessage(payload = {}) {
  try {
    return unwrap(await api.post('/ai/chat', payload));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể gửi yêu cầu AI');
  }
}

export async function generateCode(payload = {}) {
  return sendChatMessage({ ...payload, mode: payload.mode || 'generate_code' });
}

export async function generateApi(payload = {}) {
  return sendChatMessage({ ...payload, mode: payload.mode || 'generate_api' });
}

export async function generateApiRequest(payload = {}) {
  return sendChatMessage({ ...payload, mode: payload.mode || 'generate_api_request' });
}

export async function analyzeApiResponse(payload = {}) {
  return sendChatMessage({ ...payload, mode: payload.mode || 'analyze_response' });
}

export async function generateDatabaseSchema(payload = {}) {
  try {
    return unwrap(await api.post('/ai/generate-schema', payload));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể tạo database schema');
  }
}

export async function generateDocumentation(payload = {}) {
  try {
    return unwrap(await api.post('/ai/generate-documentation', payload));
  } catch (error) {
    throw normalizeApiError(error, 'Không thể tạo documentation');
  }
}
