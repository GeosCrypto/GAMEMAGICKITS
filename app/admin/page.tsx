import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import StatsCard from '@/components/StatsCard';

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [marketsRes, predictionsRes, usersRes] = await Promise.all([
    supabase.from('markets').select('status', { count: 'exact' }),
    supabase.from('predictions').select('id', { count: 'exact' }),
    supabase.from('users').select('id', { count: 'exact' }),
  ]);

  const { data: markets } = marketsRes;
  const openMarkets = (markets ?? []).filter((m: { status: string }) => m.status === 'OPEN').length;
  const settledMarkets = (markets ?? []).filter((m: { status: string }) => m.status === 'SETTLED').length;

  const totalPredictions = predictionsRes.count ?? 0;
  const totalUsers = usersRes.count ?? 0;

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400 mt-1">Manage markets and monitor the arcade</p>
          </div>
          <Link
            href="/admin/markets/new"
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            + New Market
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatsCard title="Open Markets" value={openMarkets} icon="🟢" />
          <StatsCard title="Settled Markets" value={settledMarkets} icon="✅" />
          <StatsCard title="Total Users" value={totalUsers} icon="👥" />
          <StatsCard title="Total Predictions" value={totalPredictions} icon="🎯" />
        </div>

        {/* Quick links */}
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              href: '/admin/markets',
              icon: '📋',
              title: 'Manage Markets',
              desc: 'View, close, and settle prediction markets',
            },
            {
              href: '/admin/markets/new',
              icon: '➕',
              title: 'Create Market',
              desc: 'Add a new prediction market with options',
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-gray-900 border border-gray-800 hover:border-purple-500/40 rounded-2xl p-6 transition-all group"
            >
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-semibold text-white group-hover:text-purple-300 mb-1 transition-colors">{item.title}</h3>
              <p className="text-sm text-gray-400">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
