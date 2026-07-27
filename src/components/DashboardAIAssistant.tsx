import React, { useState, useEffect } from 'react'
import { Sparkles, Send, RefreshCw, Building2, ShieldAlert, Trophy, BarChart3, AlertTriangle, Lightbulb } from 'lucide-react'
import { type Home } from '@/types/home'
import { askWattieAIBrain } from '@/utils/WattieAIBrain'
import { useHomes } from '@/hooks/useHomes'

interface DashboardAIAssistantProps {
  homes: Home[]
}

export function DashboardAIAssistant({ homes }: DashboardAIAssistantProps) {
  const { removeApplianceByName } = useHomes()

  const buildInitialText = (hList: Home[]) => {
    if (hList.length === 0) return '💡 Wattie AI Canlı Analiz: Konut verileri yükleniyor...'

    const totalBill = hList.reduce((acc, h) => acc + h.billingAmountTry, 0)
    const breachHomes = hList.filter((h) => h.quotaUsagePercent >= 100)
    const topBreach = [...hList].sort((a, b) => b.quotaUsagePercent - a.quotaUsagePercent)[0]

    const formattedBill = Math.round(totalBill).toLocaleString('tr-TR')

    let text = `💡 Wattie AI Canlı Sistem Analizi: Sistemde kayıtlı ${hList.length} konut aktif olarak izleniyor. Toplam aylık tahmini fatura: ${formattedBill} ₺.`

    if (breachHomes.length > 0 && topBreach) {
      text += ` ${breachHomes.length} konutta kota aşımı tespit edildi. En yüksek aşım: ${topBreach.name} (%${topBreach.quotaUsagePercent.toFixed(1)}).`
    }

    text += ' Hızlı soru butonlarından birini seçebilir veya alt alandan serbest soru sorabilirsiniz.'
    return text
  }

  const [displayedText, setDisplayedText] = useState(() => buildInitialText(homes))
  const [query, setQuery] = useState('')
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    if (homes.length > 0) {
      setDisplayedText(buildInitialText(homes))
    }
  }, [homes.length])

  const generateAIResponse = (userQuery?: string) => {
    const inputStr = (userQuery || query).trim()
    if (!inputStr && !userQuery) return

    setAnalyzing(true)
    setTimeout(() => {
      const response = askWattieAIBrain(inputStr, homes, undefined, removeApplianceByName)
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

  const totalBill = homes.reduce((acc, h) => acc + h.billingAmountTry, 0)
  const breachCount = homes.filter((h) => h.quotaUsagePercent >= 100).length
  const topBreachHome = [...homes].sort((a, b) => b.quotaUsagePercent - a.quotaUsagePercent)[0]

  return (
    <div
      style={{
        margin: '1.25rem 0',
        background: 'var(--color-surface-1)',
        border: '1px solid var(--color-hairline)',
        borderLeft: '4px solid var(--color-primary)',
        padding: '1.25rem',
        position: 'relative',
        boxSizing: 'border-box',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Background Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          left: '-20px',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'rgba(15, 98, 254, 0.12)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }}
      />

      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          borderBottom: '1px solid var(--color-hairline)',
          paddingBottom: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Sparkles size={18} color="var(--color-primary)" />
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--color-ink)',
              letterSpacing: '0.04em',
            }}
          >
            WATTIE AI 5.0 ENERJİ ASİSTANI
          </span>
          <span
            style={{
              fontSize: '0.68rem',
              background: 'rgba(36, 161, 72, 0.15)',
              color: '#24a148',
              border: '1px solid rgba(36, 161, 72, 0.3)',
              padding: '2px 8px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#24a148' }} />
            Canlı Sistem Analizi
          </span>
        </div>

        <button
          type="button"
          onClick={() => setDisplayedText(buildInitialText(homes))}
          disabled={analyzing}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-hairline)',
            color: 'var(--color-ink-muted)',
            fontSize: '0.72rem',
            cursor: 'pointer',
            padding: '4px 10px',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
          title="Sistem analizini yenile"
        >
          <RefreshCw size={12} className={analyzing ? 'spin' : ''} />
          {analyzing ? 'Analiz Yapılıyor...' : 'Sıfırla / Yenile'}
        </button>
      </div>

      {/* Quick Metrics Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.75rem',
        }}
      >
        <div style={{ background: 'var(--color-surface-2)', padding: '0.65rem 0.85rem', border: '1px solid var(--color-hairline)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Building2 size={16} color="var(--color-primary)" />
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-ink-muted)', fontWeight: 600 }}>TOPLAM KONUT</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-ink)' }}>{homes.length} Aktif Konut</div>
          </div>
        </div>

        <div style={{ background: 'var(--color-surface-2)', padding: '0.65rem 0.85rem', border: '1px solid var(--color-hairline)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <BarChart3 size={16} color="var(--color-semantic-success)" />
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-ink-muted)', fontWeight: 600 }}>TOPLAM AYLIK FATURA</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-ink)', fontFamily: 'monospace' }}>{Math.round(totalBill).toLocaleString('tr-TR')} ₺</div>
          </div>
        </div>

        <div style={{ background: 'var(--color-surface-2)', padding: '0.65rem 0.85rem', border: '1px solid var(--color-hairline)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <AlertTriangle size={16} color={breachCount > 0 ? 'var(--color-semantic-error)' : 'var(--color-semantic-success)'} />
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-ink-muted)', fontWeight: 600 }}>KOTA İHLALİ</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: breachCount > 0 ? 'var(--color-semantic-error)' : 'var(--color-semantic-success)' }}>
              {breachCount > 0 ? `${breachCount} Konutta Aşım (${topBreachHome?.name || ''})` : 'Tüm Konutlar Normal'}
            </div>
          </div>
        </div>
      </div>

      {/* Main AI Response Box */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(15, 98, 254, 0.08) 0%, rgba(105, 41, 196, 0.05) 100%)',
          border: '1px solid rgba(15, 98, 254, 0.25)',
          padding: '1rem 1.1rem',
          boxSizing: 'border-box',
          width: '100%',
          position: 'relative',
        }}
      >
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--color-ink)',
            lineHeight: 1.6,
            margin: 0,
            fontWeight: 400,
          }}
        >
          {analyzing ? '⏳ Wattie AI sistemdeki tüm konut ve telemetri verilerini analiz ediyor...' : displayedText}
        </p>
      </div>

      {/* Interactive Action Chips */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Hızlı Analiz Soruları:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {[
            { label: '🛡️ En Çok Anomaliye Sahip Konutlar', q: 'en çok anomaliye sahip konutları listele', icon: ShieldAlert },
            { label: '🏆 En Çok Faturaya Sahip 3 Konut', q: 'en çok fatura tutarına sahip 3 konutu listele', icon: Trophy },
            { label: '📊 Çekmeköy vs Kadıköy Karşılaştır', q: 'Çekmeköy ile Kadıköy maliyetlerini karşılaştır', icon: BarChart3 },
            { label: '⚠️ En Yüksek Kota Aşımı', q: 'en yüksek kota aşımı yapan ev', icon: AlertTriangle },
            { label: '💡 En Ekonomik Konut', q: 'en ekonomik tasarruflu konut', icon: Lightbulb },
          ].map((chip) => (
            <button
              key={chip.q}
              type="button"
              onClick={() => generateAIResponse(chip.q)}
              disabled={analyzing}
              style={{
                fontSize: '0.73rem',
                fontWeight: 500,
                padding: '5px 10px',
                background: 'var(--color-surface-2)',
                color: 'var(--color-ink)',
                border: '1px solid var(--color-hairline)',
                borderRadius: '0px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-primary-subtle)'
                e.currentTarget.style.borderColor = 'var(--color-primary)'
                e.currentTarget.style.color = 'var(--color-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-surface-2)'
                e.currentTarget.style.borderColor = 'var(--color-hairline)'
                e.currentTarget.style.color = 'var(--color-ink)'
              }}
            >
              <chip.icon size={13} />
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ask AI Input Field */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-hairline)',
          padding: '6px 12px',
          width: '100%',
          boxSizing: 'border-box',
          transition: 'all 0.2s',
        }}
      >
        <Building2 size={16} color="var(--color-primary)" style={{ flexShrink: 0 }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="WATTIE AI'a tüm konutlar hakkında soru sorun... (Örn: Depo Tuzla ne durumda?)"
          disabled={analyzing}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: 'var(--color-ink)',
            fontSize: '0.82rem',
            outline: 'none',
            padding: '4px 0',
            width: '100%',
          }}
        />
        <button
          type="button"
          onClick={() => generateAIResponse()}
          disabled={analyzing || !query.trim()}
          style={{
            background: 'var(--color-primary)',
            color: '#ffffff',
            border: 'none',
            padding: '6px 14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: analyzing || !query.trim() ? 0.5 : 1,
            flexShrink: 0,
            fontSize: '0.78rem',
            fontWeight: 600,
            gap: '6px',
            transition: 'all 0.2s',
          }}
        >
          <Send size={13} />
          Sor
        </button>
      </div>
    </div>
  )
}
