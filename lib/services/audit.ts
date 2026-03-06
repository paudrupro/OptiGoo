import { computeOpportunityScore } from '@/lib/services/scoring';
import { PlaceRecord, ScoringConfig } from '@/lib/types/domain';

export function generateQuickAudit(place: PlaceRecord, config?: ScoringConfig): string[] {
  const score = computeOpportunityScore(place, config);
  const auditLines = [...score.reasons];

  if (place.phone === null) {
    auditLines.push('Téléphone: non disponible via la source API.');
  }

  if (place.openingHours === null) {
    auditLines.push('Horaires: non disponibles via la source API.');
  }

  if (place.reviewsCount === null) {
    auditLines.push('Nombre d’avis: non disponible via la source API.');
  }

  if (auditLines.length === 0) {
    auditLines.push('Fiche globalement complète: opportunité moins prioritaire.');
  }

  return auditLines;
}
