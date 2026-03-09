'use client'
import { CellData, SheetData } from '@/types'
import {
  Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight,
  Undo2, Redo2, BarChart2,
} from 'lucide-react'

interface ToolbarProps {
  selectedCell: string
  data: SheetData
  onFormat: (ref: string, fmt: Partial<CellData['fmt']>) => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  onOpenChart?: () => void
}

export default function Toolbar({
  selectedCell, data, onFormat, onUndo, onRedo, canUndo, canRedo, onOpenChart
}: ToolbarProps) {
  const cell = data[selectedCell]
  const fmt = cell?.fmt || {}

  const toggle = (key: keyof NonNullable<CellData['fmt']>) => {
    onFormat(selectedCell, { [key]: !fmt[key as keyof typeof fmt] })
  }

  const btnStyle = (active?: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 28, height: 28, border: 'none', borderRadius: 6, cursor: 'pointer',
    background: active ? 'var(--aglow)' : 'transparent',
    color: active ? 'var(--accent2)' : 'var(--text2)',
    transition: 'all 0.15s',
  })

  const divider = (
    <div style={{ width: 1, height: 18, background: 'var(--border2)', margin: '0 4px', flexShrink: 0 }} />
  )

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 2, padding: '0 10px',
      height: 38, borderBottom: '1px solid var(--border2)',
      background: 'var(--surface2)', flexShrink: 0, overflowX: 'auto',
    }}>
      <button
        onClick={onUndo} disabled={!canUndo}
        style={{ ...btnStyle(), opacity: canUndo ? 1 : 0.35 }}
        title="Undo"
      >
        <Undo2 size={14} />
      </button>
      <button
        onClick={onRedo} disabled={!canRedo}
        style={{ ...btnStyle(), opacity: canRedo ? 1 : 0.35 }}
        title="Redo"
      >
        <Redo2 size={14} />
      </button>

      {divider}

      <button onClick={() => toggle('bold')} style={btnStyle(fmt.bold)} title="Bold">
        <Bold size={14} />
      </button>
      <button onClick={() => toggle('italic')} style={btnStyle(fmt.italic)} title="Italic">
        <Italic size={14} />
      </button>
      <button onClick={() => toggle('underline')} style={btnStyle(fmt.underline)} title="Underline">
        <Underline size={14} />
      </button>

      {divider}

      <button onClick={() => onFormat(selectedCell, { align: 'left' })} style={btnStyle(fmt.align === 'left')} title="Align left">
        <AlignLeft size={14} />
      </button>
      <button onClick={() => onFormat(selectedCell, { align: 'center' })} style={btnStyle(fmt.align === 'center')} title="Align center">
        <AlignCenter size={14} />
      </button>
      <button onClick={() => onFormat(selectedCell, { align: 'right' })} style={btnStyle(fmt.align === 'right')} title="Align right">
        <AlignRight size={14} />
      </button>

      {divider}

      {/* Font size */}
      <select
        value={fmt.fontSize || 12}
        onChange={e => onFormat(selectedCell, { fontSize: Number(e.target.value) })}
        style={{
          background: 'var(--surface)', border: '1px solid var(--border2)',
          borderRadius: 5, color: 'var(--text)', fontFamily: 'var(--font-body)',
          fontSize: 11, padding: '2px 5px', cursor: 'pointer', height: 24,
        }}
      >
        {[10, 11, 12, 13, 14, 16, 18, 20, 24].map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {divider}

      {/* Text color */}
      <label title="Text color" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 11, color: 'var(--text2)', marginRight: 3 }}>A</span>
        <input
          type="color"
          value={fmt.color || '#dde1ec'}
          onChange={e => onFormat(selectedCell, { color: e.target.value })}
          style={{ width: 18, height: 18, border: 'none', borderRadius: 3, cursor: 'pointer', padding: 0 }}
        />
      </label>

      {/* Background color */}
      <label title="Background color" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
        <span style={{
          width: 18, height: 18, borderRadius: 3,
          background: fmt.bgColor || 'var(--surface)',
          border: '1px solid var(--border2)', marginRight: 0,
          position: 'relative', cursor: 'pointer',
        }} />
        <input
          type="color"
          value={fmt.bgColor || '#111318'}
          onChange={e => onFormat(selectedCell, { bgColor: e.target.value })}
          style={{ width: 1, height: 1, opacity: 0, position: 'absolute' }}
        />
      </label>

      {onOpenChart && (
        <>
          {divider}
          <button onClick={onOpenChart} style={btnStyle()} title="Insert chart">
            <BarChart2 size={14} />
          </button>
        </>
      )}
    </div>
  )
}
