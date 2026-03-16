import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);

    let query = supabase
      .from('markets')
      .select(`*, options:market_options(*)`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data: data ?? [], error: null });
  } catch {
    return NextResponse.json({ data: [], error: null });
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
    const { title, description, category, type, closes_at, options } = body;

    if (!title || !category || !type || !closes_at || !options?.length) {
      return NextResponse.json({ data: null, error: 'Missing required fields' }, { status: 400 });
    }

    const { data: market, error: marketError } = await supabase
      .from('markets')
      .insert({ title, description, category, type, closes_at, created_by: user.id })
      .select()
      .single();

    if (marketError) throw marketError;

    const optionRows = (options as string[]).map((label: string, i: number) => ({
      market_id: market.id,
      label,
      order_index: i,
    }));

    const { error: optError } = await supabase.from('market_options').insert(optionRows);
    if (optError) throw optError;

    return NextResponse.json({ data: market, error: null }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
