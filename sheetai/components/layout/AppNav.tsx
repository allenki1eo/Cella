'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Sun, Moon, Settings, CreditCard, LayoutDashboard, LogOut, Sparkles } from 'lucide-react'
import { useThemeContext } from './ThemeProvider'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'

interface AppNavProps {
  profile?: Profile | null
}

export default function AppNav({ profile }: AppNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggleTheme } = useThemeContext()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={15} /> },
    { href: '/billing',   label: 'Billing',   icon: <CreditCard size={15} /> },
    { href: '/settings',  label: 'Settings',  icon: <Settings size={15} /> },
  ]

  return (
    <nav style={{
      height: 52, background: 'var(--surface)', borderBottom: '1px solid var(--border2)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px', flexShrink: 0,
    }}>
      {/* Logo */}
      <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Sparkles size={15} color="#fff" />
        </div>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16, color: 'var(--text)' }}>
          Cella
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {navLinks.map(({ href, label, icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 7, textDecoration: 'none',
              fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 13,
              color: active ? 'var(--accent2)' : 'var(--text2)',
              background: active ? 'var(--aglow)' : 'transparent',
              transition: 'all 0.15s',
            }}>
              {icon}
              {label}
            </Link>
          )
        })}
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Plan badge */}
        {profile?.plan && profile.plan !== 'free' && (
          <span style={{
            fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 10,
            padding: '2px 8px', borderRadius: 20,
            background: profile.plan === 'team' ? 'rgba(253,203,110,0.12)' : 'var(--aglow)',
            color: profile.plan === 'team' ? 'var(--amber)' : 'var(--accent2)',
            border: `1px solid ${profile.plan === 'team' ? 'rgba(253,203,110,0.3)' : 'var(--accent)'}`,
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            {profile.plan}
          </span>
        )}

        {/* Theme toggle */}
        <button onClick={toggleTheme} style={{
          background: 'var(--surface2)', border: '1px solid var(--border2)',
          borderRadius: 7, padding: '6px 8px', cursor: 'pointer', color: 'var(--text2)',
          display: 'flex', alignItems: 'center',
        }}>
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Avatar / sign out */}
        {profile && (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--aglow)', border: '1px solid var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, color: 'var(--accent2)',
            }}>
              {(profile.name || 'U')[0].toUpperCase()}
            </div>
            <button onClick={handleSignOut} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text3)', padding: 4, display: 'flex', alignItems: 'center',
            }} title="Sign out">
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
