import { apiFetch } from './client';

export async function uploadImage(file) {
  if (!file) {
    throw new Error('File is required');
  }
  const formData = new FormData();
  formData.append('file', file);
  return apiFetch('/api/uploads', {
    method: 'POST',
    body: formData,
  });
}
