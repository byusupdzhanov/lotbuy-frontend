const STORAGE_KEY = 'lotbuy-auth';

export const isBrowser = typeof window !== 'undefined';

export function getStoredAuth() {
  if (!isBrowser) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

export function storeAuth(payload) {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    // ignore storage errors in environments where localStorage is unavailable
  }
}

export function clearStoredAuth() {
  if (!isBrowser) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    // ignore
  }
}
