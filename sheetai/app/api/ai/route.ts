import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

export const MODELS = [
  { id: 'anthropic/claude-sonnet-4-5',            label: 'Claude Sonnet 4.5', tag: '💜', tier: 'pro' },
  { id: 'anthropic/claude-haiku-4-5',             label: 'Claude Haiku 4.5',  tag: '💜', tier: 'free' },
  { id: 'anthropic/claude-opus-4-6',              label: 'Claude Opus 4.6',   tag: '💜', tier: 'team' },
  { id: 'google/gemini-2.0-flash-exp:free',       label: 'Gemini 2.0 Flash',  tag: '🆓', tier: 'free' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', label: 'Llama 3.3 70B',     tag: '🆓', tier: 'free' },
  { id: 'deepseek/deepseek-r1:free',              label: 'DeepSeek R1',       tag: '🆓', tier: 'free' },
  { id: 'qwen/qwen-2.5-72b-instruct:free',        label: 'Qwen 2.5 72B',      tag: '🆓', tier: 'free' },
]

const buildSystemPrompt = (sheetContext: string) => `
You are SheetAI, an expert spreadsheet AI assistant embedded inside a live spreadsheet editor.

## Your Capabilities
- Read and analyze the user's spreadsheet data (provided in context)
- Write values, formulas, and text directly into cells
- Search the web for real-time data (stock prices, exchange rates, etc.)
- Explain formulas, suggest optimizations, spot errors

## How to Write to Cells
When you want to write data into the spreadsheet, emit a JSON block in this EXACT format:
<writes>
[
  {"cell": "A1", "value": "Revenue"},
  {"cell": "B1", "value": "=SUM(B2:B12)"},
  {"cell": "C3", "value": "42500"}
]
</writes>

IMPORTANT rules for cell writes:
- Always use proper Excel-style cell refs (A1, B2, AA1 for cols beyond Z)
- Formulas must start with =
- Emit writes AFTER your explanation, not before
- Only write cells the user asked about or that are clearly needed
- For large datasets (>20 cells), explain what you're doing first

## Current Spreadsheet Context
${sheetContext}

## Response Style
- Be concise and direct
- For simple requests (single cell, single formula): just do it, brief explanation
- For complex requests: explain approach first, then write
- Always mention which cells you wrote to
- If you used web search, note the source briefly
`

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, ai_requests_used, ai_requests_reset_at')
    .eq('id', user.id)
    .single()

  const limits: Record<string, number> = { free: 50, pro: 1000, team: 999999 }
  const limit = limits[profile?.plan || 'free']
  if ((profile?.ai_requests_used || 0) >= limit) {
    return NextResponse.json(
      { error: 'AI request limit reached. Please upgrade your plan.' },
      { status: 429 }
    )
  }

  const { messages, model, sheetContext, userApiKey } = await req.json()
  const apiKey = userApiKey || process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'No API key configured' }, { status: 500 })
  }

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://sheetai.app',
      'X-Title': 'SheetAI',
    },
    body: JSON.stringify({
      model: model || 'anthropic/claude-haiku-4-5',
      max_tokens: 1500,
      messages: [
        { role: 'system', content: buildSystemPrompt(sheetContext) },
        ...messages,
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    return NextResponse.json({ error: `OpenRouter error: ${err}` }, { status: response.status })
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || ''

  await supabase
    .from('profiles')
    .update({ ai_requests_used: (profile?.ai_requests_used || 0) + 1 })
    .eq('id', user.id)

  return NextResponse.json({ content, model: data.model, usage: data.usage })
}
