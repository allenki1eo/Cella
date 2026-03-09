'use client'
import { useState, useCallback } from 'react'
import { parseCellWrites, stripWrites, buildSheetContext, CellWrite } from '@/lib/openrouter'

interface Message {
  role: 'user' | 'assistant'
  content: string
  usedSearch?: boolean
  writes?: CellWrite[]
}

interface UseAIProps {
  sheetData: Record<string, { raw: string }>
  sheetName: string
  selectedCell: string
  onCellWrites: (writes: CellWrite[]) => void
  userApiKey?: string
}

export function useAI({ sheetData, sheetName, selectedCell, onCellWrites, userApiKey }: UseAIProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState('anthropic/claude-haiku-4-5')
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (text?: string) => {
    const userText = text || input
    if (!userText.trim() || loading) return

    const userMsg: Message = { role: 'user', content: userText }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const sheetContext = buildSheetContext(sheetData, sheetName, selectedCell)
      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, model, sheetContext, userApiKey }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'AI request failed')
      }

      const data = await res.json()
      const rawContent: string = data.content

      const writes = parseCellWrites(rawContent)
      if (writes.length > 0) onCellWrites(writes)

      const assistantMsg: Message = {
        role: 'assistant',
        content: stripWrites(rawContent),
        writes: writes.length > 0 ? writes : undefined,
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [input, messages, model, sheetData, sheetName, selectedCell, onCellWrites, userApiKey, loading])

  const clearHistory = useCallback(() => setMessages([]), [])
  const retryLast = useCallback(() => {
    const last = messages.filter(m => m.role === 'user').pop()
    if (last) {
      setMessages(prev => prev.slice(0, -1))
      sendMessage(last.content)
    }
  }, [messages, sendMessage])

  return { messages, input, setInput, loading, error, model, setModel, sendMessage, clearHistory, retryLast }
}
