import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const { messages, model, sheetContext, userApiKey } = await req.json()
  const apiKey = userApiKey || process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'No API key configured' }), { status: 500 })
  }

  const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://sheetai.app',
      'X-Title': 'SheetAI',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1500,
      stream: true,
      messages: [
        { role: 'system', content: `You are SheetAI. Context:\n${sheetContext}` },
        ...messages,
      ],
    }),
  })

  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
