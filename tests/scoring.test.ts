import { describe, expect, it } from 'vitest';
import { computeOpportunityScore } from '@/lib/services/scoring';
import { generateQuickAudit } from '@/lib/services/audit';
import { PlaceRecord } from '@/lib/types/domain';

const candidate: PlaceRecord = {
  placeId: 'x',
  name: 'Test',
  city: 'Lyon',
  address: null,
  phone: null,
  email: null,
  website: null,
  rating: 4.2,
  reviewsCount: 7,
  photosCount: 1,
  hasPhotos: true,
  category: 'service',
  openingHours: null,
  googleMapsUrl: null,
  observations: null
};

describe('opportunity scoring', () => {
  it('computes a transparent score', () => {
    const score = computeOpportunityScore(candidate);
    expect(score.total).toBeGreaterThanOrEqual(80);
    expect(score.reasons.length).toBeGreaterThan(3);
  });

  it('generates audit lines only from observed facts', () => {
    const audit = generateQuickAudit(candidate);
    expect(audit.some((line) => line.includes('non disponible'))).toBe(true);
    expect(audit.some((line) => line.includes('Détail informations incomplètes'))).toBe(true);
    expect(audit.some((line) => line.includes('téléphone'))).toBe(true);
  });
});
