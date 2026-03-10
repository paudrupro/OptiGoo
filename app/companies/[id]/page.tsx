export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function CompanyDetailPage({ params }: { params: { id: string } }) {
  const company = await prisma.company.findUnique({ where: { id: params.id } });

  if (!company) {
    notFound();
  }

  return (
    <div className="card space-y-2">
      <h1 className="text-xl font-semibold">{company.name}</h1>
      <p>Adresse: {company.address ?? 'non disponible'}</p>
      <p>Téléphone: {company.phone ?? 'non disponible'}</p>
      <p>Site web: {company.website ?? 'non disponible'}</p>
      <p>Google Maps: {company.googleMapsUrl ?? 'non disponible'}</p>
      <p>Audit:</p>
      <ul className="list-disc pl-5">
        {(JSON.parse(company.quickAuditJson) as string[]).map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
