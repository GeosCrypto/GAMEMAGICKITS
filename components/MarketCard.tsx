import Link from 'next/link';
import type { Market, MarketOption } from '@/types';
import { getCategoryColor, getCategoryLabel, getStatusBadgeClass } from '@/lib/utils';

interface MarketCardProps {
  market: Market & { options?: MarketOption[] };
}

export default function MarketCard({ market }: MarketCardProps) {
  const closesAt = new Date(market.closes_at);
  const now = new Date();
  const isExpired = closesAt < now;

  const timeLabel = () => {
    if (isExpired) return 'Closed';
    const diff = closesAt.getTime() - now.getTime();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    if (days > 0) return `${days}d ${hours}h left`;
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${mins}m left`;
    return `${mins}m left`;
  };

  return (
    <Link href={`/markets/${market.id}`}>
      <div className="group bg-gray-900 border border-gray-800 hover:border-purple-500/50 rounded-2xl p-5 h-full flex flex-col gap-4 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getCategoryColor(market.category)}`}>
            {getCategoryLabel(market.category)}
          </span>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusBadgeClass(market.status)}`}>
            {market.status}
          </span>
          {market.type === 'MULTI' && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full text-blue-400 bg-blue-500/10 border border-blue-500/30">
              MULTI
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-white group-hover:text-purple-300 transition-colors leading-snug line-clamp-2">
          {market.title}
        </h3>

        {/* Description */}
        {market.description && (
          <p className="text-sm text-gray-400 line-clamp-2 flex-1">
            {market.description}
          </p>
        )}

        {/* Options preview */}
        {market.options && market.options.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {market.options.slice(0, 3).map((opt) => (
              <span
                key={opt.id}
                className="text-xs bg-gray-800 border border-gray-700 rounded-md px-2 py-0.5 text-gray-300"
              >
                {opt.label}
              </span>
            ))}
            {market.options.length > 3 && (
              <span className="text-xs text-gray-500">+{market.options.length - 3} more</span>
            )}
          </div>
        )}

        {/* Sentiment bar (mock) */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Yes / Option A</span>
            <span>50%</span>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full" style={{ width: '50%' }} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-800">
          <span className={isExpired ? 'text-red-400' : 'text-green-400'}>
            ⏱ {timeLabel()}
          </span>
          <span className="text-purple-400 group-hover:text-purple-300 transition-colors">
            Predict →
          </span>
        </div>
      </div>
    </Link>
  );
}
