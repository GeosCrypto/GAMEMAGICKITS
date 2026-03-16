export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

const XP_THRESHOLDS = [
  0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700,
  3250, 3850, 4500, 5200, 5950, 6750, 7600, 8500, 9450, 10450,
  11500, 12600, 13750, 14950, 16200, 17500, 18850, 20250, 21700, 23200,
  24750, 26350, 28000, 29700, 31450, 33250, 35100, 37000, 38950, 40950,
  43000, 45100, 47250, 49450, 51700, 54000, 56350, 58750, 61200, 63700,
];

export function getLevelFromXP(xp: number): number {
  let level = 1;
  for (let i = 1; i < XP_THRESHOLDS.length; i++) {
    if (xp >= XP_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return Math.min(level, 50);
}

export function getXPForNextLevel(level: number): number {
  const nextLevel = Math.min(level, 49);
  return XP_THRESHOLDS[nextLevel] ?? XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
}

export function getXPForCurrentLevel(level: number): number {
  const currentLevel = Math.max(level - 1, 0);
  return XP_THRESHOLDS[currentLevel] ?? 0;
}

export function formatCredits(amount: number): string {
  return `${amount.toLocaleString()} credits`;
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatDateShort(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function getCategoryColor(category: string): string {
  switch (category) {
    case 'GAMES':
      return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
    case 'ESPORTS':
      return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    case 'TECH':
      return 'text-green-400 bg-green-500/10 border-green-500/30';
    case 'POP_CULTURE':
      return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    default:
      return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
  }
}

export function getCategoryLabel(category: string): string {
  switch (category) {
    case 'GAMES':
      return 'Games';
    case 'ESPORTS':
      return 'Esports';
    case 'TECH':
      return 'Tech';
    case 'POP_CULTURE':
      return 'Pop Culture';
    default:
      return category;
  }
}

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'OPEN':
      return 'text-green-400 bg-green-500/10 border border-green-500/30';
    case 'CLOSED':
      return 'text-yellow-400 bg-yellow-500/10 border border-yellow-500/30';
    case 'SETTLED':
      return 'text-gray-400 bg-gray-500/10 border border-gray-500/30';
    default:
      return 'text-gray-400 bg-gray-500/10 border border-gray-500/30';
  }
}

export function getResultBadgeClass(result: string): string {
  switch (result) {
    case 'WON':
      return 'text-green-400 bg-green-500/10 border border-green-500/30';
    case 'LOST':
      return 'text-red-400 bg-red-500/10 border border-red-500/30';
    case 'PENDING':
      return 'text-yellow-400 bg-yellow-500/10 border border-yellow-500/30';
    default:
      return 'text-gray-400 bg-gray-500/10 border border-gray-500/30';
  }
}
