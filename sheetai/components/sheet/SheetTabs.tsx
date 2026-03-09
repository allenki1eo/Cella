'use client'
import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Sheet } from '@/types'

interface SheetTabsProps {
  sheets: Sheet[]
  activeSheetId: string
  onSelectSheet: (id: string) => void
  onAddSheet: () => void
  onRenameSheet: (id: string, name: string) => void
  onDeleteSheet: (id: string) => void
}

export default function SheetTabs({
  sheets, activeSheetId, onSelectSheet, onAddSheet, onRenameSheet, onDeleteSheet
}: SheetTabsProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const startRename = (sheet: Sheet) => {
    setEditingId(sheet.id)
    setEditName(sheet.name)
  }

  const commitRename = () => {
    if (editingId && editName.trim()) {
      onRenameSheet(editingId, editName.trim())
    }
    setEditingId(null)
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 0,
      height: 34, borderTop: '1px solid var(--border2)',
      background: 'var(--surface2)', overflowX: 'auto', flexShrink: 0,
    }}>
      {sheets.map(sheet => (
        <div
          key={sheet.id}
          onClick={() => onSelectSheet(sheet.id)}
          onDoubleClick={() => startRename(sheet)}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '0 12px', height: '100%', cursor: 'pointer',
            background: activeSheetId === sheet.id ? 'var(--surface)' : 'transparent',
            borderRight: '1px solid var(--border2)',
            borderTop: activeSheetId === sheet.id ? '2px solid var(--accent)' : '2px solid transparent',
            color: activeSheetId === sheet.id ? 'var(--text)' : 'var(--text2)',
            fontFamily: 'var(--font-heading)', fontWeight: activeSheetId === sheet.id ? 600 : 400,
            fontSize: 12, flexShrink: 0, position: 'relative',
            transition: 'all 0.15s',
          }}
        >
          {editingId === sheet.id ? (
            <input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onBlur={commitRename}
              onKeyDown={e => {
                if (e.key === 'Enter') commitRename()
                if (e.key === 'Escape') setEditingId(null)
              }}
              autoFocus
              style={{
                background: 'var(--input-bg)', border: '1px solid var(--accent)',
                borderRadius: 4, color: 'var(--text)', fontFamily: 'var(--font-heading)',
                fontSize: 12, padding: '1px 4px', width: 80, outline: 'none',
              }}
            />
          ) : (
            <span>{sheet.name}</span>
          )}
          {sheets.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); onDeleteSheet(sheet.id) }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text3)', padding: 0, display: 'flex', alignItems: 'center',
                opacity: 0, transition: 'opacity 0.15s',
              }}
              className="tab-delete-btn"
            >
              <X size={11} />
            </button>
          )}
        </div>
      ))}

      <button
        onClick={onAddSheet}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '0 10px', height: '100%', border: 'none',
          background: 'transparent', cursor: 'pointer',
          color: 'var(--text3)', fontFamily: 'var(--font-heading)',
          fontSize: 12, transition: 'color 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text3)')}
      >
        <Plus size={13} />
      </button>
    </div>
  )
}
