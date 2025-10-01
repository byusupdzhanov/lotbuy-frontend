import { apiFetch } from './client';

export function listDeals() {
  return apiFetch('/api/deals');
}

export function getDeal(id) {
  if (!id) throw new Error('deal id is required');
  return apiFetch(`/api/deals/${id}`);
}
