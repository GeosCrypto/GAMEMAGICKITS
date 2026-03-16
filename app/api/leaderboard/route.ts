import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('user_profiles')
      .select(`*, users(username, email)`)
      .order('xp', { ascending: false })
      .limit(50);

    if (error) throw error;

    const entries = (data ?? []).map((profile, index) => ({
      rank: index + 1,
      user_id: profile.user_id,
      display_name: profile.display_name,
      username: (profile.users as { username: string } | null)?.username ?? 'Unknown',
      level: profile.level,
      xp: profile.xp,
      total_credits: profile.total_credits,
      win_rate: Number(profile.win_rate ?? 0),
      predictions_count: profile.predictions_count,
      wins_count: profile.wins_count,
    }));

    return NextResponse.json({ data: entries, error: null });
  } catch (err) {
    console.error('[GET /api/leaderboard]', err);
    return NextResponse.json({ data: [], error: null });
  }
}
