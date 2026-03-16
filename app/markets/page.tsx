import { Suspense } from 'react';
import MarketCard from '@/components/MarketCard';
import CategoryFilter from '@/components/CategoryFilter';
import type { Market } from '@/types';

interface PageProps {
  searchParams: Promise<{ category?: string; search?: string }>;
}

async function getMarkets(category?: string): Promise<Market[]> {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const params = new URLSearchParams({ limit: '100' });
    if (category && category !== 'ALL') params.set('category', category);
    const res = await fetch(`${base}/api/markets?${params}`, { next: { revalidate: 30 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function MarketsPage({ searchParams }: PageProps) {
  const { category, search } = await searchParams;
  const markets = await getMarkets(category);

  const filtered = search
    ? markets.filter(
        (m) =>
          m.title.toLowerCase().includes(search.toLowerCase()) ||
          m.description?.toLowerCase().includes(search.toLowerCase())
      )
    : markets;

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Prediction Markets</h1>
          <p className="text-gray-400">Choose your battles. Stake your credits. Prove your instincts.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Suspense fallback={<div className="h-10 bg-gray-800 rounded-full animate-pulse w-64" />}>
            <CategoryFilter />
          </Suspense>

          <form className="flex-1 max-w-sm">
            <input
              name="search"
              defaultValue={search}
              placeholder="Search markets…"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
            />
          </form>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-500 mb-6">
          {filtered.length} market{filtered.length !== 1 ? 's' : ''} found
          {category && category !== 'ALL' && ` in ${category}`}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-gray-500">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No markets found</h3>
            <p className="text-sm">
              {search ? 'Try a different search term' : 'No markets in this category yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
