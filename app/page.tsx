import Link from 'next/link';
import MarketCard from '@/components/MarketCard';
import type { Market, LeaderboardEntry } from '@/types';

const PLACEHOLDER_MARKETS: Market[] = [
  {
    id: '1',
    title: 'Will GTA VI launch in 2025?',
    description: 'Rockstar confirmed a 2025 window. Will it actually ship?',
    category: 'GAMES',
    type: 'YES_NO',
    status: 'OPEN',
    closes_at: new Date(Date.now() + 30 * 86400000).toISOString(),
    resolved_outcome: null,
    created_by: null,
    created_at: new Date().toISOString(),
    options: [
      { id: '1a', market_id: '1', label: 'Yes', order_index: 0 },
      { id: '1b', market_id: '1', label: 'No', order_index: 1 },
    ],
  },
  {
    id: '2',
    title: 'Who wins the next LoL World Championship?',
    description: "Predict which region takes home the Summoner's Cup.",
    category: 'ESPORTS',
    type: 'MULTI',
    status: 'OPEN',
    closes_at: new Date(Date.now() + 60 * 86400000).toISOString(),
    resolved_outcome: null,
    created_by: null,
    created_at: new Date().toISOString(),
    options: [
      { id: '2a', market_id: '2', label: 'Korea (LCK)', order_index: 0 },
      { id: '2b', market_id: '2', label: 'China (LPL)', order_index: 1 },
      { id: '2c', market_id: '2', label: 'Europe (LEC)', order_index: 2 },
    ],
  },
  {
    id: '3',
    title: 'Will Apple release AR glasses in 2025?',
    description: 'Following Vision Pro, will Apple ship a lighter AR glasses product?',
    category: 'TECH',
    type: 'YES_NO',
    status: 'OPEN',
    closes_at: new Date(Date.now() + 45 * 86400000).toISOString(),
    resolved_outcome: null,
    created_by: null,
    created_at: new Date().toISOString(),
    options: [
      { id: '3a', market_id: '3', label: 'Yes', order_index: 0 },
      { id: '3b', market_id: '3', label: 'No', order_index: 1 },
    ],
  },
  {
    id: '4',
    title: 'New Avengers movie announced in 2025?',
    description: 'Will Marvel officially announce a new Avengers film at Comic-Con or D23?',
    category: 'POP_CULTURE',
    type: 'YES_NO',
    status: 'OPEN',
    closes_at: new Date(Date.now() + 20 * 86400000).toISOString(),
    resolved_outcome: null,
    created_by: null,
    created_at: new Date().toISOString(),
    options: [
      { id: '4a', market_id: '4', label: 'Yes', order_index: 0 },
      { id: '4b', market_id: '4', label: 'No', order_index: 1 },
    ],
  },
  {
    id: '5',
    title: 'Best Esports Game of 2025?',
    description: 'Which title will dominate esports viewership in 2025?',
    category: 'ESPORTS',
    type: 'MULTI',
    status: 'OPEN',
    closes_at: new Date(Date.now() + 90 * 86400000).toISOString(),
    resolved_outcome: null,
    created_by: null,
    created_at: new Date().toISOString(),
    options: [
      { id: '5a', market_id: '5', label: 'League of Legends', order_index: 0 },
      { id: '5b', market_id: '5', label: 'Valorant', order_index: 1 },
      { id: '5c', market_id: '5', label: 'CS2', order_index: 2 },
    ],
  },
  {
    id: '6',
    title: 'Which console outsells in Q4 2025?',
    description: 'Holiday 2025 console battle: PS5 Pro vs Xbox vs Switch 2.',
    category: 'GAMES',
    type: 'MULTI',
    status: 'OPEN',
    closes_at: new Date(Date.now() + 120 * 86400000).toISOString(),
    resolved_outcome: null,
    created_by: null,
    created_at: new Date().toISOString(),
    options: [
      { id: '6a', market_id: '6', label: 'PlayStation 5 Pro', order_index: 0 },
      { id: '6b', market_id: '6', label: 'Nintendo Switch 2', order_index: 1 },
      { id: '6c', market_id: '6', label: 'Xbox Series X', order_index: 2 },
    ],
  },
];

async function getMarkets(): Promise<Market[]> {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const res = await fetch(`${base}/api/markets?status=OPEN&limit=6`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return PLACEHOLDER_MARKETS;
    const json = await res.json();
    return json.data?.length ? json.data : PLACEHOLDER_MARKETS;
  } catch {
    return PLACEHOLDER_MARKETS;
  }
}

