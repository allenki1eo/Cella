'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AppNav from '@/components/layout/AppNav'
import { Profile } from '@/types'
import { Save, Eye, EyeOff, User, Bell, Cpu, Palette } from 'lucide-react'

type Tab = 'profile' | 'ai' | 'notifications' | 'appearance'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [showKey, setShowKey] = useState(false)

  // Profile fields
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [bio, setBio] = useState('')
  const [openrouterKey, setOpenrouterKey] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (prof) {
        setProfile(prof)
        setName(prof.name || '')
        setCompany(prof.company || '')
        setBio(prof.bio || '')
        setOpenrouterKey(prof.openrouter_key || '')
      }
      setLoading(false)
    }
    load()
  }, [router, supabase])

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    await supabase.from('profiles').update({
      name: name || null,
      company: company || null,
      bio: bio || null,
      openrouter_key: openrouterKey || null,
    }).eq('id', profile.id)
    setProfile(prev => prev ? { ...prev, name, company, bio } : prev)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'profile',      label: 'Profile',      icon: <User size={15} /> },
    { key: 'ai',           label: 'AI & Models',   icon: <Cpu size={15} /> },
    { key: 'notifications', label: 'Notifications', icon: <Bell size={15} /> },
    { key: 'appearance',   label: 'Appearance',    icon: <Palette size={15} /> },
  ]

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

      <main style={{ flex: 1, padding: '40px', maxWidth: 900, width: '100%', margin: '0 auto' }}>
        <div className="animate-fade-up" style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 26, color: 'var(--text)', marginBottom: 4 }}>
            Settings
          </h1>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: 'var(--text2)' }}>
            Manage your account and preferences
          </p>
        </div>

        <div className="animate-fade-up stagger-1" style={{ display: 'flex', gap: 24 }}>
          {/* Sidebar */}
          <div style={{ width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px', borderRadius: 9,
                  border: activeTab === tab.key ? '1px solid var(--accent)' : '1px solid transparent',
                  background: activeTab === tab.key ? 'var(--aglow)' : 'transparent',
                  color: activeTab === tab.key ? 'var(--accent2)' : 'var(--text2)',
                  fontFamily: 'var(--font-heading)', fontWeight: activeTab === tab.key ? 700 : 500,
                  fontSize: 13, cursor: 'pointer', textAlign: 'left', width: '100%',
                  transition: 'all 0.15s',
                } as React.CSSProperties}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1 }}>
            {activeTab === 'profile' && (
              <div style={{
                background: 'var(--surface)', border: '1px solid var(--border2)',
                borderRadius: 12, padding: '28px',
              }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, color: 'var(--text)', marginBottom: 22 }}>
                  Profile
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <SettingField label="Name" value={name} onChange={setName} placeholder="Your full name" />
                  <SettingField label="Company" value={company} onChange={setCompany} placeholder="Your company (optional)" />
                  <SettingField label="Bio" value={bio} onChange={setBio} placeholder="A short bio" textarea />
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div style={{
                background: 'var(--surface)', border: '1px solid var(--border2)',
                borderRadius: 12, padding: '28px',
              }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, color: 'var(--text)', marginBottom: 8 }}>
                  AI & Models
                </h2>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: 'var(--text2)', marginBottom: 22, lineHeight: 1.6 }}>
                  Bring your own OpenRouter API key to use any model without limits.
                  Your key is stored securely and used instead of the platform key.
                </p>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>
                    OpenRouter API Key
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={openrouterKey}
                      onChange={e => setOpenrouterKey(e.target.value)}
                      placeholder="sk-or-..."
                      style={{
                        width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border2)',
                        borderRadius: 8, color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 13,
                        padding: '10px 40px 10px 12px', outline: 'none',
                      }}
                    />
                    <button type="button" onClick={() => setShowKey(s => !s)} style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)',
                    }}>
                      {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>
                    Get your key at openrouter.ai — supports 100+ models
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div style={{
                background: 'var(--surface)', border: '1px solid var(--border2)',
                borderRadius: 12, padding: '28px',
              }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, color: 'var(--text)', marginBottom: 22 }}>
                  Notifications
                </h2>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: 'var(--text2)' }}>
                  Notification preferences coming soon.
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div style={{
                background: 'var(--surface)', border: '1px solid var(--border2)',
                borderRadius: 12, padding: '28px',
              }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, color: 'var(--text)', marginBottom: 22 }}>
                  Appearance
                </h2>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: 'var(--text2)' }}>
                  Theme is controlled by the toggle in the navigation bar.
                </div>
              </div>
            )}

            {/* Save button */}
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={handleSave} disabled={saving} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: saved ? 'rgba(0,206,201,0.15)' : 'var(--accent)',
                color: saved ? 'var(--green)' : '#fff',
                border: saved ? '1px solid rgba(0,206,201,0.4)' : 'none',
                borderRadius: 9, padding: '10px 22px',
                fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13,
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              } as React.CSSProperties}>
                <Save size={14} />
                {saved ? 'Saved!' : saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function SettingField({ label, value, onChange, placeholder, textarea }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  textarea?: boolean
}) {
  return (
    <div>
      <label style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>
        {label}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          style={{
            width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border2)',
            borderRadius: 8, color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 13,
            padding: '10px 12px', outline: 'none', resize: 'vertical',
          }}
        />
      ) : (
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border2)',
            borderRadius: 8, color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 13,
            padding: '10px 12px', outline: 'none',
          }}
        />
      )}
    </div>
  )
}
