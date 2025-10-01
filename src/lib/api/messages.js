import { apiFetch } from './client';

export function listOfferMessages(offerId) {
  if (!offerId) throw new Error('offerId is required');
  return apiFetch(`/api/offers/${offerId}/messages`);
}

export function sendOfferMessage(offerId, payload) {
  if (!offerId) throw new Error('offerId is required');
  return apiFetch(`/api/offers/${offerId}/messages`, {
    method: 'POST',
    body: payload,
  });
}
