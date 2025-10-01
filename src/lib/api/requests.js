import { apiFetch } from './client';

export async function listRequests(params = {}) {
  const query = new URLSearchParams();
  if (params.status) {
    query.set('status', params.status);
  }
  const search = query.toString();
  return apiFetch(`/api/requests${search ? `?${search}` : ''}`);
}

export async function getRequest(id) {
  if (!id) {
    throw new Error('Request id is required');
  }
  return apiFetch(`/api/requests/${id}`);
}

export async function createRequest(payload) {
  return apiFetch('/api/requests', {
    method: 'POST',
    body: payload,
  });
}

export async function updateRequest(id, payload) {
  if (!id) {
    throw new Error('Request id is required');
  }
  return apiFetch(`/api/requests/${id}`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteRequest(id) {
  if (!id) {
    throw new Error('Request id is required');
  }
  return apiFetch(`/api/requests/${id}`, {
    method: 'DELETE',
  });
}
