import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Mock Gemini API processing function
async function processWithGemini(imageFile: File, action: string): Promise<string> {
  // TODO: Replace with actual Gemini API integration
  // For now, return a placeholder URL or the same image
  console.log(`Processing image with Gemini for action: ${action}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In production, this would call Gemini API and return processed image URL
  return 'processed-placeholder-url';
}

export async function POST(
  request: NextRequest,
  { params }: { params: { action: string } }
) {
  try {
    const { action } = params;
    
    // Validate action
    if (!['prettify', 'uglify', 'sloppify'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be prettify, uglify, or sloppify' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;
    const roomId = formData.get('roomId') as string;
    const metadata = formData.get('metadata') as string;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // 1. Upload original image to storage
    const fileName = `uploads/${roomId || Date.now()}-${file.name}`;
    const { data: uploadData, error: storageError } = await supabase.storage
      .from('chalk-images')
      .upload(fileName, file);

    if (storageError) throw storageError;

    // 2. Get public URL of original
    const { data: { publicUrl: originalUrl } } = supabase.storage
      .from('chalk-images')
      .getPublicUrl(fileName);

    // 3. Process with Gemini API
    const processedImageUrl = await processWithGemini(file, action);

    // 4. Store results in database
    const columnMap: Record<string, string> = {
      prettify: 'prettify_url',
      uglify: 'uglify_url',
      sloppify: 'sloppify_text'
    };

    const updateData: any = {
      room_id: roomId,
      original_url: originalUrl,
    };

    if (action === 'sloppify') {
      // For sloppify, store text description instead of image URL
      updateData.sloppify_text = processedImageUrl; // This would be text from Gemini
    } else {
      updateData[columnMap[action]] = processedImageUrl;
    }

    const { error: dbError } = await supabase
      .from('door_versions')
      .upsert(updateData, { onConflict: 'room_id' });

    if (dbError) throw dbError;

    return NextResponse.json({
      success: true,
      action,
      originalUrl,
      processedUrl: processedImageUrl,
      roomId
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
