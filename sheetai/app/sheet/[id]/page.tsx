'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useSheet } from '@/hooks/useSheet'
import SheetGrid from '@/components/sheet/SheetGrid'
import FormulaBar from '@/components/sheet/FormulaBar'
import Toolbar from '@/components/sheet/Toolbar'
import AIPanel from '@/components/sheet/AIPanel'
import SheetTabs from '@/components/sheet/SheetTabs'
import ChartModal from '@/components/sheet/ChartModal'
import { Sheet, Workbook, Profile } from '@/types'
import { useThemeContext } from '@/components/layout/ThemeProvider'
import { Sun, Moon, Sparkles, PanelRight, ArrowLeft } from 'lucide-react'

export default function SheetPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const { theme, toggleTheme } = useThemeContext()

  const [workbook, setWorkbook] = useState<Workbook | null>(null)
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [activeSheetId, setActiveSheetId] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [aiOpen, setAiOpen] = useState(true)
  const [chartOpen, setChartOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }

        const [{ data: wb, error: wbErr }, { data: sheetList }, { data: prof }] = await Promise.all([
          supabase.from('workbooks').select('*').eq('id', id).single(),
          supabase.from('sheets').select('*').eq('workbook_id', id).order('position'),
          supabase.from('profiles').select('*').eq('id', user.id).single(),
        ])

        if (wbErr || !wb) {
          setLoadError('Could not load workbook. It may have been deleted or you may not have access.')
          setLoading(false)
          return
        }
        setWorkbook(wb)
        setSheets(sheetList || [])
        if (sheetList && sheetList.length > 0) setActiveSheetId(sheetList[0].id)
        setProfile(prof)
        setLoading(false)
      } catch {
        setLoadError('Failed to connect. Check your network connection.')
        setLoading(false)
      }
    }
    load()
  }, [id, router, supabase])

  const activeSheet = sheets.find(s => s.id === activeSheetId)

  const {
    data, selectedCell, setSelectedCell,
    setCellValue, setCellFormat, applyAIWrites, undo, redo, canUndo, canRedo,
  } = useSheet({
    sheetId: activeSheetId || '',
    initialData: activeSheet?.data || {},
  })

  const handleAddSheet = useCallback(async () => {
    const newPos = sheets.length
    const { data: newSheet } = await supabase
      .from('sheets')
      .insert({
        workbook_id: id,
        name: `Sheet${newPos + 1}`,
        position: newPos,
        data: {},
      })
      .select()
      .single()
    if (newSheet) {
      setSheets(prev => [...prev, newSheet])
      setActiveSheetId(newSheet.id)
    }
  }, [id, sheets.length, supabase])

  const handleRenameSheet = useCallback(async (sheetId: string, name: string) => {
    await supabase.from('sheets').update({ name }).eq('id', sheetId)
    setSheets(prev => prev.map(s => s.id === sheetId ? { ...s, name } : s))
  }, [supabase])

  const handleDeleteSheet = useCallback(async (sheetId: string) => {
    if (sheets.length <= 1) return
    await supabase.from('sheets').delete().eq('id', sheetId)
    const remaining = sheets.filter(s => s.id !== sheetId)
    setSheets(remaining)
    if (activeSheetId === sheetId) setActiveSheetId(remaining[0]?.id || null)
  }, [sheets, activeSheetId, supabase])

  const handleRenameWorkbook = useCallback(async (name: string) => {
    if (!workbook) return
    await supabase.from('workbooks').update({ name }).eq('id', workbook.id)
    setWorkbook(prev => prev ? { ...prev, name } : prev)
  }, [workbook, supabase])

  if (loading) {
    return (
      <div style={{ height: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%', background: 'var(--accent2)',
              animation: 'pulseDot 1.2s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }} />
          ))}
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div style={{ height: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <p style={{ fontFamily: 'var(--font-heading)', color: 'var(--text2)', fontSize: 14 }}>{loadError}</p>
        <button onClick={() => router.push('/dashboard')} style={{
          background: 'var(--accent)', color: '#fff', border: 'none',
          borderRadius: 8, padding: '9px 18px', cursor: 'pointer',
          fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13,
        }}>Back to dashboard</button>
      </div>
    )
  }

  if (!workbook || !activeSheet) return null

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      {/* Sheet Nav */}
      <div style={{
        height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 12px', borderBottom: '1px solid var(--border2)',
        background: 'var(--surface)', flexShrink: 0, gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/dashboard" style={{
            display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none',
            color: 'var(--text3)', fontFamily: 'var(--font-heading)', fontSize: 12,
          }}>
            <ArrowLeft size={14} />
          </Link>
          <div style={{ width: 1, height: 18, background: 'var(--border2)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 24, height: 24, borderRadius: 7, background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={12} color="#fff" />
            </div>
            <EditableTitle
              value={workbook.name}
              onSave={handleRenameWorkbook}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setAiOpen(o => !o)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: aiOpen ? 'var(--aglow)' : 'var(--surface2)',
            border: `1px solid ${aiOpen ? 'var(--accent)' : 'var(--border2)'}`,
            borderRadius: 7, padding: '5px 10px', cursor: 'pointer',
            fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 12,
            color: aiOpen ? 'var(--accent2)' : 'var(--text2)',
          }}>
            <PanelRight size={14} />
            AI
          </button>
          <button onClick={toggleTheme} style={{
            background: 'var(--surface2)', border: '1px solid var(--border2)',
            borderRadius: 7, padding: '6px 8px', cursor: 'pointer', color: 'var(--text2)',
            display: 'flex', alignItems: 'center',
          }}>
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          {profile && (
            <div style={{
              width: 28, height: 28, borderRadius: 7, background: 'var(--aglow)',
              border: '1px solid var(--accent)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 12, color: 'var(--accent2)',
            }}>
              {(profile.name || 'U')[0].toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar
        selectedCell={selectedCell}
        data={data}
        onFormat={setCellFormat}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onOpenChart={() => setChartOpen(true)}
      />

      {/* Formula bar */}
      <FormulaBar
        selectedCell={selectedCell}
        data={data}
        onCommit={setCellValue}
      />

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <SheetGrid
          data={data}
          selectedCell={selectedCell}
          onSelectCell={setSelectedCell}
          onCellChange={setCellValue}
          colWidths={activeSheet.col_widths || {}}
        />

        {aiOpen && (
          <AIPanel
            sheetData={data}
            sheetName={activeSheet.name}
            selectedCell={selectedCell}
            onCellWrites={applyAIWrites}
            userApiKey={profile?.openrouter_key || undefined}
            userPlan={profile?.plan}
            onClose={() => setAiOpen(false)}
          />
        )}
      </div>

      {/* Sheet tabs */}
      <SheetTabs
        sheets={sheets}
        activeSheetId={activeSheetId || ''}
        onSelectSheet={setActiveSheetId}
        onAddSheet={handleAddSheet}
        onRenameSheet={handleRenameSheet}
        onDeleteSheet={handleDeleteSheet}
      />

      {chartOpen && (
        <ChartModal data={data} onClose={() => setChartOpen(false)} />
      )}
    </div>
  )
}

function EditableTitle({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  if (editing) {
    return (
      <input
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={() => { onSave(draft); setEditing(false) }}
        onKeyDown={e => {
          if (e.key === 'Enter') { onSave(draft); setEditing(false) }
          if (e.key === 'Escape') { setDraft(value); setEditing(false) }
        }}
        autoFocus
        style={{
          background: 'var(--input-bg)', border: '1px solid var(--accent)',
          borderRadius: 6, color: 'var(--text)', fontFamily: 'var(--font-heading)',
          fontWeight: 700, fontSize: 14, padding: '3px 8px', outline: 'none',
        }}
      />
    )
  }

  return (
    <span
      onDoubleClick={() => { setDraft(value); setEditing(true) }}
      style={{
        fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: 'var(--text)',
        cursor: 'default', padding: '3px 0',
      }}
      title="Double-click to rename"
    >
      {value}
    </span>
  )
}
