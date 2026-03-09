'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/hooks/useTheme'

// ── Animated spreadsheet cells for the left panel ─────────────────────────────
const LIVE_DATA = [
  { label: 'AAPL', value: '189.42', change: '+2.3%', up: true },
  { label: 'Revenue Q4', value: '$201,300', change: '+20.2%', up: true },
  { label: 'EUR/USD', value: '1.0847', change: '-0.4%', up: false },
  { label: 'Net Profit', value: '$82,600', change: '+25.3%', up: true },
  { label: 'BTC/USD', value: '67,240', change: '+5.1%', up: true },
  { label: 'Headcount', value: '23', change: '+4', up: true },
]

const FORMULAS = [
  '=SUM(B2:B48)',
  '=AVERAGE(C1:C12)',
  '=IF(D4>100,"High","Low")',
  '=VLOOKUP(A2,Sheet2!A:C,3)',
]

const FEATURES = [
  { icon: '✦', text: 'AI writes formulas from plain English' },
  { icon: '⟳', text: 'Live market data pulled from the web' },
  { icon: '▦', text: 'Charts generated in one sentence' },
  { icon: '◈', text: 'Works with any AI model, your API key' },
]

// ── Auth-page scoped CSS ───────────────────────────────────────────────────────
const CSS = `
/* ── Layout ── */
.auth-wrap {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
}
@media (max-width: 860px) {
  .auth-wrap { grid-template-columns: 1fr; }
  .auth-left  { display: none; }
}

/* ── Left Panel ── */
.auth-left {
  background: #0d0f14;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px;
}
.left-grid {
  position: absolute; inset: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(108,92,231,.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(108,92,231,.08) 1px, transparent 1px);
  background-size: 52px 28px;
}
.left-glow {
  position: absolute; top: -120px; left: -80px;
  width: 500px; height: 500px; border-radius: 50%;
  background: radial-gradient(circle, rgba(108,92,231,.18) 0%, transparent 65%);
  pointer-events: none;
}
.left-glow2 {
  position: absolute; bottom: -100px; right: -60px;
  width: 380px; height: 380px; border-radius: 50%;
  background: radial-gradient(circle, rgba(0,206,201,.1) 0%, transparent 65%);
  pointer-events: none;
}

/* Logo */
.left-logo {
  display: flex; align-items: center; gap: 10px;
  position: relative; z-index: 1; text-decoration: none;
}
.left-logo-icon {
  width: 32px; height: 32px; background: var(--accent); border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-heading); font-weight: 800; font-size: 14px; color: white;
  box-shadow: 0 0 20px rgba(108,92,231,.5);
}
.left-logo-name {
  font-family: var(--font-heading); font-weight: 700; font-size: 16px; color: #dde1ec;
}
.left-logo-name span { color: var(--accent2); }

/* Tagline */
.left-tagline { position: relative; z-index: 1; }
.left-tagline h2 {
  font-family: var(--font-display);
  font-style: italic;
  font-size: clamp(28px, 3.5vw, 42px);
  color: #dde1ec;
  line-height: 1.15;
  letter-spacing: -1px;
  margin-bottom: 24px;
}
.left-tagline h2 span { color: var(--accent2); }
.left-features { display: flex; flex-direction: column; gap: 14px; }
.left-feature {
  display: flex; align-items: center; gap: 12px;
  font-size: 12px; color: #7d849a;
  animation: lf-fadeInLeft .5s ease both;
}
.left-feature-icon {
  width: 28px; height: 28px; border-radius: 6px;
  background: rgba(108,92,231,.12); border: 1px solid rgba(108,92,231,.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; color: var(--accent2); flex-shrink: 0;
}

/* Live ticker */
.left-ticker { position: relative; z-index: 1; }
.ticker-label {
  font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase;
  color: #454d60; margin-bottom: 10px;
  font-family: var(--font-heading); font-weight: 600;
}
.ticker-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.ticker-cell {
  background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06);
  border-radius: 7px; padding: 8px 10px;
  display: flex; justify-content: space-between; align-items: center;
  transition: background .2s; animation: lf-fadeInUp .4s ease both;
}
.ticker-cell:hover { background: rgba(255,255,255,.06); }
.ticker-name { font-size: 10px; color: #7d849a; }
.ticker-val  { font-size: 11px; color: #dde1ec; font-weight: 500; }
.ticker-change { font-size: 9px; padding: 1px 5px; border-radius: 4px; margin-top: 2px; }
.ticker-change.up { color: #00cec9; background: rgba(0,206,201,.1); }
.ticker-change.dn { color: #ff7675; background: rgba(255,118,117,.1); }

/* Formula floater */
.formula-floater {
  position: absolute; right: 48px; top: 50%; transform: translateY(-50%);
  display: flex; flex-direction: column; gap: 8px;
  opacity: .5; pointer-events: none;
}
.formula-pill {
  background: rgba(108,92,231,.08); border: 1px solid rgba(108,92,231,.15);
  border-radius: 6px; padding: 5px 10px; font-size: 10px; color: var(--accent2);
  white-space: nowrap; animation: lf-float 3s ease-in-out infinite;
}
.formula-pill:nth-child(2) { animation-delay: .5s; }
.formula-pill:nth-child(3) { animation-delay: 1s; }
.formula-pill:nth-child(4) { animation-delay: 1.5s; }

/* ── Right Panel ── */
.auth-right {
  background: var(--surface);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 48px 40px; position: relative;
}
.theme-toggle {
  position: absolute; top: 24px; right: 24px;
  width: 36px; height: 36px; border-radius: 8px;
  border: 1px solid var(--border2); background: var(--surface2);
  color: var(--text2); cursor: pointer; font-size: 16px;
  display: flex; align-items: center; justify-content: center;
  transition: all .15s;
}
.theme-toggle:hover { border-color: var(--accent); color: var(--accent2); }

.auth-card {
  width: 100%; max-width: 380px;
  animation: lf-fadeInRight .5s ease both;
}

/* Tabs */
.auth-tabs {
  display: flex; margin-bottom: 32px;
  background: var(--surface2); border-radius: 10px; padding: 4px;
}
.auth-tab {
  flex: 1; padding: 8px; border-radius: 7px; border: none; background: transparent;
  font-family: var(--font-body); font-size: 11px; color: var(--text2);
  cursor: pointer; transition: all .15s; font-weight: 500;
}
.auth-tab.on {
  background: var(--surface); color: var(--text);
  box-shadow: 0 1px 6px rgba(0,0,0,.2);
}

/* Heading */
.auth-heading { margin-bottom: 28px; }
.auth-heading h1 {
  font-family: var(--font-display); font-size: 28px; font-style: italic;
  color: var(--text); letter-spacing: -.5px; margin-bottom: 6px;
}
.auth-heading p { font-size: 12px; color: var(--text2); line-height: 1.6; }

/* OAuth */
.oauth-btns { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
.oauth-btn {
  width: 100%; padding: 11px 16px; border-radius: 9px;
  border: 1px solid var(--border2); background: var(--surface2);
  color: var(--text); font-family: var(--font-body); font-size: 12px;
  cursor: pointer; transition: all .15s;
  display: flex; align-items: center; justify-content: center; gap: 10px;
}
.oauth-btn:hover {
  border-color: var(--accent); background: var(--surface3);
  transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,.15);
}
.oauth-icon { width: 18px; height: 18px; flex-shrink: 0; }

/* Divider */
.auth-divider { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.auth-divider-line { flex: 1; height: 1px; background: var(--border2); }
.auth-divider-text { font-size: 10px; color: var(--text3); letter-spacing: .5px; text-transform: uppercase; }

/* Form */
.auth-form { display: flex; flex-direction: column; gap: 14px; }
.a-field { display: flex; flex-direction: column; gap: 5px; animation: lf-fadeInUp .35s ease both; }
.a-field:nth-child(1){animation-delay:.05s;}
.a-field:nth-child(2){animation-delay:.1s;}
.a-field:nth-child(3){animation-delay:.15s;}
.a-field:nth-child(4){animation-delay:.2s;}
.a-label {
  font-size: 10px; color: var(--text2); letter-spacing: .3px;
  font-family: var(--font-heading); font-weight: 600; text-transform: uppercase;
}
.a-input-wrap { position: relative; }
.a-input {
  width: 100%; padding: 10px 14px; border-radius: 8px;
  border: 1px solid var(--border2); background: var(--input-bg);
  color: var(--text); font-family: var(--font-body); font-size: 12px;
  outline: none; transition: all .15s;
}
.a-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(108,92,231,.15); }
.a-input::placeholder { color: var(--text3); }
.a-input.error { border-color: var(--red); box-shadow: 0 0 0 3px rgba(255,118,117,.1); }
.a-err { font-size: 10px; color: var(--red); margin-top: 2px; }
.a-eye {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: var(--text3); cursor: pointer;
  font-size: 14px; padding: 0; line-height: 1; transition: color .12s;
}
.a-eye:hover { color: var(--text2); }

/* Password strength */
.pwd-strength { display: flex; gap: 4px; margin-top: 6px; }
.pwd-bar { flex: 1; height: 3px; border-radius: 2px; background: var(--border2); transition: background .3s; }
.pwd-bar.weak { background: var(--red); }
.pwd-bar.fair { background: var(--amber); }
.pwd-bar.good { background: var(--green); }
.pwd-label { font-size: 10px; color: var(--text3); margin-top: 4px; }

/* Checkbox */
.check-row { display: flex; align-items: flex-start; gap: 10px; cursor: pointer; }
.check-box {
  width: 16px; height: 16px; border-radius: 4px; border: 1px solid var(--border2);
  background: var(--input-bg); flex-shrink: 0; display: flex;
  align-items: center; justify-content: center; transition: all .12s; margin-top: 1px;
}
.check-box.on { background: var(--accent); border-color: var(--accent); }
.check-mark { color: white; font-size: 10px; }
.check-label { font-size: 11px; color: var(--text2); line-height: 1.5; }
.check-label a { color: var(--accent2); text-decoration: none; }
.check-label a:hover { text-decoration: underline; }

/* Submit */
.a-submit {
  width: 100%; padding: 12px; border-radius: 9px; border: none;
  background: var(--accent); color: white;
  font-family: var(--font-heading); font-size: 13px; font-weight: 700;
  cursor: pointer; transition: all .15s; margin-top: 4px;
  box-shadow: 0 4px 16px rgba(108,92,231,.35);
  position: relative; overflow: hidden;
}
.a-submit:hover { background: var(--accent2); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(108,92,231,.45); }
.a-submit:active { transform: translateY(0); }
.a-submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }
.a-submit.loading::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.15), transparent);
  animation: lf-shimmer 1.2s infinite;
}

/* Misc */
.forgot-link {
  text-align: right; font-size: 10px; color: var(--text3);
  cursor: pointer; transition: color .12s; margin-top: -8px;
}
.forgot-link:hover { color: var(--accent2); }
.auth-switch { text-align: center; margin-top: 20px; font-size: 11px; color: var(--text2); }
.auth-switch a { color: var(--accent2); text-decoration: none; cursor: pointer; }
.auth-switch a:hover { text-decoration: underline; }
.a-alert {
  padding: 10px 14px; border-radius: 8px; font-size: 11px; line-height: 1.5; margin-bottom: 4px;
}
.a-alert.err     { background: rgba(255,118,117,.08); border: 1px solid rgba(255,118,117,.2); color: var(--red); }
.a-alert.info    { background: rgba(108,92,231,.08);  border: 1px solid rgba(108,92,231,.2);  color: var(--accent2); }
.a-alert.success { background: rgba(0,206,201,.08);   border: 1px solid rgba(0,206,201,.2);   color: var(--green); }

/* Success card */
.success-card {
  text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px;
  animation: lf-fadeInRight .4s ease;
}
.success-icon {
  width: 56px; height: 56px; border-radius: 50%;
  background: rgba(0,206,201,.1); border: 2px solid rgba(0,206,201,.3);
  display: flex; align-items: center; justify-content: center; font-size: 24px;
}
.success-title { font-family: var(--font-display); font-size: 22px; font-style: italic; color: var(--text); letter-spacing: -.3px; }
.success-desc  { font-size: 12px; color: var(--text2); line-height: 1.7; max-width: 280px; }
.success-btn {
  padding: 10px 24px; background: var(--accent); border: none; border-radius: 8px;
  color: white; font-family: var(--font-heading); font-size: 12px; font-weight: 700;
  cursor: pointer; transition: all .15s; box-shadow: 0 2px 10px rgba(108,92,231,.3);
}
.success-btn:hover { background: var(--accent2); }

/* Keyframes */
@keyframes lf-float       { 0%,100%{transform:translateY(0);}       50%{transform:translateY(-6px);} }
@keyframes lf-shimmer     { from{transform:translateX(-100%);}       to{transform:translateX(100%);} }
@keyframes lf-fadeInLeft  { from{opacity:0;transform:translateX(-16px);} to{opacity:1;transform:translateX(0);} }
@keyframes lf-fadeInRight { from{opacity:0;transform:translateX(16px);}  to{opacity:1;transform:translateX(0);} }
@keyframes lf-fadeInUp    { from{opacity:0;transform:translateY(10px);}  to{opacity:1;transform:translateY(0);} }
`

