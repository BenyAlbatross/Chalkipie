import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { action: string } }
) {
  try {
    const { action } = params;
    const { searchParams } = new URL(request.url);
    const room = searchParams.get('room');

    // Validate action
    if (!['prettify', 'uglify', 'sloppify'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be prettify, uglify, or sloppify' },
        { status: 400 }
      );
    }

    if (!room) {
      return NextResponse.json(
        { error: 'Room parameter is required' },
        { status: 400 }
      );
    }

    // Fetch door version data
    const { data, error } = await supabase
      .from('door_versions')
      .select('*')
      .eq('room_id', room)
      .single();

    if (error) {
      // If no record found, return empty response
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: true,
          room,
          action,
          data: null
        });
      }
      throw error;
    }

    // Return appropriate data based on action
    let result;
    switch (action) {
      case 'prettify':
        result = {
          success: true,
          room,
          action,
          imageUrl: data.prettify_url,
          originalUrl: data.original_url
        };
        break;
      case 'uglify':
        result = {
          success: true,
          room,
          action,
          imageUrl: data.uglify_url,
          originalUrl: data.original_url
        };
        break;
      case 'sloppify':
        result = {
          success: true,
          room,
          action,
          text: data.sloppify_text,
          originalUrl: data.original_url
        };
        break;
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Render fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch render' },
      { status: 500 }
    );
  }
}
