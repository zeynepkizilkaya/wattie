import React, { useState, useEffect } from 'react'
import { Sparkles, Send, RefreshCw, Bot } from 'lucide-react'
import { askWattieAIBrain } from '@/utils/WattieAIBrain'
import { useHomes } from '@/hooks/useHomes'

interface AIRecommendationProps {
  recommendation?: string
  deviceName?: string
  currentWatt?: number
  safeLimit?: number
}

export function AIRecommendation({
  recommendation,
  deviceName = 'Cihaz',
  currentWatt,
  safeLimit,
}: AIRecommendationProps) {
  const { homes } = useHomes()
  const defaultText =
    recommendation ||
    `💡 ${deviceName} çalışma performansı ve tüketim değerleri WATTIE AI tarafından 7/24 analiz edilmektedir. Optimal tasarruf modu aktif.`

  const [displayedText, setDisplayedText] = useState(defaultText)
  const [query, setQuery] = useState('')
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    const text =
      recommendation ||
      `💡 ${deviceName} çalışma performansı ve tüketim değerleri WATTIE AI tarafından 7/24 analiz edilmektedir. Optimal tasarruf modu aktif.`
    setDisplayedText(text)
  }, [recommendation, deviceName])

  const generateAIResponse = (userQuery?: string) => {
    const inputStr = (userQuery || query).trim()
    if (!inputStr && !userQuery) return

    setAnalyzing(true)
    setTimeout(() => {
      const response = askWattieAIBrain(inputStr, homes, {
        name: deviceName,
        currentWatt: currentWatt || 150,
        safeLimit: safeLimit || 250,
      })
      setDisplayedText(response)
      setAnalyzing(false)
      setQuery('')
    }, 300)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim() && !analyzing) {
      e.preventDefault()
      generateAIResponse()
    }
  }

  return (
    <div
      style={{
        marginTop: '1rem',
        marginBottom: '0.5rem',
        background: 'var(--color-surface-2, #262626)',
        border: '1px solid var(--color-hairline, #393939)',
        borderRadius: '0px',
        padding: '0.85rem',
        position: 'relative',
        boxSizing: 'border-box',
        flexShrink: 0,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-15px',
          left: '-15px',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: 'rgba(15, 98, 254, 0.15)',
          filter: 'blur(15px)',
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sparkles size={15} color="var(--color-primary, #0f62fe)" />
          <span
            style={{
              fontSize: '0.76rem',
              fontWeight: 700,
              color: 'var(--color-primary, #0f62fe)',
              letterSpacing: '0.04em',
              textTransform: 'none',
            }}
          >
            ✨ WATTIE AI ASISTANI
          </span>
        </div>

        <button
          type="button"
          onClick={() => generateAIResponse('tasarruf')}
          disabled={analyzing}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: 'none',
            border: 'none',
            color: 'var(--color-ink-muted)',
            fontSize: '0.7rem',
            cursor: 'pointer',
            padding: '2px 4px',
            borderRadius: '0px',
          }}
          title="Tüketim analizini yenile"
        >
          <RefreshCw size={11} className={analyzing ? 'spin' : ''} />
          {analyzing ? 'Yenileniyor...' : 'Yenile'}
        </button>
      </div>

      {/* Recommendation Text Box */}
      <div
        style={{
          background: 'var(--color-surface-1, #161616)',
          border: '1px solid var(--color-hairline, #393939)',
          padding: '8px 10px',
          minHeight: '42px',
          display: 'flex',
          alignItems: 'center',
          boxSizing: 'border-box',
          width: '100%',
        }}
      >
        <p
          style={{
            fontSize: '0.78rem',
            color: 'var(--color-ink)',
            lineHeight: 1.45,
            margin: 0,
            fontWeight: 400,
            wordBreak: 'break-word',
          }}
        >
          {analyzing ? '⏳ Wattie AI akıllı verileri analiz ediyor...' : displayedText}
        </p>
      </div>

      {/* Action Chips */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '5px',
        }}
      >
        {[
          { label: '💡 Tasarruf', q: 'tasarruf' },
          { label: '📊 Fatura', q: 'fatura' },
          { label: '🛡️ Anomali', q: 'anomali' },
        ].map((chip) => (
          <button
            key={chip.q}
            type="button"
            onClick={() => generateAIResponse(chip.q)}
            disabled={analyzing}
            style={{
              fontSize: '0.68rem',
              fontWeight: 500,
              padding: '2px 7px',
              background: 'var(--color-surface-1)',
              color: 'var(--color-ink)',
              border: '1px solid var(--color-hairline)',
              borderRadius: '0px',
              cursor: 'pointer',
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Ask AI Input Field */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          background: 'var(--color-surface-1, #161616)',
          border: '1px solid var(--color-hairline, #393939)',
          padding: '3px 6px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <Bot size={13} color="var(--color-primary, #0f62fe)" style={{ flexShrink: 0 }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="WATTIE AI'a soru sor..."
          disabled={analyzing}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: 'var(--color-ink)',
            fontSize: '0.75rem',
            outline: 'none',
            padding: '3px 0',
            width: '100%',
          }}
        />
        <button
          type="button"
          onClick={() => generateAIResponse()}
          disabled={analyzing || !query.trim()}
          style={{
            background: 'var(--color-primary, #0f62fe)',
            color: '#ffffff',
            border: 'none',
            padding: '3px 7px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: analyzing || !query.trim() ? 0.5 : 1,
            flexShrink: 0,
          }}
          title="Gönder"
        >
          <Send size={11} />
        </button>
      </div>
    </div>
  )
}
