import { mockPlaces } from '@/lib/data/mockPlaces';
import { PlaceRecord } from '@/lib/types/domain';

type GoogleTextSearchResult = {
  place_id: string;
  name: string;
  formatted_address?: string;
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
  photos?: { photo_reference: string }[];
};

type GoogleAddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

type GoogleDetailsResult = {
  place_id: string;
  name: string;
  formatted_address?: string;
  address_components?: GoogleAddressComponent[];
  international_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  photos?: { photo_reference: string }[];
  types?: string[];
  opening_hours?: { weekday_text?: string[] };
  url?: string;
};

function getGoogleMapsServerApiKey(): string | null {
  const key = process.env.GOOGLE_MAPS_SERVER_API_KEY?.trim();
  if (!key) {
    console.warn('[placesClient] GOOGLE_MAPS_SERVER_API_KEY is missing. Falling back to mock data.');
    return null;
  }
  return key;
}

export function inferCity(
  address: string | undefined,
  fallbackCity: string,
  addressComponents?: GoogleAddressComponent[]
): string {
  const preferredTypes = ['locality', 'postal_town', 'administrative_area_level_3', 'administrative_area_level_2'];

  if (addressComponents?.length) {
    for (const type of preferredTypes) {
      const component = addressComponents.find((item) => item.types.includes(type));
      if (component?.long_name) {
        return component.long_name;
      }
    }
  }

  if (!address) return fallbackCity;

  const parts = address
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const postalCityPart = parts.find((part) => /\b\d{5}\s+/.test(part));
  if (postalCityPart) {
    const match = postalCityPart.match(/\b\d{5}\s+(.+)/);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  const nonCountryParts = parts.filter((part) => !['france', 'fr'].includes(part.toLowerCase()));
  if (nonCountryParts.length >= 2) {
    return nonCountryParts[nonCountryParts.length - 1];
  }

  if (parts.length >= 2) {
    return parts[parts.length - 2];
  }

  return fallbackCity;
}

function normalizeResult(details: GoogleDetailsResult, fallbackCity: string): PlaceRecord {
  return {
    placeId: details.place_id,
    name: details.name,
    city: inferCity(details.formatted_address, fallbackCity, details.address_components),
    address: details.formatted_address ?? null,
    phone: details.international_phone_number ?? null,
    email: null,
    website: details.website ?? null,
    rating: details.rating ?? null,
    reviewsCount: details.user_ratings_total ?? null,
    photosCount: details.photos?.length ?? 0,
    hasPhotos: Boolean(details.photos && details.photos.length > 0),
    category: details.types?.[0] ?? null,
    openingHours: details.opening_hours?.weekday_text ?? null,
    googleMapsUrl: details.url ?? null,
    observations: null
  };
}

export async function searchPlaces(query: string, city: string): Promise<PlaceRecord[]> {
  const apiKey = getGoogleMapsServerApiKey();

  if (process.env.USE_MOCK_DATA === 'true' || !apiKey) {
    const lowerQuery = query.toLowerCase();
    return mockPlaces.filter((place) =>
      place.city.toLowerCase().includes(city.toLowerCase()) || place.name.toLowerCase().includes(lowerQuery)
    );
  }

  const textSearchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
  textSearchUrl.searchParams.set('query', `${query} ${city}`);
  textSearchUrl.searchParams.set('key', apiKey);

  const textResponse = await fetch(textSearchUrl.toString(), { cache: 'no-store' });
  if (!textResponse.ok) {
    throw new Error(`Google Text Search API error: ${textResponse.status}`);
  }

  const textPayload = (await textResponse.json()) as { results: GoogleTextSearchResult[] };
  const topResults = textPayload.results.slice(0, 20);

  const details = await Promise.all(
    topResults.map(async (result) => {
      const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
      detailsUrl.searchParams.set('place_id', result.place_id);
      detailsUrl.searchParams.set(
        'fields',
        'place_id,name,formatted_address,address_components,international_phone_number,website,rating,user_ratings_total,photos,types,opening_hours,url'
      );
      detailsUrl.searchParams.set('key', apiKey);
      const detailsResponse = await fetch(detailsUrl.toString(), { cache: 'no-store' });
      if (!detailsResponse.ok) {
        return null;
      }
      const detailsPayload = (await detailsResponse.json()) as { result?: GoogleDetailsResult };
      if (!detailsPayload.result) {
        return null;
      }
      return normalizeResult(detailsPayload.result, city);
    })
  );

  return details.filter((item): item is PlaceRecord => item !== null);
}
