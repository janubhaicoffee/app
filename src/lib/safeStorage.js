// Safe wrapper for localStorage/sessionStorage that doesn't crash in restricted WebViews
// (Instagram in-app browser, iOS private browsing, etc.)

function isAvailable(type) {
  if (typeof window === 'undefined') return false;
  try {
    const key = '__storage_test__';
    const storage = type === 'session' ? window.sessionStorage : window.localStorage;
    storage.setItem(key, '1');
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

const lsAvailable = isAvailable('local');
const ssAvailable = isAvailable('session');

export function safeGetItem(key, type = 'local') {
  if (typeof window === 'undefined') return null;
  try {
    const storage = type === 'session' ? window.sessionStorage : window.localStorage;
    return storage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetItem(key, value, type = 'local') {
  if (typeof window === 'undefined') return false;
  try {
    const storage = type === 'session' ? window.sessionStorage : window.localStorage;
    storage.setItem(key, value);
    return true;
  } catch {
    return null;
  }
}

export function safeRemoveItem(key, type = 'local') {
  if (typeof window === 'undefined') return false;
  try {
    const storage = type === 'session' ? window.sessionStorage : window.localStorage;
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function safeParseJSON(value, fallback = null) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export { lsAvailable, ssAvailable };
