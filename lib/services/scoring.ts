import { defaultScoringConfig, genericCategoryKeywords } from '@/lib/config/defaultScoring';
import { PlaceRecord, ScoringConfig, OpportunityScoreBreakdown } from '@/lib/types/domain';

function isGenericCategory(category: string | null): boolean {
  if (!category) return true;
  const lower = category.toLowerCase();
  return genericCategoryKeywords.some((keyword) => lower.includes(keyword));
}

function missingCoreInfo(place: PlaceRecord): boolean {
  return !place.phone || !place.address || place.reviewsCount === null;
}

export function computeOpportunityScore(
  place: PlaceRecord,
  config: ScoringConfig = defaultScoringConfig
): OpportunityScoreBreakdown {
  let total = 0;
  const reasons: string[] = [];

  if (place.reviewsCount !== null && place.reviewsCount >= config.reviewRangeMin && place.reviewsCount <= config.reviewRangeMax) {
    total += config.reviewRangeScore;
    reasons.push(`Seulement ${place.reviewsCount} avis: potentiel d'amélioration de la preuve sociale.`);
  }

  if (!place.website) {
    total += config.missingWebsiteScore;
    reasons.push('Site web non renseigné: opportunité de capter plus de trafic local.');
  }

  if ((place.photosCount ?? 0) <= config.lowPhotosThreshold) {
    total += config.lowPhotosScore;
    reasons.push('Peu de photos visibles: la fiche peut être enrichie visuellement.');
  }

  if (place.rating !== null && place.rating >= config.ratingMin && place.rating <= config.ratingMax) {
    total += config.ratingRangeScore;
    reasons.push('Note correcte mais progression possible via une fiche plus complète.');
  }

  if (isGenericCategory(place.category)) {
    total += config.genericCategoryScore;
    reasons.push('Catégorie potentiellement générique: optimisation locale envisageable.');
  }

  if (missingCoreInfo(place)) {
    total += config.incompleteInfoScore;
    reasons.push('Informations incomplètes: enrichissement conseillé pour améliorer la conversion.');
  }

  return { total, reasons };
}