async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const res = await fetch(`${base}/api/leaderboard`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data ?? []).slice(0, 5);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [markets, leaderboard] = await Promise.all([getMarkets(), getLeaderboard()]);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 text-center overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2 text-purple-300 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            No real money · Pure skill · 100% free
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Predict.
            </span>{' '}
            <span className="text-white">Compete.</span>{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
              Dominate.
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The ultimate virtual prediction arcade for gaming, esports, tech, and pop culture.
            Stake your free credits, climb the leaderboard, and prove you&apos;re the ultimate oracle.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/sign-up"
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5"
            >
              🚀 Get Started Free
            </Link>
            <Link
              href="/markets"
              className="w-full sm:w-auto border border-purple-500/50 text-purple-300 hover:bg-purple-500/10 font-semibold px-8 py-4 rounded-2xl text-lg transition-all"
            >
              Browse Markets →
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">1,000</div>
              <div>Free credits</div>
            </div>
            <div className="h-8 w-px bg-gray-800" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">50</div>
              <div>Levels to unlock</div>
            </div>
            <div className="h-8 w-px bg-gray-800" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">∞</div>
              <div>Bragging rights</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gray-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400 text-lg">Three simple steps to prediction glory</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎯',
                step: '01',
                title: 'Make Predictions',
                desc: 'Browse open markets across gaming, esports, tech, and pop culture. Stake your virtual credits on the outcome you believe in.',
              },
              {
                icon: '⚡',
                step: '02',
                title: 'Earn XP & Credits',
                desc: 'Win predictions to earn 2× your staked credits back plus 100 XP. Even participation earns 10 XP to help you level up.',
              },
              {
                icon: '🏆',
                step: '03',
                title: 'Climb Rankings',
                desc: 'Rise through 50 levels, earn rare badges, and claim your spot at the top of the global leaderboard.',
              },
            ].map((step) => (
              <div
                key={step.step}
                className="bg-gray-900 border border-gray-800 hover:border-purple-500/30 rounded-2xl p-8 text-center transition-all"
              >
                <div className="text-5xl mb-4">{step.icon}</div>
                <div className="text-xs text-purple-400 font-bold tracking-widest mb-2">STEP {step.step}</div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Markets */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">Featured Markets</h2>
              <p className="text-gray-400">Hot predictions happening right now</p>
            </div>
            <Link
              href="/markets"
              className="hidden sm:inline-block border border-purple-500/50 text-purple-400 hover:bg-purple-500/10 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              View All →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {markets.slice(0, 6).map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      {leaderboard.length > 0 && (
        <section className="py-20 px-4 bg-gray-900/30">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-white mb-2">🏆 Top Predictors</h2>
              <p className="text-gray-400">Can you reach the top of the leaderboard?</p>
            </div>
            <div className="flex flex-col gap-3">
              {leaderboard.map((entry) => (
                <div
                  key={entry.user_id}
                  className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl px-5 py-3"
                >
                  <span className="text-xl w-8 text-center">
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                  </span>
                  <div className="flex-1">
                    <div className="text-white font-semibold text-sm">{entry.display_name ?? entry.username}</div>
                    <div className="text-xs text-gray-500">Level {entry.level}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-cyan-400 font-semibold text-sm">{entry.xp.toLocaleString()} XP</div>
                    <div className="text-xs text-gray-500">{entry.win_rate.toFixed(0)}% wins</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link href="/leaderboard" className="text-purple-400 hover:text-purple-300 font-medium text-sm">
                Full leaderboard →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Disclaimer */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center bg-gray-900 border border-gray-800 rounded-2xl p-10">
          <div className="text-4xl mb-4">🎮</div>
          <h2 className="text-2xl font-bold text-white mb-4">No Real Money. Pure Skill.</h2>
          <p className="text-gray-400 leading-relaxed">
            GameMagicKit is a{' '}
            <strong className="text-white">100% free virtual prediction arcade</strong>.
            All credits are virtual and have no real monetary value. We never ask for payment
            information. This platform is purely for entertainment, skill-building, and friendly
            competition.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            {['No gambling', 'No real money', 'No purchases needed', 'Always free'].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <span className="text-green-400">✓</span> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-900 py-10 px-4 text-center text-gray-600 text-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-lg font-bold text-gray-400">
            🎮 GameMagicKit
          </Link>
          <div className="flex gap-6">
            {[
              { href: '/markets', label: 'Markets' },
              { href: '/leaderboard', label: 'Leaderboard' },
              { href: '/how-it-works', label: 'How It Works' },
              { href: '/faq', label: 'FAQ' },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-gray-400 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
          <div>© {new Date().getFullYear()} GameMagicKit. Virtual credits only.</div>
        </div>
      </footer>
    </div>
  );
}
