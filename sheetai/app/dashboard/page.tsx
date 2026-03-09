'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AppNav from '@/components/layout/AppNav'
import { Workbook, Profile } from '@/types'
import { Plus, Star, Trash2, FileSpreadsheet, Clock, Search } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [workbooks, setWorkbooks] = useState<Workbook[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [{ data: prof }, { data: wbs }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('workbooks').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }),
      ])
      setProfile(prof)
      setWorkbooks(wbs || [])
      setLoading(false)
    }
    load()
  }, [router, supabase])

  const createWorkbook = async () => {
    if (creating) return
    setCreating(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: wb } = await supabase
      .from('workbooks')
      .insert({ user_id: user.id, name: 'Untitled workbook' })
      .select()
      .single()

    if (wb) {
      await supabase.from('sheets').insert({
        workbook_id: wb.id, name: 'Sheet1', position: 0, data: {},
      })
      router.push(`/sheet/${wb.id}`)
    }
    setCreating(false)
  }

  const toggleStar = async (id: string, starred: boolean) => {
    await supabase.from('workbooks').update({ starred: !starred }).eq('id', id)
    setWorkbooks(prev => prev.map(w => w.id === id ? { ...w, starred: !starred } : w))
  }

  const deleteWorkbook = async (id: string) => {
    if (!confirm('Delete this workbook? This cannot be undone.')) return
    await supabase.from('workbooks').delete().eq('id', id)
    setWorkbooks(prev => prev.filter(w => w.id !== id))
  }

  const filtered = workbooks.filter(w => w.name.toLowerCase().includes(search.toLowerCase()))
  const starred = filtered.filter(w => w.starred)
  const recent = filtered.filter(w => !w.starred)

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <AppNav profile={profile} />

      <main style={{ flex: 1, padding: '32px 40px', maxWidth: 1200, width: '100%', margin: '0 auto' }}>
        {/* Header */}
        <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 26, color: 'var(--text)', marginBottom: 4 }}>
              {profile?.name ? `Hello, ${profile.name.split(' ')[0]}` : 'Your workbooks'}
            </h1>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: 'var(--text2)' }}>
              {workbooks.length} workbook{workbooks.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={createWorkbook} disabled={creating} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--accent)', color: '#fff', border: 'none',
            borderRadius: 9, padding: '11px 20px', cursor: creating ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13,
            boxShadow: '0 0 20px var(--aglow)', opacity: creating ? 0.7 : 1,
          }}>
            <Plus size={16} /> New workbook
          </button>
        </div>

        {/* Search */}
        <div className="animate-fade-up stagger-1" style={{ position: 'relative', marginBottom: 28, maxWidth: 400 }}>
          <Search size={14} color="var(--text3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search workbooks..."
            style={{
              width: '100%', background: 'var(--surface)', border: '1px solid var(--border2)',
              borderRadius: 9, color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 13,
              padding: '10px 12px 10px 36px', outline: 'none',
            }}
          />
        </div>

        {workbooks.length === 0 ? (
          <div className="animate-fade-up stagger-2" style={{
            textAlign: 'center', padding: '60px 20px',
            border: '2px dashed var(--border2)', borderRadius: 14,
          }}>
            <FileSpreadsheet size={40} color="var(--text3)" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, color: 'var(--text)', marginBottom: 8 }}>
              No workbooks yet
            </h2>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>
              Create your first AI-powered spreadsheet
            </p>
            <button onClick={createWorkbook} style={{
              background: 'var(--accent)', color: '#fff', border: 'none',
              borderRadius: 9, padding: '11px 22px',
              fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}>
              Create workbook
            </button>
          </div>
        ) : (
          <>
            {starred.length > 0 && (
              <section className="animate-fade-up stagger-2" style={{ marginBottom: 36 }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: 'var(--text2)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Star size={14} fill="var(--amber)" color="var(--amber)" /> Starred
                </h2>
                <WorkbookGrid workbooks={starred} onToggleStar={toggleStar} onDelete={deleteWorkbook} formatDate={formatDate} />
              </section>
            )}

            {recent.length > 0 && (
              <section className="animate-fade-up stagger-3">
                <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: 'var(--text2)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={14} /> Recent
                </h2>
                <WorkbookGrid workbooks={recent} onToggleStar={toggleStar} onDelete={deleteWorkbook} formatDate={formatDate} />
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function WorkbookGrid({ workbooks, onToggleStar, onDelete, formatDate }: {
  workbooks: Workbook[]
  onToggleStar: (id: string, starred: boolean) => void
  onDelete: (id: string) => void
  formatDate: (d: string) => string
}) {
  const router = useRouter()
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
      {workbooks.map(wb => (
        <div key={wb.id}
          onClick={() => router.push(`/sheet/${wb.id}`)}
          style={{
            background: 'var(--surface)', border: '1px solid var(--border2)',
            borderRadius: 12, overflow: 'hidden', position: 'relative',
            transition: 'border-color 0.2s, transform 0.2s',
            cursor: 'pointer',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent)'
            ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border2)'
            ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
          }}
        >
          {/* Preview area */}
          <div style={{
            height: 100, background: 'var(--surface2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderBottom: '1px solid var(--border)',
          }}>
            <FileSpreadsheet size={32} color="var(--text3)" />
          </div>

          {/* Info */}
          <div style={{ padding: '12px 14px' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {wb.name}
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 11, color: 'var(--text3)' }}>
              Updated {formatDate(wb.updated_at)}
            </div>
          </div>

          {/* Actions */}
          <div style={{
            position: 'absolute', top: 8, right: 8,
            display: 'flex', gap: 4,
          }}>
            <button onClick={e => { e.stopPropagation(); onToggleStar(wb.id, wb.starred) }} style={{
              width: 28, height: 28, borderRadius: 7, border: 'none', cursor: 'pointer',
              background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Star size={13} fill={wb.starred ? 'var(--amber)' : 'none'} color={wb.starred ? 'var(--amber)' : 'var(--text3)'} />
            </button>
            <button onClick={e => { e.stopPropagation(); onDelete(wb.id) }} style={{
              width: 28, height: 28, borderRadius: 7, border: 'none', cursor: 'pointer',
              background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Trash2 size={13} color="var(--text3)" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
