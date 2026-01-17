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
    const id = formData.get('id'); // level + unit number

    // 1. Upload to Storage
    const fileName = `public/${Date.now()}-${file.name}`;
    const { data: uploadData, error: storageError } = await supabase.storage
      .from('chalk-images')
      .upload(fileName, file);

    if (storageError) throw storageError;

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('chalk-images')
      .getPublicUrl(fileName);

    // 3. Insert metadata matching the new schema
    const { error: dbError } = await supabase
      .from('door_chalks')
      .insert({
        id: id,
        original_url: publicUrl,
        processed_url: publicUrl, // Default to same for now
        style: style,
        semester: semester,
        status: 'completed'
      });

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}