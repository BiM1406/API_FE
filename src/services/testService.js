const HISTORY_KEY = 'api_fe_api_test_history';

export function resolveEnvironmentVariables(value, env = []) {
  return String(value || '').replace(/{{\s*([^}]+)\s*}}/g, (_, key) => {
    const match = env.find((item) => item.key === key.trim());
    return match ? match.value : `{{${key}}}`;
  });
}

const parseMaybeJson = (value) => {
  if (!value) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    throw new Error('Body JSON không hợp lệ');
  }
};

export async function sendApiRequest(config) {
  if (!config.url) throw new Error('Vui lòng nhập URL');

  const startedAt = performance.now();
  const headers = Object.fromEntries((config.headers || []).filter((item) => item.key).map((item) => [item.key, item.value]));
  const shouldSendBody = !['GET', 'HEAD'].includes(config.method);
  const body = shouldSendBody && config.body ? JSON.stringify(parseMaybeJson(config.body)) : undefined;

  const response = await fetch(config.url, { method: config.method, headers, body });
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }

  return {
    status: response.status,
    statusText: response.statusText,
    duration: Math.round(performance.now() - startedAt),
    headers: Object.fromEntries(response.headers.entries()),
    data,
    size: new Blob([text]).size
  };
}

export function getRequestHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveRequestHistory(item) {
  const history = [item, ...getRequestHistory()].slice(0, 50);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  return history;
}

export function clearRequestHistory() {
  localStorage.removeItem(HISTORY_KEY);
}
