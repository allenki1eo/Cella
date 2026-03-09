'use client'
import { useState, useCallback, useRef } from 'react'
import { SheetData, CellData, CellWrite } from '@/types'
import { createClient } from '@/lib/supabase/client'

interface UseSheetProps {
  sheetId: string
  initialData: SheetData
}

interface HistoryEntry {
  data: SheetData
  description: string
}

export function useSheet({ sheetId, initialData }: UseSheetProps) {
  const [data, setData] = useState<SheetData>(initialData)
  const [selectedCell, setSelectedCell] = useState('A1')
  const [selectedRange, setSelectedRange] = useState<string[]>([])
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([{ data: initialData, description: 'Initial' }])
  const [historyIndex, setHistoryIndex] = useState(0)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const supabase = createClient()

  const saveToSupabase = useCallback(async (newData: SheetData) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(async () => {
      await supabase
        .from('sheets')
        .update({ data: newData, updated_at: new Date().toISOString() })
        .eq('id', sheetId)
    }, 1000)
  }, [sheetId, supabase])

  const setCellValue = useCallback((cellRef: string, raw: string, description = 'Edit cell') => {
    setData(prev => {
      const newData = { ...prev }
      if (raw === '' || raw === null) {
        delete newData[cellRef]
      } else {
        newData[cellRef] = { ...newData[cellRef], raw }
      }
      saveToSupabase(newData)
      return newData
    })
    setHistory(prev => {
      const trimmed = prev.slice(0, historyIndex + 1)
      return [...trimmed, { data: { ...data, [cellRef]: { raw } }, description }]
    })
    setHistoryIndex(prev => prev + 1)
  }, [data, historyIndex, saveToSupabase])

  const setCellFormat = useCallback((cellRef: string, fmt: Partial<CellData['fmt']>) => {
    setData(prev => {
      const newData = {
        ...prev,
        [cellRef]: {
          ...prev[cellRef],
          raw: prev[cellRef]?.raw || '',
          fmt: { ...prev[cellRef]?.fmt, ...fmt },
        },
      }
      saveToSupabase(newData)
      return newData
    })
  }, [saveToSupabase])

  const applyAIWrites = useCallback((writes: CellWrite[]) => {
    setData(prev => {
      const newData = { ...prev }
      writes.forEach(({ cell, value }) => {
        newData[cell] = { ...newData[cell], raw: value }
      })
      saveToSupabase(newData)
      return newData
    })
    setHistory(prev => {
      const trimmed = prev.slice(0, historyIndex + 1)
      return [...trimmed, { data: { ...data }, description: `AI wrote ${writes.length} cells` }]
    })
    setHistoryIndex(prev => prev + 1)
  }, [data, historyIndex, saveToSupabase])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setData(history[newIndex].data)
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setData(history[newIndex].data)
    }
  }, [history, historyIndex])

  const getCellValue = useCallback((cellRef: string): string => {
    return data[cellRef]?.raw || ''
  }, [data])

  return {
    data,
    selectedCell,
    setSelectedCell,
    selectedRange,
    setSelectedRange,
    editingCell,
    setEditingCell,
    setCellValue,
    setCellFormat,
    applyAIWrites,
    undo,
    redo,
    getCellValue,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  }
}
