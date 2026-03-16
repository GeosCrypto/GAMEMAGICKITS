'use client';

import { useState, useEffect } from 'react';
import LeaderboardRow from '@/components/LeaderboardRow';
import type { LeaderboardEntry } from '@/types';
import { createClient } from '@/lib/supabase/client';

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
    });

    fetch('/api/leaderboard')
      .then((r) => r.json())
      .then((json) => {
        setEntries(json.data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const top3 = entries.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-white mb-3">
            🏆 Leaderboard
          </h1>
          <p className="text-gray-400 text-lg">The top predictors of the GameMagicKit arcade</p>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-900 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">👑</p>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No rankings yet</h3>
            <p className="text-gray-500 text-sm">Be the first to make predictions and claim the throne!</p>
          </div>
        ) : (
          <>
            {/* Podium (top 3) */}
            {top3.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-10 items-end">
                {/* 2nd place */}
                <div className="flex flex-col items-center text-center pb-0">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-xl font-bold text-white mb-2">
                    {(top3[1].display_name ?? top3[1].username).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-sm font-semibold text-gray-300 truncate max-w-full">
                    {top3[1].display_name ?? top3[1].username}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">{top3[1].xp.toLocaleString()} XP</div>
                  <div className="w-full bg-gray-700 rounded-t-xl py-4 text-center">
                    <div className="text-3xl">🥈</div>
                  </div>
                </div>

                {/* 1st place */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl font-bold text-white mb-2 shadow-lg shadow-yellow-500/30">
                    {(top3[0].display_name ?? top3[0].username).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-base font-bold text-white truncate max-w-full">
                    {top3[0].display_name ?? top3[0].username}
                  </div>
                  <div className="text-xs text-gray-400 mb-2">{top3[0].xp.toLocaleString()} XP</div>
                  <div className="w-full bg-gradient-to-b from-yellow-500/20 to-yellow-500/5 border border-yellow-500/30 rounded-t-xl py-6 text-center">
                    <div className="text-4xl">🥇</div>
                  </div>
                </div>

                {/* 3rd place */}
                <div className="flex flex-col items-center text-center pb-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-lg font-bold text-white mb-2">
                    {(top3[2].display_name ?? top3[2].username).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-sm font-semibold text-gray-400 truncate max-w-full">
                    {top3[2].display_name ?? top3[2].username}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">{top3[2].xp.toLocaleString()} XP</div>
                  <div className="w-full bg-gray-800 rounded-t-xl py-3 text-center">
                    <div className="text-3xl">🥉</div>
                  </div>
                </div>
              </div>
            )}

            {/* Full List */}
            <div className="flex flex-col gap-2">
              {entries.map((entry) => (
                <LeaderboardRow
                  key={entry.user_id}
                  entry={entry}
                  isCurrentUser={entry.user_id === currentUserId}
                />
              ))}
            </div>

            {entries.length === 0 && (
              <div className="text-center py-12 text-gray-500">No entries yet</div>
            )}
          </>
        )}

        <div className="mt-10 text-center text-sm text-gray-600">
          Rankings update in real-time based on XP earned from predictions.
        </div>
      </div>
    </div>
  );
}
