'use client'
import { useState, useEffect } from 'react'
import { SheetData } from '@/types'

interface FormulaBarProps {
  selectedCell: string
  data: SheetData
  onCommit: (ref: string, value: string) => void
}

export default function FormulaBar({ selectedCell, data, onCommit }: FormulaBarProps) {
  const [value, setValue] = useState('')
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (!editing) {
      setValue(data[selectedCell]?.raw || '')
    }
  }, [selectedCell, data, editing])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onCommit(selectedCell, value)
      setEditing(false)
    } else if (e.key === 'Escape') {
      setValue(data[selectedCell]?.raw || '')
      setEditing(false)
    }
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 0,
      height: 32, borderBottom: '1px solid var(--border2)',
      background: 'var(--surface)', flexShrink: 0,
    }}>
      {/* Cell reference display */}
      <div style={{
        width: 72, flexShrink: 0, padding: '0 10px',
        fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 12,
        color: 'var(--accent2)', borderRight: '1px solid var(--border2)',
        height: '100%', display: 'flex', alignItems: 'center',
        background: 'var(--surface2)',
      }}>
        {selectedCell}
      </div>

      {/* fx icon */}
      <div style={{
        padding: '0 10px', color: 'var(--text3)',
        fontFamily: 'var(--font-display)', fontStyle: 'italic',
        fontSize: 14, borderRight: '1px solid var(--border2)',
        height: '100%', display: 'flex', alignItems: 'center',
        background: 'var(--surface2)',
      }}>
        fx
      </div>

      {/* Formula input */}
      <input
        value={value}
        onChange={e => { setValue(e.target.value); setEditing(true) }}
        onKeyDown={handleKeyDown}
        onBlur={() => { onCommit(selectedCell, value); setEditing(false) }}
        onFocus={() => setEditing(true)}
        style={{
          flex: 1, border: 'none', outline: 'none', background: 'transparent',
          color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 12,
          padding: '0 10px', height: '100%',
        }}
        placeholder="Enter value or formula..."
      />
    </div>
  )
}
