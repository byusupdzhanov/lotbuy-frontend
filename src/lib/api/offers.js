import { apiFetch } from './client';

export async function listOffers(requestId) {
  if (!requestId) {
    throw new Error('Request id is required');
  }
  return apiFetch(`/api/requests/${requestId}/offers`);
}

export async function createOffer(requestId, payload) {
  if (!requestId) {
    throw new Error('Request id is required');
  }
  return apiFetch(`/api/requests/${requestId}/offers`, {
    method: 'POST',
    body: payload,
  });
}

export async function updateOffer(offerId, payload) {
  if (!offerId) {
    throw new Error('Offer id is required');
  }
  return apiFetch(`/api/offers/${offerId}`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteOffer(offerId) {
  if (!offerId) {
    throw new Error('Offer id is required');
  }
  return apiFetch(`/api/offers/${offerId}`, {
    method: 'DELETE',
  });
}

export async function acceptOffer(offerId) {
  if (!offerId) {
    throw new Error('Offer id is required');
  }
  return apiFetch(`/api/offers/${offerId}/accept`, {
    method: 'POST',
  });
}
