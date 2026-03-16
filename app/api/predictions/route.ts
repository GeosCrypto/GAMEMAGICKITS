import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('predictions')
      .select(`*, markets(*), market_options(*)`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data: data ?? [], error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { market_id, option_id, credits_staked } = body;

    if (!market_id || !option_id || !credits_staked || credits_staked < 1) {
      return NextResponse.json({ data: null, error: 'Missing or invalid fields' }, { status: 400 });
    }

    // Check market is OPEN
    const { data: market } = await supabase
      .from('markets')
      .select('status')
      .eq('id', market_id)
      .single();

    if (!market || market.status !== 'OPEN') {
      return NextResponse.json({ data: null, error: 'Market is not open for predictions' }, { status: 400 });
    }

    // Check user credits
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('total_credits, predictions_count')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ data: null, error: 'Profile not found' }, { status: 404 });
    }

    if (profile.total_credits < credits_staked) {
      return NextResponse.json({ data: null, error: 'Insufficient credits' }, { status: 400 });
    }

    // Check duplicate prediction
    const { data: existing } = await supabase
      .from('predictions')
      .select('id')
      .eq('user_id', user.id)
      .eq('market_id', market_id)
      .single();

    if (existing) {
      return NextResponse.json({ data: null, error: 'You already predicted on this market' }, { status: 400 });
    }

    // Create prediction
    const { data: prediction, error: predErr } = await supabase
      .from('predictions')
      .insert({ user_id: user.id, market_id, option_id, credits_staked })
      .select()
      .single();

    if (predErr) throw predErr;

    // Deduct credits
    await supabase
      .from('user_profiles')
      .update({
        total_credits: profile.total_credits - credits_staked,
        predictions_count: (profile.predictions_count ?? 0) + 1,
      })
      .eq('user_id', user.id);

    // Record STAKE transaction
    await supabase.from('credit_transactions').insert({
      user_id: user.id,
      amount: -credits_staked,
      type: 'STAKE',
      note: `Staked on market: ${market_id}`,
    });

    return NextResponse.json({ data: prediction, error: null }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
