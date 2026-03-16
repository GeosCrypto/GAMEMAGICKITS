import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import BadgeCard from '@/components/BadgeCard';
import StatsCard from '@/components/StatsCard';
import { formatDate, getResultBadgeClass, getLevelFromXP, getXPForNextLevel, getXPForCurrentLevel } from '@/lib/utils';
import type { Badge, UserBadge, Prediction } from '@/types';
import EditDisplayName from './EditDisplayName';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/sign-in');

  const [profileRes, predictionsRes, userBadgesRes, allBadgesRes] = await Promise.all([
    supabase.from('user_profiles').select('*, users(username, email)').eq('user_id', user.id).single(),
    supabase.from('predictions').select('*, markets(title, status), market_options(label)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
    supabase.from('user_badges').select('*, badges(*)').eq('user_id', user.id),
    supabase.from('badges').select('*'),
  ]);

  const profile = profileRes.data;
  const predictions: Prediction[] = predictionsRes.data ?? [];
  const userBadges: UserBadge[] = userBadgesRes.data ?? [];
  const allBadges: Badge[] = allBadgesRes.data ?? [];

  if (!profile) redirect('/auth/sign-in');

  const username = (profile.users as { username: string } | null)?.username ?? 'Unknown';
  const displayName = profile.display_name ?? username;
  const initials = displayName.slice(0, 2).toUpperCase();

  const level = getLevelFromXP(profile.xp);
  const xpForCurrent = getXPForCurrentLevel(level);
  const xpForNext = getXPForNextLevel(level);
  const xpProgress = xpForNext > xpForCurrent
    ? Math.round(((profile.xp - xpForCurrent) / (xpForNext - xpForCurrent)) * 100)
    : 100;

  const badgeMap = new Map(userBadges.map((ub) => [ub.badge_id, ub]));

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-3xl font-bold text-white shrink-0">
              {initials}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white">{displayName}</h1>
                <span className="text-sm bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-lg">
                  Level {level}
                </span>
              </div>
              <div className="text-gray-500 text-sm mb-4">@{username}</div>

              {/* XP Bar */}
              <div className="max-w-sm">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{profile.xp.toLocaleString()} XP</span>
                  <span>Next level: {xpForNext.toLocaleString()} XP</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>
            </div>

            <EditDisplayName currentName={displayName} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Credits" value={profile.total_credits} icon="💰" />
          <StatsCard title="Win Rate" value={`${Number(profile.win_rate ?? 0).toFixed(1)}%`} icon="📈" />
          <StatsCard title="Predictions" value={profile.predictions_count} icon="🎯" />
          <StatsCard title="Wins" value={profile.wins_count} icon="🏆" />
        </div>

        {/* Predictions History */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-5">Recent Predictions</h2>
          {predictions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-3xl mb-3">🎯</p>
              <p>No predictions yet.</p>
              <Link href="/markets" className="text-purple-400 hover:text-purple-300 text-sm mt-2 inline-block">
                Browse markets →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-800">
                    <th className="text-left pb-3 font-medium">Market</th>
                    <th className="text-left pb-3 font-medium">Pick</th>
                    <th className="text-right pb-3 font-medium">Stake</th>
                    <th className="text-right pb-3 font-medium">Result</th>
                    <th className="text-right pb-3 font-medium hidden sm:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {predictions.map((pred) => {
                    const market = pred.markets as { title: string; status: string } | null;
                    const option = pred.market_options as { label: string } | null;
                    return (
                      <tr key={pred.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="py-3 pr-4 text-gray-300 max-w-[200px] truncate">
                          {market?.title ?? '—'}
                        </td>
                        <td className="py-3 pr-4 text-gray-400">{option?.label ?? '—'}</td>
                        <td className="py-3 pr-4 text-right text-yellow-400">{pred.credits_staked.toLocaleString()}</td>
                        <td className="py-3 text-right">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getResultBadgeClass(pred.result)}`}>
                            {pred.result}
                          </span>
                        </td>
                        <td className="py-3 text-right text-gray-500 hidden sm:table-cell">
                          {formatDate(pred.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-5">
            Badges
            <span className="ml-3 text-sm font-normal text-gray-500">
              {userBadges.length} / {allBadges.length} unlocked
            </span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {allBadges.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                userBadge={badgeMap.get(badge.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
