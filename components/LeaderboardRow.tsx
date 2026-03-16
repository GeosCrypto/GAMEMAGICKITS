import type { LeaderboardEntry } from '@/types';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
}

const RANK_COLORS: Record<number, string> = {
  1: 'text-yellow-400',
  2: 'text-gray-300',
  3: 'text-amber-600',
};

export default function LeaderboardRow({ entry, isCurrentUser = false }: LeaderboardRowProps) {
  const initials = (entry.display_name ?? entry.username)
    .slice(0, 2)
    .toUpperCase();

  const rankColor = RANK_COLORS[entry.rank] ?? 'text-gray-500';

  return (
    <div
      className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-colors ${
        isCurrentUser
          ? 'bg-purple-500/10 border-purple-500/40'
          : 'bg-gray-900 border-gray-800 hover:border-gray-700'
      }`}
    >
      {/* Rank */}
      <div className={`w-8 text-center font-bold text-lg ${rankColor}`}>
        {entry.rank <= 3 ? (
          <span>{entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}</span>
        ) : (
          <span className="text-sm">{entry.rank}</span>
        )}
      </div>

      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
        {initials}
      </div>

      {/* Name + Level */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white truncate">
            {entry.display_name ?? entry.username}
            {isCurrentUser && <span className="ml-1 text-xs text-purple-400">(you)</span>}
          </span>
          <span className="shrink-0 text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded-md">
            Lv {entry.level}
          </span>
        </div>
        <div className="text-xs text-gray-500">@{entry.username}</div>
      </div>

      {/* Stats */}
      <div className="hidden sm:flex items-center gap-6 text-sm">
        <div className="text-center">
          <div className="font-semibold text-cyan-400">{entry.xp.toLocaleString()}</div>
          <div className="text-xs text-gray-500">XP</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-yellow-400">{entry.total_credits.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Credits</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-green-400">{entry.win_rate.toFixed(0)}%</div>
          <div className="text-xs text-gray-500">Win Rate</div>
        </div>
      </div>

      {/* Mobile stats */}
      <div className="sm:hidden text-right">
        <div className="text-sm font-semibold text-cyan-400">{entry.xp.toLocaleString()} XP</div>
        <div className="text-xs text-gray-500">{entry.win_rate.toFixed(0)}% wins</div>
      </div>
    </div>
  );
}
