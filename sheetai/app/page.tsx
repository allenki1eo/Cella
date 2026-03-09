'use client'
import Link from 'next/link'
import { useThemeContext } from '@/components/layout/ThemeProvider'
import { Sun, Moon, Sparkles, Zap, Shield, BarChart3, ArrowRight, Check } from 'lucide-react'

export default function LandingPage() {
  const { theme, toggleTheme } = useThemeContext()

  const features = [
    { icon: <Sparkles size={20} />, title: 'AI-Native', desc: 'Chat with your data. Ask questions, generate formulas, write entire datasets with natural language.' },
    { icon: <Zap size={20} />,      title: 'Real-Time Data', desc: 'Pull live stock prices, exchange rates, and web data directly into cells.' },
    { icon: <BarChart3 size={20} />, title: 'Smart Charts', desc: 'Generate beautiful bar, line, area, and pie charts from your data in seconds.' },
    { icon: <Shield size={20} />,   title: 'BYOK Ready',    desc: 'Bring your own OpenRouter key for unlimited AI power. Your data stays yours.' },
  ]

  const plans = [
    {
      name: 'Free', price: '$0', period: '/month',
      features: ['50 AI requests/month', '5 workbooks', 'Free AI models', 'Core spreadsheet features'],
      cta: 'Get started free', href: '/login', accent: false,
    },
    {
      name: 'Pro', price: '$12', period: '/month',
      features: ['1,000 AI requests/month', 'Unlimited workbooks', 'Claude Sonnet access', 'Priority support'],
      cta: 'Start Pro', href: '/login', accent: true,
    },
    {
      name: 'Team', price: '$39', period: '/month',
      features: ['Unlimited AI requests', 'Collaboration features', 'Claude Opus access', 'Admin dashboard'],
      cta: 'Start Team', href: '/login', accent: false,
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: 60, borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 100,
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={17} color="#fff" />
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, color: 'var(--text)' }}>
            Cella
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={toggleTheme} style={{
            background: 'var(--surface)', border: '1px solid var(--border2)',
            borderRadius: 8, padding: '7px 10px', cursor: 'pointer', color: 'var(--text2)',
            display: 'flex', alignItems: 'center',
          }}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link href="/login" style={{
            fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13,
            color: 'var(--text2)', textDecoration: 'none', padding: '7px 14px',
          }}>
            Sign in
          </Link>
          <Link href="/login" style={{
            fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13,
            background: 'var(--accent)', color: '#fff', textDecoration: 'none',
            padding: '8px 18px', borderRadius: 9,
            boxShadow: '0 0 20px var(--aglow)',
          }}>
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '90px 20px 70px', maxWidth: 760, margin: '0 auto' }}>
        <div className="animate-fade-up" style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: 'var(--aglow)', border: '1px solid var(--accent)',
          borderRadius: 20, padding: '5px 14px', marginBottom: 28,
        }}>
          <Sparkles size={12} color="var(--accent2)" />
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 12, color: 'var(--accent2)' }}>
            Powered by Claude, Gemini & more
          </span>
        </div>

        <h1 className="animate-fade-up stagger-1" style={{
          fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(36px, 6vw, 68px)',
          lineHeight: 1.1, color: 'var(--text)', marginBottom: 22,
        }}>
          The spreadsheet that
          <br />
          <span style={{
            fontFamily: 'var(--font-display)', fontStyle: 'italic',
            background: 'linear-gradient(135deg, var(--accent2) 0%, var(--green) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            thinks with you
          </span>
        </h1>

        <p className="animate-fade-up stagger-2" style={{
          fontFamily: 'var(--font-heading)', fontSize: 17, color: 'var(--text2)',
          lineHeight: 1.7, marginBottom: 36, maxWidth: 520, margin: '0 auto 36px',
        }}>
          Cella combines AI chat, live data, and powerful formulas into one seamless workspace.
          Just describe what you want — and it builds it.
        </p>

        <div className="animate-fade-up stagger-3" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15,
            background: 'var(--accent)', color: '#fff', textDecoration: 'none',
            padding: '13px 28px', borderRadius: 10,
            boxShadow: '0 0 30px var(--aglow)',
          }}>
            Start for free <ArrowRight size={16} />
          </Link>
          <Link href="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15,
            background: 'var(--surface)', color: 'var(--text2)', textDecoration: 'none',
            padding: '13px 28px', borderRadius: 10, border: '1px solid var(--border2)',
          }}>
            Live demo
          </Link>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '60px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 className="animate-fade-up" style={{
          fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 32,
          textAlign: 'center', marginBottom: 48, color: 'var(--text)',
        }}>
          Everything you need, nothing you don&apos;t
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {features.map((f, i) => (
            <div key={i} className={`animate-fade-up stagger-${i + 1}`} style={{
              background: 'var(--surface)', border: '1px solid var(--border2)',
              borderRadius: 12, padding: '24px 20px',
              transition: 'border-color 0.2s, transform 0.2s',
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
              <div style={{
                width: 42, height: 42, borderRadius: 10, background: 'var(--aglow)',
                border: '1px solid var(--accent)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'var(--accent2)', marginBottom: 14,
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 8 }}>
                {f.title}
              </h3>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '60px 40px 80px', maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{
          fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 32,
          textAlign: 'center', marginBottom: 12, color: 'var(--text)',
        }}>
          Simple, transparent pricing
        </h2>
        <p style={{
          fontFamily: 'var(--font-heading)', fontSize: 15, color: 'var(--text2)',
          textAlign: 'center', marginBottom: 48,
        }}>
          Start free. Upgrade when you need more.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
          {plans.map((plan, i) => (
            <div key={i} style={{
              background: plan.accent ? 'var(--surface)' : 'var(--surface)',
              border: `1px solid ${plan.accent ? 'var(--accent)' : 'var(--border2)'}`,
              borderRadius: 14, padding: '28px 24px',
              boxShadow: plan.accent ? '0 0 40px var(--aglow)' : 'none',
              position: 'relative',
            }}>
              {plan.accent && (
                <div style={{
                  position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--accent)', color: '#fff', borderRadius: 20,
                  fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 11,
                  padding: '3px 12px',
                }}>
                  Most Popular
                </div>
              )}
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, color: 'var(--text)', marginBottom: 6 }}>
                {plan.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 20 }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 36, color: 'var(--text)' }}>{plan.price}</span>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: 'var(--text3)' }}>{plan.period}</span>
              </div>
              <ul style={{ listStyle: 'none', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map((feat, j) => (
                  <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-heading)', fontSize: 13, color: 'var(--text2)' }}>
                    <Check size={14} color="var(--green)" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link href={plan.href} style={{
                display: 'block', textAlign: 'center', textDecoration: 'none',
                fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14,
                padding: '11px', borderRadius: 9,
                background: plan.accent ? 'var(--accent)' : 'var(--surface2)',
                color: plan.accent ? '#fff' : 'var(--text)',
                border: `1px solid ${plan.accent ? 'var(--accent)' : 'var(--border2)'}`,
              }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)', padding: '24px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        color: 'var(--text3)', fontFamily: 'var(--font-heading)', fontSize: 12,
      }}>
        <span>© 2026 Cella. All rights reserved.</span>
        <span>Built with ❤️ and AI</span>
      </footer>
    </div>
  )
}
