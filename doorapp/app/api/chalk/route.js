import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5001';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');
    const semester = formData.get('semester');
    const roomId = formData.get('id'); // room ID like "17124"

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Create FormData to forward to backend
    const backendFormData = new FormData();
    backendFormData.append('image', file);
    if (semester) backendFormData.append('semester', semester);
    if (roomId) backendFormData.append('roomId', roomId);

    // Forward request to chalk-pyserver
    const response = await fetch(`${BACKEND_URL}/extract`, {
      method: 'POST',
      body: backendFormData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Backend processing failed');
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}