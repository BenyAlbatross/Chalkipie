import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const { id, style } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Door ID is required' }, { status: 400 });
    }

    // 1. Update status to 'extracted' and set style
    const { data, error } = await supabase
      .from('door_chalks')
      .update({ 
        status: 'extracted',
        style: style || 'pretty' 
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Process error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}