import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req) {
  try {
    const { base64Image } = await req.json();

    if (!base64Image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminEmails = (process.env.SUPERADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase());
    
    if (!adminEmails.includes(user.email?.toLowerCase())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured on the server.' }, { status: 500 });
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Ensure the image format is clean
    const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
    const mimeTypeMatch = base64Image.match(/^data:(image\/[a-zA-Z]+);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";

    const prompt = `Extract the 14-digit FSSAI Registration or License Number from this certificate. Return a JSON object with 'fssai_number' (string) and 'valid_until' (string) if possible. If not found, set them to null. Return ONLY raw JSON, no markdown blocks.`;

    const imageParts = [
      {
        inlineData: {
          data: base64Data,
          mimeType
        },
      },
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const responseText = result.response.text();
    
    // Clean up potential markdown formatting from response
    const cleanJsonString = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    try {
      const extractedData = JSON.parse(cleanJsonString);
      return NextResponse.json(extractedData);
    } catch (parseErr) {
      console.error('Failed to parse Gemini JSON output:', cleanJsonString);
      return NextResponse.json({ error: 'Failed to extract data correctly', raw: cleanJsonString }, { status: 500 });
    }

  } catch (error) {
    console.error('Error extracting FSSAI:', error);
    return NextResponse.json({ error: 'Failed to extract FSSAI details' }, { status: 500 });
  }
}