// ── Password strength ─────────────────────────────────────────────────────────
function getPwdStrength(pwd: string): number {
  if (!pwd) return 0
  let s = 0
  if (pwd.length >= 8)          s++
  if (/[A-Z]/.test(pwd))        s++
  if (/[0-9]/.test(pwd))        s++
  if (/[^A-Za-z0-9]/.test(pwd)) s++
  return s
}

// ── SVG icons ─────────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg className="oauth-icon" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

const GithubIcon = () => (
  <svg className="oauth-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
)

// ── Types ─────────────────────────────────────────────────────────────────────
type View = 'login' | 'signup' | 'forgot' | 'success'

// ── Component ─────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const { theme, toggleTheme } = useTheme()

  const [view, setView] = useState<View>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [alertMsg, setAlertMsg] = useState<{ type: string; text: string } | null>(null)

  const pwdStrength = getPwdStrength(password)
  const pwdLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][pwdStrength]
  const pwdColor = ['', 'weak', 'fair', 'good', 'good'][pwdStrength]

  const switchTo = (v: View) => {
    setView(v)
    setErrors({})
    setAlertMsg(null)
    setPassword('')
    setShowPwd(false)
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email'
    if (view !== 'forgot') {
      if (!password) e.password = 'Password is required'
      else if (password.length < 8) e.password = 'At least 8 characters'
    }
    if (view === 'signup') {
      if (!name) e.name = 'Full name is required'
      if (!agreed) e.agreed = 'You must agree to the terms'
    }
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    setAlertMsg(null)

    if (view === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setAlertMsg({ type: 'err', text: error.message }); setLoading(false); return }
      router.push('/dashboard')

    } else if (view === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) { setAlertMsg({ type: 'err', text: error.message }); setLoading(false); return }
      if (data.user) {
        await supabase.from('profiles').upsert({ id: data.user.id, name: name || null })
      }
      setAlertMsg({ type: 'success', text: '✓ Account created! Check your email to verify.' })
      setLoading(false)

    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) { setAlertMsg({ type: 'err', text: error.message }); setLoading(false); return }
      setView('success')
      setLoading(false)
    }
  }

  const handleOAuth = async (provider: 'google' | 'github') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const isDark = theme === 'dark'

  return (
    <div style={{ minHeight: '100vh' }}>
      <style>{CSS}</style>

      <div className="auth-wrap">

        {/* ── Left Panel ── */}
        <div className="auth-left">
          <div className="left-grid" />
          <div className="left-glow" />
          <div className="left-glow2" />

          {/* Logo */}
          <a href="/" className="left-logo">
            <div className="left-logo-icon">C</div>
            <div className="left-logo-name">Cell<span>a</span></div>
          </a>

          {/* Tagline + features */}
          <div className="left-tagline">
            <h2>
              The spreadsheet<br />
              that <span>thinks</span><br />
              with you.
            </h2>
            <div className="left-features">
              {FEATURES.map((f, i) => (
                <div key={i} className="left-feature" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="left-feature-icon">{f.icon}</div>
                  {f.text}
                </div>
              ))}
            </div>
          </div>

          {/* Live data ticker */}
          <div className="left-ticker">
            <div className="ticker-label">Live data · powered by AI web search</div>
            <div className="ticker-grid">
              {LIVE_DATA.map((d, i) => (
                <div key={i} className="ticker-cell" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div>
                    <div className="ticker-name">{d.label}</div>
                    <div className="ticker-val">{d.value}</div>
                  </div>
                  <div className={`ticker-change ${d.up ? 'up' : 'dn'}`}>{d.change}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating formulas */}
          <div className="formula-floater">
            {FORMULAS.map((f, i) => (
              <div key={i} className="formula-pill" style={{ animationDelay: `${i * 0.4}s` }}>{f}</div>
            ))}
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="auth-right">
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {isDark ? '☀️' : '🌙'}
          </button>

          <div className="auth-card">

            {/* SUCCESS STATE */}
            {view === 'success' ? (
              <div className="success-card">
                <div className="success-icon">📬</div>
                <div className="success-title">Check your inbox</div>
                <div className="success-desc">
                  We sent a password reset link to{' '}
                  <strong style={{ color: 'var(--text)' }}>{email}</strong>.
                  It expires in 15 minutes.
                </div>
                <button className="success-btn" onClick={() => switchTo('login')}>
                  Back to sign in
                </button>
              </div>

            ) : view === 'forgot' ? (

              /* FORGOT PASSWORD */
              <>
                <div className="auth-heading">
                  <h1>Reset password</h1>
                  <p>Enter your email and we'll send a reset link.</p>
                </div>

                {alertMsg && <div className={`a-alert ${alertMsg.type}`}>{alertMsg.text}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                  <div className="a-field">
                    <div className="a-label">Email address</div>
                    <input
                      className={`a-input${errors.email ? ' error' : ''}`}
                      type="email" placeholder="you@company.com"
                      value={email} onChange={e => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                    {errors.email && <div className="a-err">{errors.email}</div>}
                  </div>

                  <button
                    type="submit"
                    className={`a-submit${loading ? ' loading' : ''}`}
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send reset link →'}
                  </button>
                </form>

                <div className="auth-switch" style={{ marginTop: 20 }}>
                  <a onClick={() => switchTo('login')}>← Back to sign in</a>
                </div>
              </>

            ) : (

              /* LOGIN / SIGNUP */
              <>
                {/* Tab switcher */}
                <div className="auth-tabs">
                  <button
                    className={`auth-tab${view === 'login' ? ' on' : ''}`}
                    onClick={() => switchTo('login')}
                  >
                    Sign in
                  </button>
                  <button
                    className={`auth-tab${view === 'signup' ? ' on' : ''}`}
                    onClick={() => switchTo('signup')}
                  >
                    Create account
                  </button>
                </div>

                {/* Heading */}
                <div className="auth-heading">
                  <h1>{view === 'login' ? 'Welcome back.' : 'Start for free.'}</h1>
                  <p>
                    {view === 'login'
                      ? 'Sign in to your Cella workspace.'
                      : 'No credit card required. Free tier available.'}
                  </p>
                </div>

                {alertMsg && <div className={`a-alert ${alertMsg.type}`}>{alertMsg.text}</div>}

                {/* OAuth */}
                <div className="oauth-btns">
                  <button className="oauth-btn" onClick={() => handleOAuth('google')}>
                    <GoogleIcon />
                    Continue with Google
                  </button>
                  <button className="oauth-btn" onClick={() => handleOAuth('github')}>
                    <GithubIcon />
                    Continue with GitHub
                  </button>
                </div>

                {/* Divider */}
                <div className="auth-divider">
                  <div className="auth-divider-line" />
                  <div className="auth-divider-text">or with email</div>
                  <div className="auth-divider-line" />
                </div>

                {/* Form */}
                <form className="auth-form" onSubmit={handleSubmit}>

                  {/* Name — signup only */}
                  {view === 'signup' && (
                    <div className="a-field">
                      <div className="a-label">Full name</div>
                      <input
                        className={`a-input${errors.name ? ' error' : ''}`}
                        type="text" placeholder="Jane Smith"
                        value={name} onChange={e => setName(e.target.value)}
                        autoComplete="name"
                      />
                      {errors.name && <div className="a-err">{errors.name}</div>}
                    </div>
                  )}

                  {/* Email */}
                  <div className="a-field">
                    <div className="a-label">Email address</div>
                    <input
                      className={`a-input${errors.email ? ' error' : ''}`}
                      type="email" placeholder="you@company.com"
                      value={email} onChange={e => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                    {errors.email && <div className="a-err">{errors.email}</div>}
                  </div>

                  {/* Password */}
                  <div className="a-field">
                    <div className="a-label">Password</div>
                    <div className="a-input-wrap">
                      <input
                        className={`a-input${errors.password ? ' error' : ''}`}
                        type={showPwd ? 'text' : 'password'}
                        placeholder={view === 'signup' ? 'Min 8 characters' : '••••••••'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        autoComplete={view === 'login' ? 'current-password' : 'new-password'}
                        style={{ paddingRight: 38 }}
                      />
                      <button type="button" className="a-eye" onClick={() => setShowPwd(s => !s)}>
                        {showPwd ? '🙈' : '👁'}
                      </button>
                    </div>
                    {errors.password && <div className="a-err">{errors.password}</div>}

                    {/* Password strength bars — signup only */}
                    {view === 'signup' && password && (
                      <>
                        <div className="pwd-strength">
                          {[1, 2, 3, 4].map(i => (
                            <div
                              key={i}
                              className={`pwd-bar${i <= pwdStrength ? ` ${pwdColor}` : ''}`}
                            />
                          ))}
                        </div>
                        <div
                          className="pwd-label"
                          style={{
                            color: pwdStrength <= 1 ? 'var(--red)'
                              : pwdStrength <= 2 ? 'var(--amber)'
                              : 'var(--green)',
                          }}
                        >
                          {pwdLabel} password
                        </div>
                      </>
                    )}
                  </div>

                  {/* Forgot link — login only */}
                  {view === 'login' && (
                    <div className="forgot-link" onClick={() => switchTo('forgot')}>
                      Forgot password?
                    </div>
                  )}

                  {/* Terms checkbox — signup only */}
                  {view === 'signup' && (
                    <div>
                      <div className="check-row" onClick={() => setAgreed(a => !a)}>
                        <div className={`check-box${agreed ? ' on' : ''}`}>
                          {agreed && <span className="check-mark">✓</span>}
                        </div>
                        <div className="check-label">
                          I agree to the{' '}
                          <a href="/terms" onClick={e => e.stopPropagation()}>Terms of Service</a>
                          {' '}and{' '}
                          <a href="/privacy" onClick={e => e.stopPropagation()}>Privacy Policy</a>
                        </div>
                      </div>
                      {errors.agreed && (
                        <div className="a-err" style={{ marginTop: 4 }}>{errors.agreed}</div>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    className={`a-submit${loading ? ' loading' : ''}`}
                    disabled={loading}
                  >
                    {loading
                      ? (view === 'login' ? 'Signing in...' : 'Creating account...')
                      : (view === 'login' ? 'Sign in →' : 'Create free account →')}
                  </button>
                </form>

                <div className="auth-switch">
                  {view === 'login'
                    ? <><span>Don't have an account? </span><a onClick={() => switchTo('signup')}>Sign up free</a></>
                    : <><span>Already have an account? </span><a onClick={() => switchTo('login')}>Sign in</a></>
                  }
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
