'use client'
import { useRef, useEffect, useState } from 'react'
import { useAI } from '@/hooks/useAI'
import { MODELS, AI_SUGGESTIONS } from '@/lib/openrouter'
import { SheetData, CellWrite, AIModel } from '@/types'
import { X, Send, RefreshCw, ChevronDown, Sparkles, Bot, User, CheckCircle } from 'lucide-react'

interface AIPanelProps {
  sheetData: SheetData
  sheetName: string
  selectedCell: string
  onCellWrites: (writes: CellWrite[]) => void
  userApiKey?: string
  userPlan?: string
  onClose?: () => void
}

export default function AIPanel({
  sheetData,
  sheetName,
  selectedCell,
  onCellWrites,
  userApiKey,
  userPlan = 'free',
  onClose,
}: AIPanelProps) {
  const { messages, input, setInput, loading, error, model, setModel, sendMessage, clearHistory, retryLast } = useAI({
    sheetData,
    sheetName,
    selectedCell,
    onCellWrites,
    userApiKey,
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showModelMenu, setShowModelMenu] = useState(false)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const currentModel = MODELS.find(m => m.id === model) || MODELS[1]
  const availableModels = MODELS.filter(m => {
    if (m.tier === 'team') return userPlan === 'team'
    if (m.tier === 'pro') return userPlan === 'pro' || userPlan === 'team'
    return true
  })

  return (
    <div style={{
      width: 320,
      background: '#0d0f14',
      borderLeft: '1px solid var(--border2)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 7,
            background: 'var(--aglow)', border: '1px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={13} color="var(--accent2)" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>
              SheetAI
            </div>
            <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-heading)' }}>
              {selectedCell} · {sheetName}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text3)', padding: 5, borderRadius: 6,
                transition: 'color 0.15s',
              }}
              title="Clear conversation"
            >
              <RefreshCw size={14} />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text3)', padding: 5, borderRadius: 6,
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Model selector */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowModelMenu(m => !m)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--surface)', border: '1px solid var(--border2)',
              borderRadius: 7, padding: '6px 10px', cursor: 'pointer', color: 'var(--text)',
              fontFamily: 'var(--font-heading)', fontSize: 12, fontWeight: 600,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{currentModel.tag}</span>
              <span>{currentModel.label}</span>
            </span>
            <ChevronDown size={12} color="var(--text3)" />
          </button>
          {showModelMenu && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
              background: 'var(--surface2)', border: '1px solid var(--border2)',
              borderRadius: 8, zIndex: 50, overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}>
              {availableModels.map(m => (
                <button
                  key={m.id}
                  onClick={() => { setModel(m.id); setShowModelMenu(false) }}
                  style={{
                    width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', padding: '8px 12px', border: 'none',
                    background: model === m.id ? 'var(--aglow)' : 'transparent',
                    cursor: 'pointer', color: model === m.id ? 'var(--accent2)' : 'var(--text)',
                    fontFamily: 'var(--font-heading)', fontSize: 12,
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{m.tag}</span>
                    <span>{m.label}</span>
                  </span>
                  <TierBadge tier={m.tier} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.length === 0 && (
          <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{
              textAlign: 'center', padding: '20px 10px',
              color: 'var(--text3)', fontFamily: 'var(--font-heading)', fontSize: 12,
            }}>
              <Bot size={28} color="var(--accent)" style={{ margin: '0 auto 8px', opacity: 0.6 }} />
              Ask me anything about your spreadsheet
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {AI_SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s.prompt)}
                  style={{
                    textAlign: 'left', background: 'var(--surface2)',
                    border: '1px solid var(--border2)', borderRadius: 8,
                    padding: '7px 10px', cursor: 'pointer', color: 'var(--text2)',
                    fontFamily: 'var(--font-heading)', fontSize: 11, fontWeight: 600,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--accent)'
                    e.currentTarget.style.color = 'var(--text)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border2)'
                    e.currentTarget.style.color = 'var(--text2)'
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className="animate-fade-up"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4,
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: 5,
                background: msg.role === 'user' ? 'var(--aglow)' : 'var(--surface3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${msg.role === 'user' ? 'var(--accent)' : 'var(--border2)'}`,
              }}>
                {msg.role === 'user'
                  ? <User size={11} color="var(--accent2)" />
                  : <Bot size={11} color="var(--text2)" />
                }
              </div>
              <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-heading)' }}>
                {msg.role === 'user' ? 'You' : 'SheetAI'}
              </span>
            </div>

            <div style={{
              maxWidth: '90%',
              background: msg.role === 'user' ? 'var(--aglow)' : 'var(--surface2)',
              border: `1px solid ${msg.role === 'user' ? 'var(--accent)' : 'var(--border2)'}`,
              borderRadius: 10,
              padding: '8px 11px',
              color: 'var(--text)',
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
            </div>

            {msg.writes && msg.writes.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 5, maxWidth: '90%' }}>
                {msg.writes.slice(0, 6).map((w, j) => (
                  <span key={j} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    background: 'rgba(0, 206, 201, 0.12)', border: '1px solid rgba(0,206,201,0.3)',
                    color: 'var(--green)', borderRadius: 5, padding: '2px 6px',
                    fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 500,
                  }}>
                    <CheckCircle size={9} />
                    {w.cell}
                  </span>
                ))}
                {msg.writes.length > 6 && (
                  <span style={{
                    fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-heading)',
                    padding: '2px 6px',
                  }}>
                    +{msg.writes.length - 6} more
                  </span>
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 20, height: 20, borderRadius: 5,
              background: 'var(--surface3)', border: '1px solid var(--border2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bot size={11} color="var(--text2)" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text3)', fontFamily: 'var(--font-heading)', fontSize: 11 }}>
              <LoadingDots />
              Thinking...
            </div>
          </div>
        )}

        {error && (
          <div className="animate-fade-up" style={{
            background: 'rgba(255,118,117,0.08)', border: '1px solid rgba(255,118,117,0.3)',
            borderRadius: 8, padding: '10px 12px',
          }}>
            <div style={{ color: 'var(--red)', fontFamily: 'var(--font-heading)', fontSize: 12, marginBottom: 6 }}>
              {error}
            </div>
            <button
              onClick={retryLast}
              style={{
                fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 11,
                color: 'var(--red)', background: 'none', border: '1px solid rgba(255,118,117,0.4)',
                borderRadius: 5, padding: '3px 8px', cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '10px 12px',
        borderTop: '1px solid var(--border)',
        flexShrink: 0,
        background: '#0d0f14',
      }}>
        <div style={{
          display: 'flex', gap: 8, alignItems: 'flex-end',
          background: 'var(--input-bg)', border: '1px solid var(--border2)',
          borderRadius: 10, padding: '6px 8px',
          transition: 'border-color 0.15s',
        }}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your data..."
            rows={1}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 12,
              resize: 'none', lineHeight: 1.5, padding: '2px 0',
              maxHeight: 100, overflowY: 'auto',
            }}
            onInput={e => {
              const t = e.currentTarget
              t.style.height = 'auto'
              t.style.height = `${Math.min(t.scrollHeight, 100)}px`
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              width: 28, height: 28, borderRadius: 7, border: 'none', cursor: 'pointer',
              background: input.trim() && !loading ? 'var(--accent)' : 'var(--surface3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s', flexShrink: 0,
            }}
          >
            <Send size={13} color={input.trim() && !loading ? '#fff' : 'var(--text3)'} />
          </button>
        </div>
        <div style={{ marginTop: 5, textAlign: 'center', fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-heading)' }}>
          Enter to send · Shift+Enter for new line
        </div>
      </div>
    </div>
  )
}

function TierBadge({ tier }: { tier: AIModel['tier'] }) {
  const colors: Record<AIModel['tier'], { bg: string; color: string; label: string }> = {
    free:  { bg: 'rgba(0,206,201,0.12)', color: 'var(--green)', label: 'free' },
    pro:   { bg: 'var(--aglow)', color: 'var(--accent2)', label: 'pro' },
    team:  { bg: 'rgba(253,203,110,0.12)', color: 'var(--amber)', label: 'team' },
  }
  const c = colors[tier]
  return (
    <span style={{
      background: c.bg, color: c.color, fontFamily: 'var(--font-heading)',
      fontWeight: 700, fontSize: 9, padding: '1px 5px', borderRadius: 4,
      textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
      {c.label}
    </span>
  )
}

function LoadingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: 3 }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 5, height: 5, borderRadius: '50%',
          background: 'var(--accent2)',
          animation: 'pulseDot 1.2s ease-in-out infinite',
          animationDelay: `${i * 0.2}s`,
          display: 'inline-block',
        }} />
      ))}
    </span>
  )
}
