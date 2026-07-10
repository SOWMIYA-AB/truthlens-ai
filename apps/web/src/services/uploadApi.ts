import type { ImageUploadResponse } from '../types/upload';
import { getAccessToken } from './tokenStorage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1';

export function uploadImage(
  file: File,
  onProgress: (progress: number) => void,
): Promise<ImageUploadResponse> {
  return new Promise((resolve, reject) => {
    const token = getAccessToken();
    const formData = new FormData();
    formData.append('image', file);

    const request = new XMLHttpRequest();
    request.open('POST', `${API_BASE_URL}/uploads/image`);

    if (token) {
      request.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    request.onload = () => {
      const response = JSON.parse(request.responseText || '{}');
      if (request.status >= 200 && request.status < 300) {
        resolve(response as ImageUploadResponse);
        return;
      }

      reject(new Error(response.detail ?? 'Image upload failed'));
    };

    request.onerror = () => reject(new Error('Network error while uploading image'));
    request.send(formData);
  });
}

