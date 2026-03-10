export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { prisma } from '@/lib/prisma';

async function updateConfig(formData: FormData) {
  'use server';

  await prisma.scoringConfig.upsert({
    where: { id: 'default' },
    create: {
      id: 'default',
      reviewRangeMin: Number(formData.get('reviewRangeMin')),
      reviewRangeMax: Number(formData.get('reviewRangeMax')),
      reviewRangeScore: Number(formData.get('reviewRangeScore')),
      missingWebsiteScore: Number(formData.get('missingWebsiteScore')),
      lowPhotosThreshold: Number(formData.get('lowPhotosThreshold')),
      lowPhotosScore: Number(formData.get('lowPhotosScore')),
      ratingMin: Number(formData.get('ratingMin')),
      ratingMax: Number(formData.get('ratingMax')),
      ratingRangeScore: Number(formData.get('ratingRangeScore')),
      genericCategoryScore: Number(formData.get('genericCategoryScore')),
      incompleteInfoScore: Number(formData.get('incompleteInfoScore')),
      minInterestingScore: Number(formData.get('minInterestingScore'))
    },
    update: {
      reviewRangeMin: Number(formData.get('reviewRangeMin')),
      reviewRangeMax: Number(formData.get('reviewRangeMax')),
      reviewRangeScore: Number(formData.get('reviewRangeScore')),
      missingWebsiteScore: Number(formData.get('missingWebsiteScore')),
      lowPhotosThreshold: Number(formData.get('lowPhotosThreshold')),
      lowPhotosScore: Number(formData.get('lowPhotosScore')),
      ratingMin: Number(formData.get('ratingMin')),
      ratingMax: Number(formData.get('ratingMax')),
      ratingRangeScore: Number(formData.get('ratingRangeScore')),
      genericCategoryScore: Number(formData.get('genericCategoryScore')),
      incompleteInfoScore: Number(formData.get('incompleteInfoScore')),
      minInterestingScore: Number(formData.get('minInterestingScore'))
    }
  });
}

export default async function SettingsPage() {
  const config =
    (await prisma.scoringConfig.findUnique({ where: { id: 'default' } })) ??
    ({
      reviewRangeMin: 5,
      reviewRangeMax: 10,
      reviewRangeScore: 30,
      missingWebsiteScore: 20,
      lowPhotosThreshold: 3,
      lowPhotosScore: 20,
      ratingMin: 4,
      ratingMax: 4.7,
      ratingRangeScore: 10,
      genericCategoryScore: 10,
      incompleteInfoScore: 10,
      minInterestingScore: 40
    } as const);

  return (
    <form action={updateConfig} className="card grid grid-cols-2 gap-3">
      {Object.entries(config)
        .filter(([key]) => key !== 'id')
        .map(([key, value]) => (
          <label key={key} className="text-sm">
            {key}
            <input className="input" name={key} defaultValue={String(value)} />
          </label>
        ))}
      <button className="btn col-span-2">Sauvegarder</button>
    </form>
  );
}
