import React from 'react'
import { motion } from 'framer-motion'
import { X, LineChart, FileText, ChevronDown, ChevronUp, Sliders, Power, Clock, Sparkles } from 'lucide-react'
import { MOCK_TELEMETRY } from './mockData'
import { DeviceHeader } from './DeviceHeader'
import { EnergyStats } from './EnergyStats'
import { AIRecommendation } from './AIRecommendation'
import { HealthCard } from './HealthCard'
import { ConsumptionChart } from './ConsumptionChart'

interface DeviceInfoPanelProps {
  deviceId: string | null
  onClose: () => void
  deviceState: any
  onPowerToggle: (deviceId: string, status: 'online' | 'offline') => void
  embedded?: boolean
}

export function DeviceInfoPanel({ deviceId, onClose, deviceState, onPowerToggle, embedded = false }: DeviceInfoPanelProps) {
  const [isControlsOpen, setIsControlsOpen] = React.useState(true)
  const [timerPreset, setTimerPreset] = React.useState('Off')
  const [timerSecondsLeft, setTimerSecondsLeft] = React.useState<number | null>(null)
  const prevDeviceIdRef = React.useRef(deviceId)

  React.useEffect(() => {
    if (prevDeviceIdRef.current !== deviceId) {
      setTimerPreset('Off')
      setTimerSecondsLeft(null)
      setIsControlsOpen(true)
      prevDeviceIdRef.current = deviceId
    }
  }, [deviceId])

  React.useEffect(() => {
    if (timerSecondsLeft === null || !deviceId) return

    if (timerSecondsLeft <= 0) {
      onPowerToggle(deviceId, 'offline')
      setTimerPreset('Off')
      setTimerSecondsLeft(null)
      return
    }

    const interval = setInterval(() => {
      setTimerSecondsLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [timerSecondsLeft, deviceId, onPowerToggle])

  const telemetry = deviceState

  if (!deviceId || !telemetry) return null

  const powerOn = telemetry.status === 'online'

  const handleSetTimer = (preset: string) => {
    setTimerPreset(preset)
    if (preset === 'Off' || preset === 'Kapalı') {
      setTimerSecondsLeft(null)
      return
    }

    const secondsMap: Record<string, number> = {
      '15m': 15 * 60,
      '30m': 30 * 60,
      '1h': 60 * 60,
      '2h': 120 * 60,
      '15 dk': 15 * 60,
      '30 dk': 30 * 60,
      '1 saat': 60 * 60,
      '2 saat': 120 * 60
    }
    setTimerSecondsLeft(secondsMap[preset] || 15 * 60)
  }

  const liveHistoryData = React.useMemo(() => {
    const currentW = powerOn ? (telemetry.currentPower || 0) : 0
    if (!powerOn || currentW === 0) {
      return [
        { time: '08:00', value: 0 },
        { time: '10:00', value: 0 },
        { time: '12:00', value: 0 },
        { time: '14:00', value: 0 },
        { time: '16:00', value: 0 },
        { time: '18:00', value: 0 },
        { time: '20:00', value: 0 }
      ]
    }
    return [
      { time: '08:00', value: Math.round(currentW * 0.88) },
      { time: '10:00', value: Math.round(currentW * 0.94) },
      { time: '12:00', value: Math.round(currentW * 1.08) },
      { time: '14:00', value: Math.round(currentW * 0.98) },
      { time: '16:00', value: Math.round(currentW * 0.95) },
      { time: '18:00', value: Math.round(currentW * 1.02) },
      { time: '20:00', value: currentW }
    ]
  }, [powerOn, telemetry.currentPower])

  const [activeModal, setActiveModal] = React.useState<'report' | 'history' | null>(null)

  React.useEffect(() => {
    if (activeModal) {
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
    } else {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [activeModal])

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: embedded ? 0.96 : 1, x: embedded ? 0 : '100%' }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: embedded ? 0.96 : 1, x: embedded ? 0 : '100%' }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{
          position: embedded ? 'relative' : 'fixed',
          top: embedded ? undefined : 0,
          right: embedded ? undefined : 0,
          width: embedded ? '100%' : '320px',
          maxWidth: '100%',
          height: embedded ? '540px' : '100vh',
          maxHeight: embedded ? '540px' : '100vh',
          background: 'var(--color-surface-1)',
          border: '1px solid var(--color-hairline)',
          borderRadius: '0px',
          zIndex: embedded ? 1 : 999,
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          overflowX: 'hidden'
        }}
      >
        {/* Scrollable Container */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '1.25rem 1.25rem 3rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          boxSizing: 'border-box'
        }}>
          {/* Header section */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '0.5rem',
            position: 'relative',
            zIndex: 10
          }}>
            <button
              onClick={onClose}
              aria-label="Paneli kapat"
              style={{
                background: 'none',
                border: '1px solid var(--color-hairline)',
                color: 'var(--color-ink-muted)',
                width: '32px',
                height: '32px',
                borderRadius: '0px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-surface-2)'
                e.currentTarget.style.color = 'var(--color-ink)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none'
                e.currentTarget.style.color = 'var(--color-ink-muted)'
              }}
            >
              <X size={16} />
            </button>
          </div>

          <DeviceHeader
            name={telemetry.name}
            room={telemetry.room}
            status={telemetry.status}
            lastUpdated={telemetry.lastUpdated}
            iconName={telemetry.iconName}
          />

          <AIRecommendation
            recommendation={telemetry.aiRecommendation}
            deviceName={telemetry.name}
            currentWatt={telemetry.currentPower}
            safeLimit={telemetry.safeLimit}
          />

          <EnergyStats
            currentPower={telemetry.currentPower}
            todayConsumption={telemetry.todayConsumption}
            monthlyConsumption={telemetry.monthlyConsumption}
            estimatedCost={telemetry.estimatedCost}
            efficiencyRating={telemetry.efficiencyRating}
            peakTime={telemetry.peakTime}
          />
          {/* Collapsible Device Controls */}
          <div style={{
            marginTop: '1.25rem',
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-hairline)',
            borderRadius: '0px',
            padding: '1.1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            <div
              role="button"
              tabIndex={0}
              aria-expanded={isControlsOpen}
              onClick={() => setIsControlsOpen(!isControlsOpen)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsControlsOpen(!isControlsOpen) } }}
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
                borderBottom: isControlsOpen ? '1px solid var(--color-hairline)' : 'none',
                paddingBottom: isControlsOpen ? '0.5rem' : '0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sliders size={16} color="var(--color-semantic-warning)" />
                <span>CİHAZ KONTROLLERİ</span>
              </div>
              {isControlsOpen ? <ChevronUp size={16} color="var(--color-ink-muted)" /> : <ChevronDown size={16} color="var(--color-ink-muted)" />}
            </div>

            {isControlsOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', marginTop: '0.25rem' }}>
                {/* Power Switch */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Power size={15} color={powerOn ? 'var(--color-semantic-success)' : 'var(--color-ink-muted)'} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-ink)' }}>Güç Durumu</span>
                  </div>
                  <div style={{ display: 'flex', background: 'var(--color-surface-1)', borderRadius: '0px', padding: '2px', border: '1px solid var(--color-hairline)' }}>
                    <button
                      onClick={() => onPowerToggle(deviceId, 'online')}
                      style={{
                        border: 'none',
                        borderRadius: '0px',
                        padding: '4px 12px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: powerOn ? 'var(--color-semantic-success)' : 'transparent',
                        color: powerOn ? '#fff' : 'var(--color-ink-muted)',
                        transition: 'all 0.2s'
                      }}
                    >
                      AÇIK
                    </button>
                    <button
                      onClick={() => onPowerToggle(deviceId, 'offline')}
                      style={{
                        border: 'none',
                        borderRadius: '0px',
                        padding: '4px 12px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: !powerOn ? 'var(--color-semantic-error)' : 'transparent',
                        color: !powerOn ? '#fff' : 'var(--color-ink-muted)',
                        transition: 'all 0.2s'
                      }}
                    >
                      KAPALI
                    </button>
                  </div>
                </div>

                {/* Timer preset controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={15} color="var(--color-primary)" />
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-ink)' }}>Zamanlayıcı (Otomatik Kapanma)</span>
                    </div>
                  </div>

                  {timerSecondsLeft !== null && (
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--color-primary)',
                      background: 'var(--color-primary-subtle)',
                      padding: '4px 10px',
                      borderRadius: '0px',
                      border: '1px solid var(--color-primary)',
                      marginTop: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span>⏱️ Otomatik Kapanmaya Kalan:</span>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {Math.floor(timerSecondsLeft / 60).toString().padStart(2, '0')}:{(timerSecondsLeft % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '4px', marginTop: '0.2rem' }}>
                    {[
                      { label: 'Kapalı', value: 'Off' },
                      { label: '15 dk', value: '15m' },
                      { label: '30 dk', value: '30m' },
                      { label: '1 saat', value: '1h' },
                      { label: '2 saat', value: '2h' }
                    ].map(item => (
                      <button
                        key={item.value}
                        onClick={() => handleSetTimer(item.value)}
                        style={{
                          flex: 1,
                          background: timerPreset === item.value ? 'var(--color-primary-subtle)' : 'var(--color-surface-1)',
                          border: timerPreset === item.value ? '1px solid var(--color-primary)' : '1px solid var(--color-hairline)',
                          borderRadius: '0px',
                          padding: '6px 0',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: timerPreset === item.value ? 'var(--color-primary)' : 'var(--color-ink-muted)',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <HealthCard
            healthScore={telemetry.healthScore}
            temperature={telemetry.temperature}
            anomalies={telemetry.anomalies}
            maintenancePrediction={telemetry.maintenancePrediction}
          />

          <ConsumptionChart data={liveHistoryData} />
        </div>

        {/* Action Footer */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderTop: '1px solid var(--color-hairline)',
          background: 'var(--color-surface-2)',
          display: 'flex',
          gap: '0.75rem',
          boxSizing: 'border-box'
        }}>
          <button
            onClick={() => setActiveModal('report')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.7rem',
              borderRadius: '0px',
              border: '1px solid var(--color-hairline)',
              background: 'var(--color-surface-1)',
              color: 'var(--color-ink)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <FileText size={15} />
            Detaylı Rapor
          </button>

          <button
            onClick={() => setActiveModal('history')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.7rem',
              borderRadius: '0px',
              border: 'none',
              background: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <LineChart size={15} />
            Tüketim Geçmişi
          </button>
        </div>
      </motion.div>

      {/* DETAILED REPORT MODAL */}
      {activeModal === 'report' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }} onClick={() => setActiveModal(null)}>
          <div style={{
            background: 'var(--color-surface-1)',
            border: '1px solid var(--color-hairline)',
            borderRadius: '0px',
            width: '100%',
            maxWidth: '520px',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-hairline)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 600, color: 'var(--color-ink)' }}>
                <FileText size={18} color="var(--color-primary)" />
                <span>{telemetry.name} — Detaylı Enerji & Sağlık Raporu</span>
              </div>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: 'var(--color-ink-muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
              <div style={{ background: 'var(--color-surface-2)', padding: '0.85rem', border: '1px solid var(--color-hairline)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-ink-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Anlık Güç Yükü</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-ink)', marginTop: '4px', fontFamily: 'monospace' }}>{powerOn ? `${telemetry.currentPower} W` : '0 W (Kapalı)'}</div>
              </div>
              <div style={{ background: 'var(--color-surface-2)', padding: '0.85rem', border: '1px solid var(--color-hairline)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-ink-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Güvenli Limit Eşiği</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-ink)', marginTop: '4px', fontFamily: 'monospace' }}>{telemetry.safeLimit || 2000} W</div>
              </div>
              <div style={{ background: 'var(--color-surface-2)', padding: '0.85rem', border: '1px solid var(--color-hairline)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-ink-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Sağlık Skoru</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-semantic-success)', marginTop: '4px' }}>%{telemetry.healthScore || 98} Mükemmel</div>
              </div>
              <div style={{ background: 'var(--color-surface-2)', padding: '0.85rem', border: '1px solid var(--color-hairline)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-ink-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Çalışma Sıcaklığı</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-ink)', marginTop: '4px', fontFamily: 'monospace' }}>{telemetry.temperature || 34}°C</div>
              </div>
            </div>

            {/* AI Multi-Recommendation Section */}
            <div style={{ background: 'rgba(15, 98, 254, 0.08)', border: '1px solid rgba(15, 98, 254, 0.3)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={15} />
                <span>Wattie AI Canlı Analiz & Çoklu Öneriler</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8rem', color: 'var(--color-ink-muted)', lineHeight: 1.45 }}>
                <li>
                  <strong style={{ color: 'var(--color-ink)' }}>🕒 Gece Modu Optimizasyonu:</strong> Saat 22:00 sonrasında çalışma gücünü %50 seviyesine düşürerek yılda yaklaşık ~<strong>₺{((powerOn ? (telemetry.currentPower || 120) : 120) * 0.5 * 8 * 365 / 1000 * 2.45).toFixed(0)} TL</strong> bütçe tasarrufu sağlayabilirsiniz.
                </li>
                <li>
                  <strong style={{ color: 'var(--color-ink)' }}>🔌 Bekleme Modu (Standby) Koruması:</strong> Boşta kaldığında otomatik akıllı uykuya geçiş yaparak bekleme yükünü sıfırlayabilirsiniz.
                </li>
                <li>
                  <strong style={{ color: 'var(--color-ink)' }}>🛡️ Voltaj ve Güvenlik Sınırı:</strong> Anlık {powerOn ? telemetry.currentPower : 0}W çekim, belirlenen {telemetry.safeLimit || 2000}W güvenli eşiğin %{(((powerOn ? telemetry.currentPower : 0) / (telemetry.safeLimit || 2000)) * 100).toFixed(1)} seviyesinde stabil seyretmektedir.
                </li>
              </ul>
            </div>

            <button onClick={() => setActiveModal(null)} style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '0.75rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Raporu Kapat</button>
          </div>
        </div>
      )}

      {/* CONSUMPTION HISTORY MODAL */}
      {activeModal === 'history' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }} onClick={() => setActiveModal(null)}>
          <div style={{
            background: 'var(--color-surface-1)',
            border: '1px solid var(--color-hairline)',
            borderRadius: '0px',
            width: '100%',
            maxWidth: '540px',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-hairline)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 600, color: 'var(--color-ink)' }}>
                <LineChart size={18} color="var(--color-primary)" />
                <span>{telemetry.name} — 24 Saatlik Tüketim Geçmişi</span>
              </div>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: 'var(--color-ink-muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-ink-muted)' }}>
                Saatlik güç tüketim dalgalanması (Watt):
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '140px', background: 'var(--color-surface-2)', padding: '1rem 0.75rem 0.5rem 0.75rem', border: '1px solid var(--color-hairline)' }}>
                {liveHistoryData.map((d, i) => {
                  const maxW = Math.max(...liveHistoryData.map(item => item.value), 1)
                  const pct = (d.value / maxW) * 100
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: 'var(--color-ink-muted)' }}>{d.value}W</span>
                      <div style={{ width: '100%', height: `${Math.max(pct, 8)}%`, background: 'var(--color-primary)', borderRadius: '0px' }} />
                      <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--color-ink-muted)' }}>{d.time}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
              <div style={{ background: 'var(--color-surface-2)', padding: '0.75rem', border: '1px solid var(--color-hairline)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--color-ink-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Bugünkü Tüketim</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-ink)', marginTop: '2px', fontFamily: 'monospace' }}>{telemetry.todayConsumption || 1.8} kWh</div>
              </div>
              <div style={{ background: 'var(--color-surface-2)', padding: '0.75rem', border: '1px solid var(--color-hairline)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--color-ink-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Tahmini Aylık Maliyet</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-ink)', marginTop: '2px', fontFamily: 'monospace' }}>₺{telemetry.estimatedCost || 185} TL</div>
              </div>
            </div>

            <button onClick={() => setActiveModal(null)} style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '0.75rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Kapat</button>
          </div>
        </div>
      )}
    </>
  )
}
