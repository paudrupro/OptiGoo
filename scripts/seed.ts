import { prisma } from '../lib/prisma';
import { mockPlaces } from '../lib/data/mockPlaces';
import { computeOpportunityScore } from '../lib/services/scoring';
import { generateQuickAudit } from '../lib/services/audit';

async function main() {
  const run = await prisma.searchRun.create({
    data: {
      query: 'boulangerie',
      city: 'Lyon',
      source: 'mock',
      totalFound: mockPlaces.length
    }
  });

  for (const place of mockPlaces) {
    const score = computeOpportunityScore(place);
    const audit = generateQuickAudit(place);
    await prisma.company.create({
      data: {
        searchRunId: run.id,
        placeId: place.placeId,
        name: place.name,
        city: place.city,
        address: place.address,
        phone: place.phone,
        email: null,
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
  }

  await prisma.messageTemplate.createMany({
    data: [
      {
        name: 'Email audit local',
        type: 'email',
        subject: 'Quelques pistes simples pour améliorer votre visibilité locale',
        body: 'Bonjour {{nom_entreprise}}, j\'ai observé {{constat_1}} et {{constat_2}} sur votre présence à {{ville}}.'
      },
      {
        name: 'SMS audit court',
        type: 'sms',
        body: 'Bonjour {{nom_entreprise}}, constat rapide: {{constat_1}}. Souhaitez-vous 2 actions concrètes?'
      }
    ]
  });

  await prisma.scoringConfig.upsert({
    where: { id: 'default' },
    create: { id: 'default' },
    update: {}
  });

  console.log('Seed terminé.');
}

main().finally(async () => prisma.$disconnect());
