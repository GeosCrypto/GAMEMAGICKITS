interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  change?: string;
  changePositive?: boolean;
  subtitle?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  change,
  changePositive,
  subtitle,
}: StatsCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400 font-medium">{title}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div>
        <div className="text-3xl font-bold text-white">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
      </div>
      {change !== undefined && (
        <div className={`text-xs font-medium ${changePositive ? 'text-green-400' : 'text-red-400'}`}>
          {changePositive ? '↑' : '↓'} {change}
        </div>
      )}
    </div>
  );
}
