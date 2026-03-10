import { ScoringConfig } from '@/lib/types/domain';

export const defaultScoringConfig: ScoringConfig = {
  reviewRangeMin: 5,
  reviewRangeMax: 10,
  reviewRangeScore: 30,
  missingWebsiteScore: 20,
  lowPhotosThreshold: 3,
  lowPhotosScore: 20,
  ratingMin: 4.0,
  ratingMax: 4.7,
  ratingRangeScore: 10,
  genericCategoryScore: 10,
  incompleteInfoScore: 10,
  minInterestingScore: 40
};

export const genericCategoryKeywords = ['store', 'service', 'business', 'shop', 'establishment'];
