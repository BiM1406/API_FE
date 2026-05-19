export function safeJsonParse(value, fallback = null) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function readStorage(key, fallback = null) {
  return safeJsonParse(localStorage.getItem(key), fallback);
}

export function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  return value;
}

export function removeStorage(key) {
  localStorage.removeItem(key);
}

export function createId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

