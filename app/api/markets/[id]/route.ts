import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: market, error } = await supabase
      .from('markets')
      .select(`*, options:market_options(*)`)
      .eq('id', id)
      .single();

    if (error || !market) {
      return NextResponse.json({ data: null, error: 'Market not found' }, { status: 404 });
    }

    // Get prediction stats
    const { data: predictions } = await supabase
      .from('predictions')
      .select('option_id, credits_staked')
      .eq('market_id', id);

    const preds = predictions ?? [];
    const total_staked = preds.reduce((sum, p) => sum + p.credits_staked, 0);
    const participants = new Set(preds.map((p: { option_id: string }) => p.option_id)).size;

    const option_stats = (market.options ?? []).map((opt: { id: string; label: string }) => {
      const optPreds = preds.filter((p: { option_id: string }) => p.option_id === opt.id);
      return {
        option_id: opt.id,
        label: opt.label,
        count: optPreds.length,
        total_staked: optPreds.reduce((s: number, p: { credits_staked: number }) => s + p.credits_staked, 0),
      };
    });

    return NextResponse.json({
      data: { ...market, total_staked, participants, option_stats },
      error: null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    const { data, error } = await supabase
      .from('markets')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
