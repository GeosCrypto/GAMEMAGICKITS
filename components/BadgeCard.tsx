import type { Badge, UserBadge } from '@/types';

interface BadgeCardProps {
  badge: Badge;
  userBadge?: UserBadge;
}

export default function BadgeCard({ badge, userBadge }: BadgeCardProps) {
  const unlocked = !!userBadge;

  return (
    <div
      className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border text-center transition-all ${
        unlocked
          ? 'bg-gray-900 border-purple-500/40 shadow-lg shadow-purple-500/10'
          : 'bg-gray-900/50 border-gray-800 opacity-50 grayscale'
      }`}
    >
      {unlocked && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-[10px]">
          ✓
        </div>
      )}
      <div className={`text-4xl ${unlocked ? '' : 'filter grayscale'}`}>
        {badge.icon}
      </div>
      <div>
        <h4 className={`font-semibold text-sm ${unlocked ? 'text-white' : 'text-gray-500'}`}>
          {badge.name}
        </h4>
        <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
        {unlocked && userBadge && (
          <p className="text-xs text-purple-400 mt-2">
            Earned {new Date(userBadge.awarded_at).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}
