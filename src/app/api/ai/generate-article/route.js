import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const INVOKE_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

export async function POST(req) {
  try {
    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const adminEmails = (process.env.SUPERADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
    if (!adminEmails.includes(user.email?.toLowerCase())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const headers = {
      "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
      "Accept": "application/json"
    };

    const prompt = `You are an expert SEO copywriter for "Janu Bhai Coffee", a premium Delhi-based D2C coffee brand delivering authentic Chikmagalur coffee PAN India to both commercial (B2B) and retail buyers.
    
    Write an SEO-optimized blog post about the following topic: "${topic}".
    
    Requirements:
    1. Output MUST be in raw Markdown format.
    2. Include a catchy H1 Title at the very beginning.
    3. Use semantic HTML headers (H2, H3).
    4. Keep the tone authentic, premium, yet accessible (desi but clean).
    5. VERY IMPORTANT: Automatically insert high-quality images throughout the article using this exact markdown format: ![Alt text](https://image.pollinations.ai/prompt/detailed%20image%20description%20premium%20coffee%20photography?nologo=true&width=800&height=400). You MUST URL-encode the prompt inside the link. Insert a hero image immediately after the H1 title, and at least 1-2 more relevant images inside the body.
    6. Do not include any generic AI introduction text like "Here is an article", just return the pure markdown content.`;

    const payload = {
      "model": "minimaxai/minimax-m3",
      "messages": [{"role": "user", "content": prompt}],
      "max_tokens": 4000,
      "temperature": 0.7,
      "top_p": 0.95,
      "stream": false
    };

    const response = await fetch(INVOKE_URL, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.text();
      throw new Error(`NVIDIA API Error: ${response.status} - ${errData}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Extract title from the first line if it's an H1
    let title = topic;
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      title = titleMatch[1];
    }

    // Generate a simple slug
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // Save to Supabase
    const { data: article, error } = await supabaseAdmin
      .from('articles')
      .insert([
        { 
          title: title, 
          slug: slug, 
          content: content, 
          meta_title: `${title} | Janu Bhai Coffee`,
          meta_description: content.substring(0, 150).replace(/[#*]/g, '') + '...',
          published: true 
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase Error:", error);
      throw error;
    }

    return NextResponse.json({ success: true, article });

  } catch (error) {
    console.error("AI Generation Error (Suppressed details)");
    return NextResponse.json({ error: "Failed to generate article" }, { status: 500 });
  }
}
