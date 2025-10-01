import { getStoredAuth } from '../auth';

export class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

const resolvePath = (path) => {
  if (!path) return '/api';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  if (path.startsWith('/api')) {
    return path;
  }
  return `/api${path.startsWith('/') ? '' : '/'}${path}`;
};

export async function apiFetch(path, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    token,
    signal,
  } = options;

  const url = resolvePath(path);
  const finalHeaders = new Headers(headers);

  let requestBody = body;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  if (!isFormData && body !== undefined && body !== null) {
    finalHeaders.set('Content-Type', 'application/json');
    requestBody = JSON.stringify(body);
  }

  const authToken = token ?? getStoredAuth()?.token;
  if (authToken) {
    finalHeaders.set('Authorization', `Bearer ${authToken}`);
  }

  if (!finalHeaders.has('Accept')) {
    finalHeaders.set('Accept', 'application/json');
  }

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    body: requestBody,
    signal,
  });

  const contentType = response.headers.get('Content-Type') || '';
  let payload;

  if (contentType.includes('application/json')) {
    try {
      payload = await response.json();
    } catch (error) {
      payload = null;
    }
  } else if (!response.ok) {
    payload = await response.text();
  }

  if (!response.ok) {
    const message = typeof payload === 'string'
      ? payload
      : payload?.error || response.statusText || 'Request failed';
    throw new APIError(message, response.status, payload);
  }

  return payload;
}
