import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured in the environment.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { image } = body; // base64 encoded image string
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Strip data URI prefix if present (e.g., 'data:image/jpeg;base64,...')
    let base64Data = image;
    let mimeType = 'image/jpeg';
    if (image.startsWith('data:')) {
      const parts = image.split(';');
      if (parts.length > 1) {
        mimeType = parts[0].split(':')[1];
        base64Data = parts[1].split(',')[1];
      }
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are an expert expense parsing assistant. Extract the following information from the provided receipt, invoice, kaccha bill (rough bill), or payment screenshot.
      
      Respond STRICTLY in JSON format with the following schema:
      {
        "amount": number (total amount paid, positive number. If multiple amounts, take the grand total),
        "category": string (Must be one of: Rent, Electricity, Salaries, Raw Materials, Packaging, Marketing, Maintenance, Other. Try to deduce based on item names or vendor),
        "vendor": string (Name of the business, shop, or person who was paid),
        "description": string (A short summary of what the expense is for, max 10 words),
        "date": string (Date of the bill/payment in YYYY-MM-DD format. If not found, output an empty string),
        "payment_method": string (Must be one of: cash, card, upi, bank. If you can deduce it from the screenshot (e.g. PhonePe/GPay = upi), output it, otherwise output 'cash')
      }

      Do not include any other text or markdown formatting outside the JSON object.
    `;

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    let text = response.text().trim();
    
    // Strip markdown code block formatting if present
    if (text.startsWith('\`\`\`json')) {
      text = text.substring(7);
      if (text.endsWith('\`\`\`')) {
        text = text.substring(0, text.length - 3);
      }
    } else if (text.startsWith('\`\`\`')) {
      text = text.substring(3);
      if (text.endsWith('\`\`\`')) {
        text = text.substring(0, text.length - 3);
      }
    }
    
    const parsedData = JSON.parse(text.trim());
    return NextResponse.json({ success: true, data: parsedData });
    
  } catch (error) {
    console.error('Extraction API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to extract data' }, { status: 500 });
  }
}
