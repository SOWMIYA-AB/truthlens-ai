import { describe, expect, it } from 'vitest';
import { formatPercent, getPredictionBadgeClasses, getTruthScoreTone } from './analysisDisplay';

describe('analysis display helpers', () => {
  it('uses a green badge for likely authentic images', () => {
    expect(getPredictionBadgeClasses('Likely Authentic')).toContain('emerald');
  });

  it('uses a red badge for likely AI generated images', () => {
    expect(getPredictionBadgeClasses('Likely AI Generated')).toContain('red');
  });

  it('formats confidence as a percent with two decimal places', () => {
    expect(formatPercent(91.234)).toBe('91.23%');
  });

  it('maps truth score severity to color tones', () => {
    expect(getTruthScoreTone(80)).toContain('emerald');
    expect(getTruthScoreTone(55)).toContain('amber');
    expect(getTruthScoreTone(20)).toContain('red');
  });
});

