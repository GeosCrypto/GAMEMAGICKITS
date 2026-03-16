'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Market } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SettleMarketPage({ params }: PageProps) {
  const [market, setMarket] = useState<Market | null>(null);
  const [resolvedOutcome, setResolvedOutcome] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [stats, setStats] = useState<{ total_predictions: number; winners: number } | null>(null);

  useEffect(() => {
    params.then(({ id }) => {
      fetch(`/api/markets/${id}`)
        .then((r) => r.json())
        .then((json) => {
          if (json.data) setMarket(json.data);
        });
    });
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!market) return;
    setError(null);
    setLoading(true);

    const res = await fetch(`/api/markets/${market.id}/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolved_outcome: resolvedOutcome }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(json.error ?? 'Failed to settle market');
      return;
    }

    setSuccess(true);
    setStats(json.data);
  }

  if (success && stats) {
    return (
      <div className="min-h-screen bg-gray-950 pt-24 px-4">
        <div className="max-w-lg mx-auto text-center bg-gray-900 border border-green-500/30 rounded-2xl p-10">
          <p className="text-5xl mb-4">🎉</p>
          <h2 className="text-2xl font-bold text-white mb-4">Market Settled!</h2>
          <p className="text-gray-400 mb-2">
            Outcome: <strong className="text-green-400">{resolvedOutcome}</strong>
          </p>
          <div className="flex justify-center gap-8 my-6 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.total_predictions}</div>
              <div className="text-gray-500">Total predictions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{stats.winners}</div>
              <div className="text-gray-500">Winners rewarded</div>
            </div>
          </div>
          <Link
            href="/admin/markets"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Back to Markets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-16 px-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <Link href="/admin/markets" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            ← Back to Markets
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-white mb-2">Settle Market</h1>
        <p className="text-gray-400 mb-8">Choose the resolved outcome and distribute rewards.</p>

        {!market ? (
          <div className="animate-pulse bg-gray-900 border border-gray-800 rounded-2xl h-48" />
        ) : (
          <>
            {/* Market info */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
              <h2 className="text-white font-semibold mb-2">{market.title}</h2>
              {market.description && <p className="text-gray-400 text-sm">{market.description}</p>}
            </div>

            {market.status === 'SETTLED' ? (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 text-center">
                <p className="text-yellow-400 font-semibold">This market is already settled.</p>
                <p className="text-gray-400 text-sm mt-2">
                  Resolved outcome: <strong>{market.resolved_outcome}</strong>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Select Resolved Outcome *
                  </label>
                  <div className="flex flex-col gap-2">
                    {(market.options ?? []).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setResolvedOutcome(opt.label)}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                          resolvedOutcome === opt.label
                            ? 'border-green-500 bg-green-500/10 text-green-300'
                            : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        <span className={`mr-2 inline-block w-4 h-4 rounded-full border-2 align-middle ${
                          resolvedOutcome === opt.label ? 'border-green-400 bg-green-400' : 'border-gray-600'
                        }`} />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-sm text-yellow-400">
                  ⚠️ This action is <strong>irreversible</strong>. Winning predictions will receive 2× credits and 100 XP. Losing predictions lose their staked credits.
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!resolvedOutcome || loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  {loading ? 'Settling…' : `Settle with "${resolvedOutcome || '…'}"`}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
