import { ResultsClient } from '@/components/ResultsClient';

export default function ResultsPage({ searchParams }: { searchParams: { searchRunId?: string } }) {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Résultats</h1>
      <ResultsClient searchRunId={searchParams.searchRunId} />
    </div>
  );
}
