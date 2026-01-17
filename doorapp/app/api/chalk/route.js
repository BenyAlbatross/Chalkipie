import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Standard client works fine for public routes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');
    const style = formData.get('style'); 
    const semester = formData.get('semester');

    // 1. Upload to Storage (Using a timestamp for uniqueness since no user_id)
    const fileName = `public/${Date.now()}-${file.name}`;
    const { data: uploadData, error: storageError } = await supabase.storage
      .from('chalk-images')
      .upload(fileName, file);

    if (storageError) throw storageError;

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('chalk-images')
      .getPublicUrl(fileName);

    // 3. Insert metadata
    const { error: dbError } = await supabase
      .from('door_chalks')
      .insert({
        image_url: publicUrl,
        style_type: style,
        semester: semester
      });

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}