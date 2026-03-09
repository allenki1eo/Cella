'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react'

type Mode = 'login' | 'signup' | 'forgot'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      router.push('/dashboard')

    } else if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          name: name || null,
        })
      }
      setSuccess('Check your email to confirm your account!')
      setLoading(false)

    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) { setError(error.message); setLoading(false); return }
      setSuccess('Reset link sent! Check your email.')
      setLoading(false)
    }
  }

  const titles: Record<Mode, string> = {
    login: 'Welcome back',
    signup: 'Create your account',
    forgot: 'Reset your password',
  }

  const subtitles: Record<Mode, string> = {
    login: 'Sign in to your Cella workspace',
    signup: 'Start building AI-powered spreadsheets',
    forgot: "We'll send you a reset link",
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div className="animate-fade-up" style={{
        width: '100%', maxWidth: 400,
        background: 'var(--surface)', border: '1px solid var(--border2)',
        borderRadius: 14, padding: '36px 32px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={18} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20, color: 'var(--text)' }}>
              Cella
            </span>
          </Link>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 22,
          color: 'var(--text)', textAlign: 'center', marginBottom: 6,
        }}>
          {titles[mode]}
        </h1>
        <p style={{
          fontFamily: 'var(--font-heading)', fontSize: 13, color: 'var(--text2)',
          textAlign: 'center', marginBottom: 28,
        }}>
          {subtitles[mode]}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'signup' && (
            <div>
              <label style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>
                Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={14} color="var(--text3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  style={{
                    width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border2)',
                    borderRadius: 8, color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 13,
                    padding: '10px 12px 10px 36px', outline: 'none',
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={14} color="var(--text3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required
                style={{
                  width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border2)',
                  borderRadius: 8, color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 13,
                  padding: '10px 12px 10px 36px', outline: 'none',
                }}
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 12, color: 'var(--text2)' }}>
                  Password
                </label>
                {mode === 'login' && (
                  <button type="button" onClick={() => setMode('forgot')} style={{
                    fontFamily: 'var(--font-heading)', fontSize: 12, color: 'var(--accent2)',
                    background: 'none', border: 'none', cursor: 'pointer',
                  }}>
                    Forgot password?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={14} color="var(--text3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required minLength={6}
                  style={{
                    width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border2)',
                    borderRadius: 8, color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 13,
                    padding: '10px 40px 10px 36px', outline: 'none',
                  }}
                />
                <button type="button" onClick={() => setShowPass(s => !s)} style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)',
                }}>
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div style={{
              background: 'rgba(255,118,117,0.08)', border: '1px solid rgba(255,118,117,0.3)',
              borderRadius: 8, padding: '10px 12px',
              fontFamily: 'var(--font-heading)', fontSize: 13, color: 'var(--red)',
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              background: 'rgba(0,206,201,0.08)', border: '1px solid rgba(0,206,201,0.3)',
              borderRadius: 8, padding: '10px 12px',
              fontFamily: 'var(--font-heading)', fontSize: 13, color: 'var(--green)',
            }}>
              {success}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 9,
            padding: '12px', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            boxShadow: '0 0 20px var(--aglow)',
          }}>
            {loading ? 'Loading...' : mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          {mode === 'forgot' ? (
            <button onClick={() => setMode('login')} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontFamily: 'var(--font-heading)', fontSize: 13, color: 'var(--text2)',
              background: 'none', border: 'none', cursor: 'pointer',
            }}>
              <ArrowLeft size={13} /> Back to sign in
            </button>
          ) : mode === 'login' ? (
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: 'var(--text2)' }}>
              No account?{' '}
              <button onClick={() => setMode('signup')} style={{ color: 'var(--accent2)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 13 }}>
                Sign up
              </button>
            </span>
          ) : (
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: 'var(--text2)' }}>
              Have an account?{' '}
              <button onClick={() => setMode('login')} style={{ color: 'var(--accent2)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 13 }}>
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
