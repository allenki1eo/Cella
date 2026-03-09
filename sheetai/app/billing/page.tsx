'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AppNav from '@/components/layout/AppNav'
import { Profile } from '@/types'
import { Check, Zap, Users, AlertCircle } from 'lucide-react'

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    price: '$0',
    period: '/month',
    color: 'var(--text2)',
    features: [
      '50 AI requests/month',
      '5 workbooks',
      'Free AI models (Gemini, Llama, etc.)',
      'Core spreadsheet features',
      'Community support',
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '$12',
    period: '/month',
    color: 'var(--accent2)',
    icon: <Zap size={16} />,
    features: [
      '1,000 AI requests/month',
      'Unlimited workbooks',
      'Claude Sonnet 4.5 access',
      'Priority support',
      'Advanced charts',
    ],
    popular: true,
  },
  {
    key: 'team',
    name: 'Team',
    price: '$39',
    period: '/month',
    color: 'var(--amber)',
    icon: <Users size={16} />,
    features: [
      'Unlimited AI requests',
      'Collaboration features',
      'Claude Opus 4.6 access',
      'Admin dashboard',
      'Dedicated support',
    ],
  },
]

function BillingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setSuccessMsg('Subscription activated! Enjoy your new plan.')
    }
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof)
      setLoading(false)
    }
    load()
  }, [router, searchParams, supabase])

  const handleUpgrade = async (plan: string) => {
    if (plan === 'free') return
    setUpgrading(plan)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setUpgrading(null)
  }

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

  const usagePercent = Math.min(100, Math.round(
    ((profile?.ai_requests_used || 0) / (profile?.plan === 'pro' ? 1000 : profile?.plan === 'team' ? 999999 : 50)) * 100
  ))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <AppNav profile={profile} />

      <main style={{ flex: 1, padding: '40px', maxWidth: 1000, width: '100%', margin: '0 auto' }}>
        {successMsg && (
          <div className="animate-fade-up" style={{
            background: 'rgba(0,206,201,0.08)', border: '1px solid rgba(0,206,201,0.3)',
            borderRadius: 10, padding: '14px 18px', marginBottom: 28,
            display: 'flex', alignItems: 'center', gap: 10,
            fontFamily: 'var(--font-heading)', fontSize: 14, color: 'var(--green)',
          }}>
            <Check size={16} /> {successMsg}
          </div>
        )}

        <div className="animate-fade-up" style={{ marginBottom: 36 }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 26, color: 'var(--text)', marginBottom: 6 }}>
            Plans & Billing
          </h1>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: 'var(--text2)' }}>
            Current plan: <strong style={{ color: 'var(--accent2)' }}>{profile?.plan?.charAt(0).toUpperCase()}{profile?.plan?.slice(1)}</strong>
          </p>
        </div>

        {/* Usage */}
        <div className="animate-fade-up stagger-1" style={{
          background: 'var(--surface)', border: '1px solid var(--border2)',
          borderRadius: 12, padding: '20px 24px', marginBottom: 32,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
              AI Requests this month
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text2)' }}>
              {profile?.ai_requests_used || 0} / {profile?.plan === 'team' ? '∞' : profile?.plan === 'pro' ? '1,000' : '50'}
            </div>
          </div>
          <div style={{ height: 8, background: 'var(--surface3)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 4,
              width: `${usagePercent}%`,
              background: usagePercent > 80 ? 'var(--red)' : usagePercent > 50 ? 'var(--amber)' : 'var(--accent)',
              transition: 'width 0.5s ease',
            }} />
          </div>
          {usagePercent > 80 && (
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-heading)', fontSize: 12, color: 'var(--amber)' }}>
              <AlertCircle size={13} /> Running low on requests. Consider upgrading.
            </div>
          )}
        </div>

        {/* Plans */}
        <div className="animate-fade-up stagger-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {PLANS.map((plan) => {
            const isCurrent = profile?.plan === plan.key
            const isUpgrading = upgrading === plan.key

            return (
              <div key={plan.key} style={{
                background: 'var(--surface)', border: `1px solid ${plan.popular ? 'var(--accent)' : 'var(--border2)'}`,
                borderRadius: 14, padding: '26px 22px', position: 'relative',
                boxShadow: plan.popular ? '0 0 30px var(--aglow)' : 'none',
              }}>
                {plan.popular && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--accent)', color: '#fff', borderRadius: 20,
                    fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 11,
                    padding: '3px 12px',
                  }}>
                    Most Popular
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  {plan.icon && (
                    <div style={{
                      width: 28, height: 28, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `${plan.color}22`, color: plan.color,
                    }}>
                      {plan.icon}
                    </div>
                  )}
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, color: 'var(--text)' }}>
                    {plan.name}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 20 }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 34, color: 'var(--text)' }}>{plan.price}</span>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: 'var(--text3)' }}>{plan.period}</span>
                </div>

                <ul style={{ listStyle: 'none', marginBottom: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {plan.features.map((feat, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-heading)', fontSize: 13, color: 'var(--text2)' }}>
                      <Check size={14} color="var(--green)" style={{ flexShrink: 0 }} />
                      {feat}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div style={{
                    textAlign: 'center', padding: '11px',
                    fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13,
                    color: 'var(--accent2)', background: 'var(--aglow)',
                    borderRadius: 9, border: '1px solid var(--accent)',
                  }}>
                    Current plan
                  </div>
                ) : plan.key === 'free' ? null : (
                  <button
                    onClick={() => handleUpgrade(plan.key)}
                    disabled={!!upgrading}
                    style={{
                      width: '100%', padding: '11px', borderRadius: 9,
                      outline: `1px solid ${plan.popular ? 'var(--accent)' : 'var(--border2)'}`,
                      background: plan.popular ? 'var(--accent)' : 'var(--surface2)',
                      color: plan.popular ? '#fff' : 'var(--text)',
                      fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13,
                      cursor: upgrading ? 'not-allowed' : 'pointer', opacity: upgrading ? 0.7 : 1,
                      border: 'none',
                    } as React.CSSProperties}
                  >
                    {isUpgrading ? 'Redirecting...' : `Upgrade to ${plan.name}`}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={null}>
      <BillingContent />
    </Suspense>
  )
}
