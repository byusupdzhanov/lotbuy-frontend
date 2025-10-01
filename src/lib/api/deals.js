import { apiFetch } from './client';

export function listDeals() {
  return apiFetch('/api/deals');
}

export function getDeal(id) {
  if (!id) throw new Error('deal id is required');
  return apiFetch(`/api/deals/${id}`);
}

export function markDealShipped(id) {
  if (!id) throw new Error('deal id is required');
  return apiFetch(`/api/deals/${id}`, {
    method: 'PATCH',
    body: { action: 'mark_shipped' },
  });
}

export function submitDealPayment(id) {
  if (!id) throw new Error('deal id is required');
  return apiFetch(`/api/deals/${id}`, {
    method: 'PATCH',
    body: { action: 'submit_payment' },
  });
}

export function confirmDealCompletion(id) {
  if (!id) throw new Error('deal id is required');
  return apiFetch(`/api/deals/${id}`, {
    method: 'PATCH',
    body: { action: 'confirm_delivery' },
  });
}

export function openDealDispute(id, reason) {
  if (!id) throw new Error('deal id is required');
  return apiFetch(`/api/deals/${id}`, {
    method: 'PATCH',
    body: { action: 'open_dispute', reason },
  });
}

export function rateDealCounterparty(id, rating, comment = '') {
  if (!id) throw new Error('deal id is required');
  if (typeof rating !== 'number') throw new Error('rating must be a number');
  return apiFetch(`/api/deals/${id}`, {
    method: 'PATCH',
    body: { action: 'rate_counterparty', rating, comment },
  });
}
