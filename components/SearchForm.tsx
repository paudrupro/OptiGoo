'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SearchForm() {
  const [metier, setMetier] = useState('boulangerie');
  const [ville, setVille] = useState('Lyon');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submitSearch() {
    setLoading(true);
    setError(null);

    const response = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ métier: metier, ville })
    });

    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? 'Erreur inconnue');
      return;
    }

    router.push(`/results?searchRunId=${payload.searchRunId}`);
  }

  return (
    <div className="card space-y-3">
      <h1 className="text-xl font-semibold">Prospection locale</h1>
      <p className="text-sm text-slate-600">Recherche via Google Places API officielle ou dataset mock.</p>
      <input className="input" value={metier} onChange={(e) => setMetier(e.target.value)} placeholder="Métier" />
      <input className="input" value={ville} onChange={(e) => setVille(e.target.value)} placeholder="Ville" />
      <button className="btn" onClick={submitSearch} disabled={loading}>
        {loading ? 'Recherche…' : 'Lancer la recherche'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
