'use client';

import { useEffect, useMemo, useState } from 'react';

type Company = {
  id: string;
  name: string;
  city: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  rating: number | null;
  reviewsCount: number | null;
  photosCount: number | null;
  opportunityScore: number;
  quickAuditJson: string;
  contactStatus: string;
};

export function ResultsClient({ searchRunId }: { searchRunId?: string }) {
  const [rows, setRows] = useState<Company[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [minScore, setMinScore] = useState('0');

  useEffect(() => {
    const url = new URL('/api/companies', window.location.origin);
    if (searchRunId) {
      url.searchParams.set('searchRunId', searchRunId);
    }
    url.searchParams.set('minScore', minScore);

    fetch(url.toString())
      .then((r) => r.json())
      .then((payload) => setRows(payload.rows));
  }, [searchRunId, minScore]);

  const emailPreview = useMemo(() => {
    if (!rows.length) return '';
    const first = rows.find((row) => selectedIds.includes(row.id)) ?? rows[0];
    const audit = JSON.parse(first.quickAuditJson) as string[];
    return `Objet : Quelques pistes simples pour améliorer votre visibilité locale\n\nBonjour ${first.name},\nJ'ai observé ${audit[0] ?? 'une opportunité locale'} à ${first.city}.`;
  }, [rows, selectedIds]);

  async function exportSelected(format: 'csv' | 'json') {
    const response = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedIds, mode: 'selected', format })
    });

    if (format === 'json') {
      const payload = await response.json();
      navigator.clipboard.writeText(JSON.stringify(payload.rows, null, 2));
      return;
    }

    const csv = await response.text();
    navigator.clipboard.writeText(csv);
  }

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-end gap-3">
        <label className="text-sm">
          Score min
          <input className="input" value={minScore} onChange={(e) => setMinScore(e.target.value)} />
        </label>
        <button className="btn" onClick={() => exportSelected('csv')}>Copier export CSV sélection</button>
        <button className="btn" onClick={() => exportSelected('json')}>Copier export JSON sélection</button>
      </div>

      <div className="card overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left">
              <th></th><th>Nom</th><th>Ville</th><th>Téléphone</th><th>Email</th><th>Site</th><th>Note</th><th>Avis</th><th>Photos</th><th>Score</th><th>Audit</th><th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t">
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(row.id)}
                    onChange={(e) => {
                      setSelectedIds((prev) =>
                        e.target.checked ? [...prev, row.id] : prev.filter((id) => id !== row.id)
                      );
                    }}
                  />
                </td>
                <td>{row.name}</td>
                <td>{row.city}</td>
                <td>{row.phone ?? ''}</td>
                <td>{row.email ?? ''}</td>
                <td>{row.website ? <a href={row.website}>{row.website}</a> : ''}</td>
                <td>{row.rating ?? 'non disponible'}</td>
                <td>{row.reviewsCount ?? 'non disponible'}</td>
                <td>{row.photosCount ?? 0}</td>
                <td>{row.opportunityScore}</td>
                <td>{(JSON.parse(row.quickAuditJson) as string[]).slice(0, 2).join(' | ')}</td>
                <td>{row.contactStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2 className="font-semibold">Génération rapide de message</h2>
        <pre className="whitespace-pre-wrap text-sm">{emailPreview}</pre>
        <button className="btn" onClick={() => navigator.clipboard.writeText(emailPreview)}>Copier le texte</button>
      </div>
    </div>
  );
}
