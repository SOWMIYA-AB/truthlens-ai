import type { ImageAnalysisResponse } from '../../types/analysis';

export function getPredictionBadgeClasses(prediction: ImageAnalysisResponse['prediction']) {
  if (prediction === 'Likely Authentic') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }

  return 'bg-red-50 text-red-700 border-red-200';
}

export function getTruthScoreTone(score: number) {
  if (score >= 70) {
    return 'text-emerald-700';
  }

  if (score >= 40) {
    return 'text-amber-700';
  }

  return 'text-red-700';
}

export function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

