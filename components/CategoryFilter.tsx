'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { getCategoryColor, getCategoryLabel } from '@/lib/utils';

const CATEGORIES = ['ALL', 'GAMES', 'ESPORTS', 'TECH', 'POP_CULTURE'] as const;

export default function CategoryFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get('category') ?? 'ALL';

  function handleSelect(cat: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === 'ALL') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => {
        const isActive = active === cat;
        const colorClass = cat === 'ALL'
          ? 'text-white bg-purple-600 border-purple-600'
          : getCategoryColor(cat);

        return (
          <button
            key={cat}
            onClick={() => handleSelect(cat)}
            className={`text-sm font-medium px-4 py-2 rounded-full border transition-all duration-150 ${
              isActive
                ? cat === 'ALL'
                  ? 'bg-purple-600 border-purple-600 text-white'
                  : `${colorClass} opacity-100`
                : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-200 bg-gray-900'
            }`}
          >
            {cat === 'ALL' ? 'All' : getCategoryLabel(cat)}
          </button>
        );
      })}
    </div>
  );
}
