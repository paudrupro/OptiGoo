export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function HistoryPage() {
  const runs = await prisma.searchRun.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });

  return (
    <div className="card">
      <h1 className="mb-3 text-xl font-semibold">Historique des recherches</h1>
      <ul className="space-y-2 text-sm">
        {runs.map((run) => (
          <li key={run.id}>
            {run.query} à {run.city} ({run.totalFound} résultats) - {new Date(run.createdAt).toLocaleString('fr-FR')} -{' '}
            <Link className="text-blue-600" href={`/results?searchRunId=${run.id}`}>
              Ouvrir
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
