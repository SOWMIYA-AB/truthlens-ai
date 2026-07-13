import { Activity, Gauge, Timer } from 'lucide-react';
import type { ImageAnalysisResponse } from '../../types/analysis';
import { formatPercent, getPredictionBadgeClasses, getTruthScoreTone } from './analysisDisplay';

export function AnalysisResultCard({ result }: { result: ImageAnalysisResponse }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-signal">Authenticity Result</p>
          <h2 className="mt-2 text-2xl font-bold">Image Analysis Complete</h2>
        </div>
        <span className={`rounded-full border px-4 py-2 text-sm font-semibold ${getPredictionBadgeClasses(result.prediction)}`}>
          {result.prediction}
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 p-4">
          <div className="mb-3 flex items-center gap-2 text-slate-500">
            <Gauge size={18} aria-hidden="true" />
            <span className="text-sm font-medium">Confidence</span>
          </div>
          <p className="text-3xl font-bold text-ink">{formatPercent(result.confidence)}</p>
        </div>

        <div className="rounded-lg border border-slate-200 p-4">
          <div className="mb-3 flex items-center gap-2 text-slate-500">
            <Activity size={18} aria-hidden="true" />
            <span className="text-sm font-medium">Truth Score</span>
          </div>
          <p className={`text-3xl font-bold ${getTruthScoreTone(result.truthScore)}`}>{formatPercent(result.truthScore)}</p>
        </div>

        <div className="rounded-lg border border-slate-200 p-4">
          <div className="mb-3 flex items-center gap-2 text-slate-500">
            <Timer size={18} aria-hidden="true" />
            <span className="text-sm font-medium">Processing</span>
          </div>
          <p className="text-3xl font-bold text-ink">{result.processingTime.toFixed(2)} ms</p>
        </div>
      </div>

      <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
        <p>
          <span className="font-semibold text-ink">Model used:</span> {result.model}
        </p>
        <p className="mt-1">
          <span className="font-semibold text-ink">Analysis ID:</span> {result.id}
        </p>
      </div>
    </div>
  );
}

