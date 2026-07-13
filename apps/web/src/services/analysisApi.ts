import { apiRequest } from './api';
import type { ImageAnalysisResponse } from '../types/analysis';

export function analyzeImage(uploadId: string) {
  return apiRequest<ImageAnalysisResponse>('/analysis/image', {
    method: 'POST',
    body: JSON.stringify({ uploadId }),
  });
}

