import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'OPENROUTER_API_KEY is not set' }, { status: 500 });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": req.headers.get('referer' ) || "https://your-domain.com", // Optional, for OpenRouter rankings
        "X-Title": "My Private AI", // Optional
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body )
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter API error:', errorData);
      return NextResponse.json({ error: errorData.message || 'OpenRouter API error' }, { status: response.status });
    }

    // For streaming responses, pipe the data directly
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('text/event-stream')) {
      return new NextResponse(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
        },
      });
    } else {
      const data = await response.json();
      return NextResponse.json(data);
    }
  } catch (error: any) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
