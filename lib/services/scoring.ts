import { defaultScoringConfig, genericCategoryKeywords } from '@/lib/config/defaultScoring';
import { PlaceRecord, ScoringConfig, OpportunityScoreBreakdown } from '@/lib/types/domain';

function isGenericCategory(category: string | null): boolean {
  if (!category) return true;
  const lower = category.toLowerCase();
  return genericCategoryKeywords.some((keyword) => lower.includes(keyword));
}

export function getMissingInfoFields(place: PlaceRecord): string[] {
  const missingFields: string[] = [];

  if (!place.phone) {
    missingFields.push('téléphone');
  }
  if (!place.address) {
    missingFields.push('adresse');
  }
  if (place.reviewsCount === null) {
    missingFields.push('nombre d’avis');
  }

  return missingFields;
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

  const missingFields = getMissingInfoFields(place);
  if (missingFields.length > 0) {
    total += config.incompleteInfoScore;
    reasons.push(`Informations incomplètes: champs manquants (${missingFields.join(', ')}).`);
  }

  return { total, reasons };
}
