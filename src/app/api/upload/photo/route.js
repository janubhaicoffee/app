import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req) {
  try {
    const body = await req.json();
    const { base64Data, fileName = 'photo.jpg', bucket = 'observation-photos' } = body;

    if (!base64Data) {
      return NextResponse.json({ error: 'Base64 image data is required' }, { status: 400 });
    }

    // Extract mime type and raw buffer
    const match = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    const contentType = match ? match[1] : 'image/jpeg';
    const rawData = match ? match[2] : base64Data;
    const buffer = Buffer.from(rawData, 'base64');

    const extension = contentType.split('/')[1] || 'jpg';
    const timestamp = Date.now();
    const cleanFileName = `${timestamp}_${Math.random().toString(36).substring(2, 8)}.${extension}`;

    // Upload to Supabase Storage Bucket
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(cleanFileName, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.warn(`Bucket upload error (${bucket}), fallback to public data URL:`, error.message);
      // If storage bucket isn't responding, preserve high quality raw base64 data url directly
      return NextResponse.json({
        success: true,
        url: base64Data,
        fileName: cleanFileName,
        storage: 'inline',
      });
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(bucket).getPublicUrl(cleanFileName);

    return NextResponse.json({
      success: true,
      url: publicUrl || base64Data,
      fileName: cleanFileName,
      storage: 'supabase',
    });
  } catch (err) {
    console.error('Error in photo upload API:', err);
    return NextResponse.json({ error: err.message || 'Failed to upload photo' }, { status: 500 });
  }
}
