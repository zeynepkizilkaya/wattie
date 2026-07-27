import React, { useState } from 'react'
import { Activity, ShieldCheck, Heart, Thermometer, ChevronDown, ChevronUp } from 'lucide-react'

interface HealthCardProps {
  healthScore: number
  temperature?: number
  anomalies: string[]
  maintenancePrediction: string
}

export function HealthCard({
  healthScore,
  temperature,
  anomalies,
  maintenancePrediction
}: HealthCardProps) {
  const [isOpen, setIsOpen] = useState(true)
  const hasAnomalies = anomalies.length > 0
  const healthColor = healthScore > 90 ? 'var(--color-semantic-success)' : healthScore > 75 ? 'var(--color-semantic-warning)' : 'var(--color-semantic-error)'

  return (
    <div style={{
      marginTop: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: isOpen ? '0.85rem' : '0rem',
      background: 'var(--color-surface-2)',
      border: '1px solid var(--color-hairline)',
      borderRadius: '0px',
      padding: '1.1rem'
    }}>
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsOpen(!isOpen) } }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
          fontSize: '0.82rem',
          fontWeight: 600,
          color: 'var(--color-ink)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          borderBottom: isOpen ? '1px solid var(--color-hairline)' : 'none',
          paddingBottom: isOpen ? '0.5rem' : '0',
          marginBottom: isOpen ? '0.2rem' : '0'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={16} color="var(--color-primary)" />
          <span>CİHAZ SAĞLIĞI & TEŞHİS</span>
        </div>
        {isOpen ? <ChevronUp size={16} color="var(--color-ink-muted)" /> : <ChevronDown size={16} color="var(--color-ink-muted)" />}
      </div>

      {isOpen && (
        <>

      <div style={{
        display: 'flex',
        gap: '0.75rem',
        flexWrap: 'wrap'
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'var(--color-surface-1)',
          padding: '0.65rem 0.85rem',
          borderRadius: '0px',
          border: '1px solid var(--color-hairline)'
        }}>
          <Heart size={18} color={healthColor} />
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-ink-muted)', fontWeight: 600 }}>SAĞLIK SKORU</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: healthColor }}>%{healthScore}</div>
          </div>
        </div>

        {temperature !== undefined && (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'var(--color-surface-1)',
            padding: '0.65rem 0.85rem',
            borderRadius: '0px',
            border: '1px solid var(--color-hairline)'
          }}>
            <Thermometer size={18} color="var(--color-semantic-error)" />
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-ink-muted)', fontWeight: 600 }}>SICAKLIK</div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-semantic-error)' }}>{temperature}°C</div>
            </div>
          </div>
        )}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.65rem',
        fontSize: '0.78rem',
        color: 'var(--color-ink)'
      }}>
        <ShieldCheck size={16} color={hasAnomalies ? 'var(--color-semantic-error)' : 'var(--color-semantic-success)'} style={{ marginTop: '0.08rem' }} />
        <div>
          <span style={{ color: 'var(--color-ink-muted)', fontWeight: 400 }}>Durum: </span>
          {hasAnomalies ? (
            <span style={{ color: 'var(--color-semantic-error)', fontWeight: 600 }}>
              {anomalies.join(', ')}
            </span>
          ) : (
            <span style={{ color: 'var(--color-semantic-success)', fontWeight: 600 }}>Normal (Anomali Yok)</span>
          )}
        </div>
      </div>

      <div style={{
        fontSize: '0.75rem',
        color: 'var(--color-ink-muted)',
        backgroundColor: 'var(--color-surface-1)',
        padding: '0.65rem 0.85rem',
        borderRadius: '0px',
        borderLeft: hasAnomalies ? '3px solid var(--color-semantic-error)' : '3px solid var(--color-primary)',
        lineHeight: 1.4
      }}>
        <strong style={{ color: 'var(--color-ink)', fontSize: '0.7rem', display: 'block', marginBottom: '0.15rem' }}>TAHMİNİ BAKIM BİLGİSİ</strong>
        {maintenancePrediction}
      </div>
    </>
    )}
  </div>
)
}
