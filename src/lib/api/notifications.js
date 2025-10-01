import { apiFetch } from './client';

export function listNotifications({ unread = false, limit } = {}) {
  const query = new URLSearchParams();
  if (unread) query.set('unread', 'true');
  if (typeof limit === 'number') query.set('limit', String(limit));
  const qs = query.toString();
  return apiFetch(`/api/notifications${qs ? `?${qs}` : ''}`);
}

export function markNotificationRead(id) {
  if (!id) throw new Error('notification id is required');
  return apiFetch(`/api/notifications/${id}/read`, { method: 'POST' });
}
