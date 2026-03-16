import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { getCategoryColor, getCategoryLabel, getStatusBadgeClass, formatDate } from '@/lib/utils';
import type { Market } from '@/types';

export default async function AdminMarketsPage() {
  const supabase = await createClient();

  const { data: markets } = await supabase
    .from('markets')
    .select('*, options:market_options(*)')
    .order('created_at', { ascending: false });

  const mktList: Market[] = markets ?? [];

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Markets</h1>
            <p className="text-gray-400 mt-1">{mktList.length} total markets</p>
          </div>
          <Link
            href="/admin/markets/new"
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            + New Market
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {mktList.map((market) => (
            <div key={market.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getCategoryColor(market.category)}`}>
                      {getCategoryLabel(market.category)}
                    </span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusBadgeClass(market.status)}`}>
                      {market.status}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold mb-1 truncate">{market.title}</h3>
                  <div className="text-xs text-gray-500 flex gap-4">
                    <span>Closes: {formatDate(market.closes_at)}</span>
                    <span>Created: {formatDate(market.created_at)}</span>
                  </div>
                  {market.resolved_outcome && (
                    <div className="text-xs text-green-400 mt-1">
                      Resolved: <strong>{market.resolved_outcome}</strong>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {market.status === 'OPEN' && (
                    <Link
                      href={`/admin/markets/${market.id}/settle`}
                      className="text-xs bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Settle
                    </Link>
                  )}
                  {market.status === 'CLOSED' && (
                    <Link
                      href={`/admin/markets/${market.id}/settle`}
                      className="text-xs bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Settle
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}

          {mktList.length === 0 && (
            <div className="text-center py-24 text-gray-500">
              <p className="text-4xl mb-4">📋</p>
              <p>No markets yet.</p>
              <Link href="/admin/markets/new" className="text-purple-400 hover:text-purple-300 text-sm mt-2 inline-block">
                Create the first market →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
