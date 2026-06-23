import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const INVOKE_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

export async function POST(req) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    if (messages.length > 20) {
      return NextResponse.json({ error: "Conversation too long" }, { status: 400 });
    }

    const latestMsg = messages[messages.length - 1];
    if (latestMsg && latestMsg.content.length > 1000) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }

    let contextStr = "Here is some context about our business:\n";
    
    // We conditionally run Pinecone so your app doesn't break before you add the API Key
    if (process.env.PINECONE_API_KEY) {
      try {
        // 1. Get the user's last message to search for relevant knowledge
        const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || "";
        
        // 2. Generate embedding for the query using NVIDIA API
        const embedRes = await fetch("https://integrate.api.nvidia.com/v1/embeddings", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            input: [lastUserMessage],
            model: "NV-Embed-QA",
            input_type: "query"
          })
        });
        
        const embedData = await embedRes.json();
        const vector = embedData.data[0].embedding;

        // 3. Search Pinecone
        const pineconeRes = await fetch(`https://${process.env.PINECONE_INDEX_HOST}/query`, {
          method: "POST",
          headers: {
            "Api-Key": process.env.PINECONE_API_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            vector: vector,
            topK: 3,
            includeMetadata: true
          })
        });
        
        const pineconeData = await pineconeRes.json();
        if (pineconeData.matches && pineconeData.matches.length > 0) {
          contextStr += pineconeData.matches.map(match => match.metadata?.text || "").join("\n\n");
        } else {
          contextStr += "We are Janu Bhai Coffee, a premium Chikmagalur coffee brand based in Delhi. We deliver PAN India.";
        }
      } catch (err) {
        console.error("Vector Search Error:", err);
        contextStr += "We are Janu Bhai Coffee, a premium Chikmagalur coffee brand based in Delhi. We deliver PAN India.";
      }
    } else {
      // Fallback until Pinecone is configured
      contextStr += "We are Janu Bhai Coffee, a premium Chikmagalur coffee brand based in Delhi. We deliver PAN India. We sell Instant Coffee (70% coffee, 30% chicory) and Wholesale AAA Coffee Beans.";
    }

    const systemPrompt = `You are the customer service agent for "Janu Bhai Coffee". 
    Tone: Friendly, professional, helpful, and proudly Indian.
    
    ${contextStr}
    
    Answer the user's questions based ONLY on the context provided above. If you don't know the answer, politely ask them to email hello@janubhai.com. Keep responses concise.`;

    // Prepend system prompt
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    const payload = {
      "model": "minimaxai/minimax-m3",
      "messages": apiMessages,
      "max_tokens": 1024,
      "temperature": 0.5,
      "top_p": 0.9,
      "stream": true
    };

    const response = await fetch(INVOKE_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
        "Accept": "text/event-stream",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.text();
      throw new Error(`NVIDIA API Error: ${response.status} - ${errData}`);
    }

    // Return the readable stream directly to the client
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error("Chat API Error:", error.message);
    return NextResponse.json({ error: "Chat service unavailable" }, { status: 500 });
  }
}
