export type ImagePrediction = 'Likely Authentic' | 'Likely AI Generated';

export interface ImageAnalysisResponse {
  id: string;
  uploadId: string;
  prediction: ImagePrediction;
  confidence: number;
  truthScore: number;
  model: string;
  processingTime: number;
  createdAt: string;
}

