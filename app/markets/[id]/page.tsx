import { notFound } from 'next/navigation';
import Link from 'next/link';
import PredictionForm from '@/components/PredictionForm';
import CountdownTimer from '@/components/CountdownTimer';
import { createClient } from '@/lib/supabase/server';
import { getCategoryColor, getCategoryLabel, getStatusBadgeClass, formatDate } from '@/lib/utils';
import type { MarketWithStats } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getMarket(id: string): Promise<MarketWithStats | null> {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const res = await fetch(`${base}/api/markets/${id}`, { next: { revalidate: 10 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export default async function MarketDetailPage({ params }: PageProps) {
  const { id } = await params;
  const market = await getMarket(id);

  if (!market) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userCredits = 0;
  let userPrediction = null;

  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('total_credits')
      .eq('user_id', user.id)
      .single();
    userCredits = profile?.total_credits ?? 0;

    const { data: pred } = await supabase
      .from('predictions')
      .select('*, market_options(*)')
      .eq('user_id', user.id)
      .eq('market_id', id)
      .single();
    userPrediction = pred;
  }

  const totalStaked = market.total_staked ?? 0;

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-500">
          <Link href="/markets" className="hover:text-gray-300 transition-colors">Markets</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-300">{market.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Market header */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getCategoryColor(market.category)}`}>
                  {getCategoryLabel(market.category)}
                </span>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusBadgeClass(market.status)}`}>
                  {market.status}
                </span>
                {market.type === 'MULTI' && (
                  <span className="text-xs font-medium px-3 py-1 rounded-full text-blue-400 bg-blue-500/10 border border-blue-500/30">
                    MULTI-OUTCOME
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold text-white mb-3">{market.title}</h1>

              {market.description && (
                <p className="text-gray-400 leading-relaxed mb-4">{market.description}</p>
              )}

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <span>⏱</span>
                  <CountdownTimer closesAt={market.closes_at} />
                </div>
                <span>Closes: {formatDate(market.closes_at)}</span>
              </div>

              {market.status === 'SETTLED' && market.resolved_outcome && (
                <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-xl p-3">
                  <span className="text-green-400 font-medium">
                    ✓ Resolved: <strong>{market.resolved_outcome}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Sentiment / Voting distribution */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Prediction Distribution</h2>
              <div className="flex flex-col gap-3">
                {(market.option_stats ?? market.options?.map((o) => ({
                  option_id: o.id,
                  label: o.label,
                  count: 0,
                  total_staked: 0,
                })) ?? []).map((stat) => {
                  const pct = totalStaked > 0 ? Math.round((stat.total_staked / totalStaked) * 100) : 0;
                  return (
                    <div key={stat.option_id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">{stat.label}</span>
                        <span className="text-gray-400">{stat.count} predictions · {pct}%</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-800 flex gap-6 text-sm text-gray-500">
                <span>💰 {totalStaked.toLocaleString()} credits staked</span>
                <span>👥 {market.participants ?? 0} participants</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-5">
            {userPrediction ? (
              <div className="bg-gray-900 border border-purple-500/30 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Your Prediction</h3>
                <div className="flex items-center justify-between">
                  <span className="text-purple-300 font-medium">
                    {(userPrediction.market_options as { label: string } | null)?.label ?? '—'}
                  </span>
                  <span className="text-yellow-400 font-semibold">
                    {userPrediction.credits_staked.toLocaleString()} credits
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Placed {formatDate(userPrediction.created_at)}
                </div>
                <div className="mt-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    userPrediction.result === 'WON' ? 'text-green-400 bg-green-500/10 border border-green-500/30' :
                    userPrediction.result === 'LOST' ? 'text-red-400 bg-red-500/10 border border-red-500/30' :
                    'text-yellow-400 bg-yellow-500/10 border border-yellow-500/30'
                  }`}>
                    {userPrediction.result}
                  </span>
                </div>
              </div>
            ) : user ? (
              <PredictionForm
                market={market}
                options={market.options ?? []}
                userCredits={userCredits}
              />
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
                <p className="text-3xl mb-3">🎯</p>
                <h3 className="text-lg font-semibold text-white mb-2">Make a Prediction</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Sign in to stake your virtual credits and compete on the leaderboard.
                </p>
                <Link
                  href={`/auth/sign-in?redirectTo=/markets/${id}`}
                  className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-colors text-center"
                >
                  Sign In to Predict
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="block w-full mt-3 border border-purple-500/50 text-purple-400 hover:bg-purple-500/10 font-medium py-3 rounded-xl transition-colors text-center text-sm"
                >
                  Create Free Account
                </Link>
              </div>
            )}

            {/* Market info card */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-sm">
              <h3 className="font-semibold text-white mb-3">Market Info</h3>
              <dl className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Type</dt>
                  <dd className="text-gray-300">{market.type === 'YES_NO' ? 'Yes / No' : 'Multi-outcome'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Category</dt>
                  <dd className="text-gray-300">{getCategoryLabel(market.category)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Created</dt>
                  <dd className="text-gray-300">{formatDate(market.created_at)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Reward</dt>
                  <dd className="text-green-400">2× stake on win</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
