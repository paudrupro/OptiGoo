export type PlaceRecord = {
  placeId: string;
  name: string;
  city: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  rating: number | null;
  reviewsCount: number | null;
  photosCount: number | null;
  hasPhotos: boolean;
  category: string | null;
  openingHours: string[] | null;
  googleMapsUrl: string | null;
  observations: string | null;
};

export type OpportunityScoreBreakdown = {
  total: number;
  reasons: string[];
};

export type ScoringConfig = {
  reviewRangeMin: number;
  reviewRangeMax: number;
  reviewRangeScore: number;
  missingWebsiteScore: number;
  lowPhotosThreshold: number;
  lowPhotosScore: number;
  ratingMin: number;
  ratingMax: number;
  ratingRangeScore: number;
  genericCategoryScore: number;
  incompleteInfoScore: number;
  minInterestingScore: number;
};
