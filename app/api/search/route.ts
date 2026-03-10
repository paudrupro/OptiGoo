import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { searchPlaces } from '@/lib/services/placesClient';
import { computeOpportunityScore } from '@/lib/services/scoring';
import { generateQuickAudit } from '@/lib/services/audit';
import { checkRateLimit } from '@/lib/services/rateLimit';
import { defaultScoringConfig } from '@/lib/config/defaultScoring';

const payloadSchema = z.object({
  métier: z.string().min(2),
  ville: z.string().min(2)
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'local';
  if (!checkRateLimit(`search:${ip}`)) {
    return NextResponse.json({ error: 'Rate limit dépassé.' }, { status: 429 });
  }

  const body = await req.json();
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Entrées invalides.', details: parsed.error.issues }, { status: 400 });
  }

  const { métier, ville } = parsed.data;

  try {
    const dbConfig = await prisma.scoringConfig.findUnique({ where: { id: 'default' } });
    const scoringConfig = dbConfig ?? defaultScoringConfig;
    const places = await searchPlaces(métier, ville);

    const searchRun = await prisma.searchRun.create({
      data: {
        query: métier,
        city: ville,
        source: process.env.USE_MOCK_DATA === 'true' ? 'mock' : 'google_places_api',
        totalFound: places.length
      }
    });

    const companies = await Promise.all(
      places.map(async (place) => {
        const score = computeOpportunityScore(place, scoringConfig);
        const audit = generateQuickAudit(place, scoringConfig);

        return prisma.company.create({
          data: {
            searchRunId: searchRun.id,
            placeId: place.placeId,
            name: place.name,
            city: place.city,
            address: place.address,
            phone: place.phone,
            email: place.email,
            website: place.website,
            rating: place.rating,
            reviewsCount: place.reviewsCount,
            photosCount: place.photosCount,
            hasPhotos: place.hasPhotos,
            category: place.category,
            openingHoursJson: place.openingHours ? JSON.stringify(place.openingHours) : null,
            googleMapsUrl: place.googleMapsUrl,
            opportunityScore: score.total,
            quickAuditJson: JSON.stringify(audit),
            observations: place.observations
          }
        });
      })
    );

    return NextResponse.json({ searchRunId: searchRun.id, companies });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur recherche.', details: (error as Error).message }, { status: 500 });
  }
}
