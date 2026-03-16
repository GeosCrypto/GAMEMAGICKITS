import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { resolved_outcome } = body;

    if (!resolved_outcome) {
      return NextResponse.json({ data: null, error: 'resolved_outcome is required' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Get market + options
    const { data: market, error: mktErr } = await admin
      .from('markets')
      .select(`*, options:market_options(*)`)
      .eq('id', id)
      .single();

    if (mktErr || !market) {
      return NextResponse.json({ data: null, error: 'Market not found' }, { status: 404 });
    }

    if (market.status === 'SETTLED') {
      return NextResponse.json({ data: null, error: 'Market already settled' }, { status: 400 });
    }

    // Find winning option
    const winningOption = (market.options as { id: string; label: string }[]).find(
      (o) => o.label === resolved_outcome
    );

    // Get all predictions for this market
    const { data: predictions } = await admin
      .from('predictions')
      .select('*')
      .eq('market_id', id);

    const preds = predictions ?? [];
    const winnerIds = new Set<string>();

    // Update predictions + award credits/XP
    for (const pred of preds) {
      const isWin = winningOption && pred.option_id === winningOption.id;
      const result = isWin ? 'WON' : 'LOST';

      await admin.from('predictions').update({ result }).eq('id', pred.id);

      if (isWin) {
        winnerIds.add(pred.user_id);
        const reward = pred.credits_staked * 2;

        // Award win credits
        await admin.from('credit_transactions').insert({
          user_id: pred.user_id,
          amount: reward,
          type: 'WIN_REWARD',
          note: `Won prediction on: ${market.title}`,
        });

        // Update credits + XP for winner
        const { data: profile } = await admin
          .from('user_profiles')
          .select('total_credits, xp, wins_count, predictions_count')
          .eq('user_id', pred.user_id)
          .single();

        if (profile) {
          const newXP = (profile.xp ?? 0) + 100;
          const newCredits = (profile.total_credits ?? 0) + reward;
          const newWins = (profile.wins_count ?? 0) + 1;
          const winRate = ((newWins / Math.max(profile.predictions_count, 1)) * 100);

          await admin.from('user_profiles').update({
            total_credits: newCredits,
            xp: newXP,
            wins_count: newWins,
            win_rate: winRate,
          }).eq('user_id', pred.user_id);
        }
      } else {
        // Award participation XP
        const { data: profile } = await admin
          .from('user_profiles')
          .select('xp')
          .eq('user_id', pred.user_id)
          .single();

        if (profile) {
          await admin.from('user_profiles').update({
            xp: (profile.xp ?? 0) + 10,
          }).eq('user_id', pred.user_id);
        }
      }
    }

    // Settle the market
    await admin.from('markets').update({
      status: 'SETTLED',
      resolved_outcome,
    }).eq('id', id);

    return NextResponse.json({
      data: {
        settled: true,
        total_predictions: preds.length,
        winners: winnerIds.size,
      },
      error: null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
