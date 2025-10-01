import { apiFetch } from './client';

export function getCurrentUser() {
  return apiFetch('/api/me');
}

export function updateCurrentUser(payload) {
  return apiFetch('/api/me', {
    method: 'PATCH',
    body: payload,
  });
}
