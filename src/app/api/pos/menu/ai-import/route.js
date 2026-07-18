import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image');
    const outletId = formData.get('outletId');

    if (!imageFile || !outletId) {
      return NextResponse.json({ error: 'Missing image or outletId' }, { status: 400 });
    }

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'GOOGLE_API_KEY is missing in environment variables (.env.local)' },
        { status: 500 }
      );
    }

    // Convert file to base64 for Gemini
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a menu extraction AI. Extract the categories, products, and prices from this menu image. 
Return only a strictly valid JSON object without any markdown formatting blocks (do not wrap in \`\`\`json).
The JSON MUST perfectly follow this exact structure:
{
  "categories": [
    {
      "name": "Category Name",
      "products": [
        { "name": "Product Name", "price": 150 }
      ]
    }
  ]
}
If a price is missing, default to 0. Ignore descriptions or miscellaneous text, focus on category titles and item names with prices.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: imageFile.type,
        },
      },
    ]);

    let responseText = result.response.text().trim();
    
    // Clean up potential markdown formatting that Gemini might still add despite instructions
    if (responseText.startsWith('```json')) {
      responseText = responseText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse Gemini JSON:', responseText);
      return NextResponse.json({ error: 'AI returned invalid data format' }, { status: 500 });
    }

    if (!parsedData.categories || !Array.isArray(parsedData.categories)) {
      return NextResponse.json({ error: 'AI failed to extract categories' }, { status: 500 });
    }

    // Process insertions
    let insertedCategoriesCount = 0;
    let insertedProductsCount = 0;

    for (const category of parsedData.categories) {
      if (!category.name) continue;

      // Ensure category exists or create it
      const { data: existingCat } = await supabaseAdmin
        .from('pos_categories')
        .select('id')
        .eq('outlet_id', outletId)
        .ilike('name', category.name)
        .maybeSingle();

      let catId;
      if (existingCat) {
        catId = existingCat.id;
      } else {
        const { data: newCat, error: catErr } = await supabaseAdmin
          .from('pos_categories')
          .insert({ outlet_id: outletId, name: category.name })
          .select('id')
          .single();
        if (catErr) continue;
        catId = newCat.id;
        insertedCategoriesCount++;
      }

      // Insert products for this category
      if (category.products && Array.isArray(category.products)) {
        for (const product of category.products) {
          if (!product.name) continue;
          
          const price = parseFloat(product.price) || 0;
          const cost = price * 0.4; // Default cost to 40% of price
          const encodedName = encodeURIComponent(product.name + ' delicious food photography, high quality restaurant');
          const imageUrl = `https://image.pollinations.ai/prompt/${encodedName}?width=400&height=400&nologo=true`;

          const { error: prodErr } = await supabaseAdmin
            .from('pos_products')
            .insert({
              outlet_id: outletId,
              category_id: catId,
              name: product.name,
              price: price,
              cost: cost,
              stock: -1, // Infinite stock by default
              image_url: imageUrl,
              is_available: true
            });

          if (!prodErr) {
            insertedProductsCount++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${insertedCategoriesCount} new categories and ${insertedProductsCount} products!`,
      stats: { categories: insertedCategoriesCount, products: insertedProductsCount }
    });
  } catch (err) {
    console.error('AI Import Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
