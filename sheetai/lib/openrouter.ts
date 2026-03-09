import { CellWrite, AIModel } from '@/types'

export type { CellWrite }

export const MODELS: AIModel[] = [
  { id: 'anthropic/claude-sonnet-4-5',            label: 'Claude Sonnet 4.5', tag: '💜', tier: 'pro' },
  { id: 'anthropic/claude-haiku-4-5',             label: 'Claude Haiku 4.5',  tag: '💜', tier: 'free' },
  { id: 'anthropic/claude-opus-4-6',              label: 'Claude Opus 4.6',   tag: '💜', tier: 'team' },
  { id: 'google/gemini-2.0-flash-exp:free',       label: 'Gemini 2.0 Flash',  tag: '🆓', tier: 'free' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', label: 'Llama 3.3 70B',     tag: '🆓', tier: 'free' },
  { id: 'deepseek/deepseek-r1:free',              label: 'DeepSeek R1',       tag: '🆓', tier: 'free' },
  { id: 'qwen/qwen-2.5-72b-instruct:free',        label: 'Qwen 2.5 72B',      tag: '🆓', tier: 'free' },
]

export function parseCellWrites(content: string): CellWrite[] {
  const match = content.match(/<writes>([\s\S]*?)<\/writes>/)
  if (!match) return []
  try {
    return JSON.parse(match[1].trim())
  } catch {
    return []
  }
}

export function stripWrites(content: string): string {
  return content.replace(/<writes>[\s\S]*?<\/writes>/g, '').trim()
}

export function buildSheetContext(
  data: Record<string, { raw: string }>,
  sheetName: string,
  selectedCell?: string
): string {
  const entries = Object.entries(data).slice(0, 200)
  const cellsSummary = entries
    .map(([cell, val]) => `${cell}: ${val.raw}`)
    .join('\n')

  return `
Sheet: "${sheetName}"
Selected cell: ${selectedCell || 'none'}
Cell data (up to 200 cells):
${cellsSummary || '(empty sheet)'}
  `.trim()
}

export const AI_SUGGESTIONS = [
  { label: '📈 AAPL stock price',  prompt: 'Search for Apple (AAPL) current stock price and put it in the selected cell' },
  { label: '💱 USD → ZAR rate',    prompt: 'Find the current USD to ZAR exchange rate and write it to the selected cell' },
  { label: '∑ SUM formula',        prompt: 'Write a SUM formula for all numeric cells in column B' },
  { label: '📊 Bar chart',         prompt: 'Generate a bar chart from the data in columns A and B' },
  { label: '🧹 Clean data',        prompt: 'Look at my data and fix any obvious errors, blanks, or formatting issues' },
  { label: '📋 Monthly budget',    prompt: 'Create a monthly budget template starting at A1 with categories, budget, actual, and variance columns' },
]
