'use client'
import { useRef, useCallback, useEffect, useState } from 'react'
import { SheetData, CellData } from '@/types'
import { colIndexToLetter, cellRefFromCoords } from '@/lib/formula-engine'

const NUM_ROWS = 50
const NUM_COLS = 26
const DEFAULT_COL_WIDTH = 100
const ROW_HEIGHT = 24
const HEADER_WIDTH = 40

interface SheetGridProps {
  data: SheetData
  selectedCell: string
  onSelectCell: (ref: string) => void
  onCellChange: (ref: string, value: string) => void
  colWidths?: Record<string, number>
}

export default function SheetGrid({
  data,
  selectedCell,
  onSelectCell,
  onCellChange,
  colWidths = {},
}: SheetGridProps) {
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [selectionStart, setSelectionStart] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const parseCellRef = (ref: string) => {
    const match = ref.match(/^([A-Z]+)(\d+)$/)
    if (!match) return null
    const colStr = match[1]
    const row = parseInt(match[2], 10) - 1
    let col = 0
    for (let i = 0; i < colStr.length; i++) {
      col = col * 26 + (colStr.charCodeAt(i) - 64)
    }
    return { col: col - 1, row }
  }

  const getColWidth = (colIdx: number) => {
    const letter = colIndexToLetter(colIdx)
    return colWidths[letter] || DEFAULT_COL_WIDTH
  }

  const startEditing = useCallback((ref: string) => {
    setEditingCell(ref)
    setEditValue(data[ref]?.raw || '')
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [data])

  const commitEdit = useCallback(() => {
    if (editingCell) {
      onCellChange(editingCell, editValue)
      setEditingCell(null)
    }
  }, [editingCell, editValue, onCellChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent, ref: string) => {
    if (editingCell === ref) {
      if (e.key === 'Enter') {
        commitEdit()
        const parsed = parseCellRef(ref)
        if (parsed) {
          const nextRef = cellRefFromCoords(parsed.col, parsed.row + 1)
          onSelectCell(nextRef)
        }
      } else if (e.key === 'Escape') {
        setEditingCell(null)
        setEditValue('')
      } else if (e.key === 'Tab') {
        e.preventDefault()
        commitEdit()
        const parsed = parseCellRef(ref)
        if (parsed) {
          const nextRef = cellRefFromCoords(parsed.col + 1, parsed.row)
          onSelectCell(nextRef)
        }
      }
    } else {
      if (e.key === 'Enter' || e.key === 'F2') {
        startEditing(ref)
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        onCellChange(ref, '')
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const parsed = parseCellRef(ref)
        if (parsed && parsed.row > 0) onSelectCell(cellRefFromCoords(parsed.col, parsed.row - 1))
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        const parsed = parseCellRef(ref)
        if (parsed) onSelectCell(cellRefFromCoords(parsed.col, parsed.row + 1))
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        const parsed = parseCellRef(ref)
        if (parsed && parsed.col > 0) onSelectCell(cellRefFromCoords(parsed.col - 1, parsed.row))
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        const parsed = parseCellRef(ref)
        if (parsed) onSelectCell(cellRefFromCoords(parsed.col + 1, parsed.row))
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        startEditing(ref)
        setEditValue(e.key)
      }
    }
  }, [editingCell, commitEdit, startEditing, onSelectCell, onCellChange])

  const getDisplayValue = (cell: CellData | undefined): string => {
    if (!cell?.raw) return ''
    // For now just show raw; HyperFormula evaluation would go here
    return cell.raw
  }

  const getAlignStyle = (cell: CellData | undefined): React.CSSProperties => {
    if (cell?.fmt?.align) return { textAlign: cell.fmt.align }
    // Auto-align: numbers right, text left
    const val = cell?.raw || ''
    if (val.startsWith('=')) return {}
    if (!isNaN(Number(val)) && val !== '') return { textAlign: 'right' }
    return {}
  }

  return (
    <div
      ref={containerRef}
      style={{ flex: 1, overflow: 'auto', position: 'relative', background: 'var(--surface)' }}
      onClick={() => {
        if (editingCell && containerRef.current) commitEdit()
      }}
    >
      <table style={{
        borderCollapse: 'collapse',
        tableLayout: 'fixed',
        minWidth: HEADER_WIDTH + NUM_COLS * DEFAULT_COL_WIDTH,
      }}>
        {/* Column headers */}
        <thead style={{ position: 'sticky', top: 0, zIndex: 20 }}>
          <tr>
            <th style={{
              width: HEADER_WIDTH, minWidth: HEADER_WIDTH, height: ROW_HEIGHT,
              background: 'var(--surface2)', border: '1px solid var(--border2)',
              position: 'sticky', left: 0, zIndex: 25, top: 0,
            }} />
            {Array.from({ length: NUM_COLS }, (_, i) => (
              <th key={i} style={{
                width: getColWidth(i), height: ROW_HEIGHT,
                background: 'var(--surface2)', border: '1px solid var(--border2)',
                color: 'var(--text2)', fontFamily: 'var(--font-heading)',
                fontSize: 11, fontWeight: 600, textAlign: 'center',
                userSelect: 'none', padding: '0 4px',
              }}>
                {colIndexToLetter(i)}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: NUM_ROWS }, (_, rowIdx) => (
            <tr key={rowIdx}>
              {/* Row header */}
              <td style={{
                width: HEADER_WIDTH, minWidth: HEADER_WIDTH, height: ROW_HEIGHT,
                background: 'var(--surface2)', border: '1px solid var(--border2)',
                color: 'var(--text2)', fontFamily: 'var(--font-heading)',
                fontSize: 11, fontWeight: 600, textAlign: 'center',
                position: 'sticky', left: 0, zIndex: 10, userSelect: 'none',
              }}>
                {rowIdx + 1}
              </td>

              {Array.from({ length: NUM_COLS }, (_, colIdx) => {
                const ref = cellRefFromCoords(colIdx, rowIdx)
                const cell = data[ref]
                const isSelected = selectedCell === ref
                const isEditing = editingCell === ref

                return (
                  <td
                    key={colIdx}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (editingCell && editingCell !== ref) commitEdit()
                      onSelectCell(ref)
                    }}
                    onDoubleClick={() => startEditing(ref)}
                    onKeyDown={(e) => handleKeyDown(e, ref)}
                    tabIndex={isSelected ? 0 : -1}
                    style={{
                      width: getColWidth(colIdx),
                      height: ROW_HEIGHT,
                      border: `1px solid var(--border)`,
                      padding: 0,
                      position: 'relative',
                      outline: isSelected && !isEditing ? '2px solid var(--accent)' : 'none',
                      outlineOffset: '-2px',
                      background: isSelected ? 'var(--aglow)' : cell?.fmt?.bgColor || 'transparent',
                      zIndex: isSelected ? 5 : 1,
                      cursor: 'cell',
                      fontWeight: cell?.fmt?.bold ? 700 : 400,
                      fontStyle: cell?.fmt?.italic ? 'italic' : 'normal',
                      textDecoration: cell?.fmt?.underline ? 'underline' : 'none',
                      color: cell?.fmt?.color || 'var(--text)',
                      fontFamily: 'var(--font-body)',
                      fontSize: cell?.fmt?.fontSize || 12,
                      ...getAlignStyle(cell),
                    }}
                  >
                    {isEditing ? (
                      <input
                        ref={inputRef}
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, ref)}
                        onBlur={commitEdit}
                        style={{
                          width: '100%', height: '100%', border: 'none', outline: 'none',
                          background: 'var(--surface)', color: 'var(--text)',
                          fontFamily: 'var(--font-body)', fontSize: 12,
                          padding: '0 6px',
                        }}
                      />
                    ) : (
                      <span style={{
                        display: 'block', padding: '0 6px', overflow: 'hidden',
                        whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                        lineHeight: `${ROW_HEIGHT}px`,
                      }}>
                        {getDisplayValue(cell)}
                      </span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
