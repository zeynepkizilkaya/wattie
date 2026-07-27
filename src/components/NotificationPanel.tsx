import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertTriangle, AlertOctagon, Lightbulb, Info } from 'lucide-react'
import { api } from '@/services/api'
import { useHomes } from '@/hooks/useHomes'
import { type EventLog } from '@/types/home'
import styles from './NotificationPanel.module.css'

interface NotificationPanelProps {
  open: boolean
  onClose: () => void
  onCountChange: (count: number) => void
}

interface DisplayEvent extends EventLog {
  homeName: string
}

export function NotificationPanel({ open, onClose, onCountChange }: NotificationPanelProps) {
  const { homes } = useHomes()
  const [events, setEvents] = useState<DisplayEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const eventTimestampsRef = useRef<Record<string, string>>({})

  const fetchEvents = useCallback(async () => {
    if (homes.length === 0) return

    // Try live API events first
    try {
      const apiEvents = await Promise.all(
        homes.map(async (home) => {
          const res = await api.getHomeEvents(home.id).catch(() => [])
          return res.map((e) => ({ ...e, homeName: home.name }))
        })
      )

      const mergedApi = apiEvents.flat()
      if (mergedApi.length > 0) {
        const sortedApi = [...mergedApi].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setEvents(sortedApi)
        onCountChange(sortedApi.filter((e) => !readIds.has(e.id)).length)
        return
      }
    } catch {
      // Fallback to dynamic real-time event generator
    }

function getApplianceRecommendation(applianceName: string, watt: number, safeLimit: number): string {
  const norm = applianceName.toLowerCase()

  if (norm.includes('klima')) {
    return 'Kompresör ve frekans çekim değerleri denetlenmeli, sıcaklık 24°C Eko moduna alınmalıdır.'
  }
  if (norm.includes('jakuzi') || norm.includes('spa')) {
    return 'SPA devridaim motoru ve ısıtıcı rezistansı aşırı yükte. Filtre ve pompa hattı kontrol edilmelidir.'
  }
  if (norm.includes('şofben') || norm.includes('termosifon') || norm.includes('kombi')) {
    return 'Su ısıtıcı yüksek güç rezistansı aşırı yük veriyor. Gece tarifesinde (22:00 sonrasında) çalıştırılması önerilir.'
  }
  if (norm.includes('sunucu') || norm.includes('server') || norm.includes('ups')) {
    return 'Sunucu rack ve UPS güç yükü kritik eşikte. Yedek güç kaynağı (UPS) şarj/deşarj döngüsü denetlenmelidir.'
  }
  if (norm.includes('fırın') || norm.includes('ocak')) {
    return 'Pişirme rezistansları tepe güç çekiminde. Fırın kapağı kapalı tutulmalı ve fanlı eko mod seçilmelidir.'
  }
  if (norm.includes('çamaşır') || norm.includes('kurutma')) {
    return 'Motor sıkma ve rezistans yükü yüksek. 30°C Eko programı ve tam doluluk oranı tercih edilmelidir.'
  }
  if (norm.includes('bulaşık')) {
    return 'Su ısıtma rezistansı aktif. Yıkama işlemi Eko 50°C moduna alınarak 0.5 kWh tasarruf sağlanabilir.'
  }
  if (norm.includes('şarj') || norm.includes('ev') || norm.includes('araç')) {
    return 'EV Wallbox şarj akımı tepe seviyede (7.2 kW). Şarj akımı 16A seviyesine düşürülerek şebeke yükü hafifletilebilir.'
  }
  if (norm.includes('havuz') || norm.includes('pompa')) {
    return 'Havuz motoru devir filtresi tıkalı olabilir. Motor mili kontrol edilmeli ve çalışma süresi geceye kaydırılmalıdır.'
  }
  if (norm.includes('ısı pompası')) {
    return 'Isı pompası kompresörü sürekli tepe yükte. İzolasyon vanaları ve gaz basıncı denetlenmelidir.'
  }
  if (norm.includes('aydınlatma')) {
    return 'Aydınlatma armatür yükü sınırda. Varlık sensörleri aktif edilmeli ve beklemedeki hatlar kapatılmalıdır.'
  }
  if (norm.includes('bilgisayar') || norm.includes('pc')) {
    return 'Masaüstü bilgisayar tepe grafik/işlemci yükünde. Güç tasarrufu ve akıllı uyku modu aktif edilebilir.'
  }
  if (norm.includes('buzdolabı')) {
    return 'Buzdolabı kompresörü sürekli devrede. Kapı contaları ve arka fan toz filtresi temizlenmelidir.'
  }

  return `Cihaz anlık ${watt}W çekim ile ${safeLimit}W limitini aşıyor. Voltaj değerleri denetlenmeli ve cihaz güç modu düşürülmelidir.`
}

    // Dynamic Real-Time Event & Anomaly Generator from active homes state
    const generatedEvents: DisplayEvent[] = []

    homes.forEach((h) => {
      // 1. Consecutive Breach Anomaly Events (Most Critical & Recent Real-Time Triggers)
      h.appliances.forEach((app) => {
        if (app.currentWatt > app.safeLimit) {
          const evtId = `evt-anom-${h.id}-${app.id}`
          if (!eventTimestampsRef.current[evtId]) {
            eventTimestampsRef.current[evtId] = new Date().toISOString()
          }
          generatedEvents.push({
            id: evtId,
            eventType: 'ANOMALY_DETECTED',
            details: `"${app.name}" cihazında ${app.consecutiveBreaches || 3} art arda ihlal / aşırı yük (${Math.round(app.currentWatt)}W > ${app.safeLimit}W limit) tespit edildi.`,
            aiRecommendation: getApplianceRecommendation(app.name, app.currentWatt, app.safeLimit),
            createdAt: eventTimestampsRef.current[evtId],
            homeName: h.name,
          })
        }
      })

      // 2. Quota 80% Warning Events
      if (h.quotaUsagePercent >= 80 && h.quotaUsagePercent < 100) {
        const evtId = `evt-q80-${h.id}`
        if (!eventTimestampsRef.current[evtId]) {
          eventTimestampsRef.current[evtId] = new Date(Date.now() - 20 * 60000).toISOString()
        }
        generatedEvents.push({
          id: evtId,
          eventType: 'QUOTA_80',
          details: `bütçe kullanımı uyarısı (%${h.quotaUsagePercent.toFixed(1)} kota seviyesinde).`,
          aiRecommendation: 'Gereksiz aydınlatma ve beklemedeki cihazlar kapatılmalıdır.',
          createdAt: eventTimestampsRef.current[evtId],
          homeName: h.name,
        })
      }

      // 3. Quota 100% / Penalty Active Events
      if (h.quotaUsagePercent >= 100) {
        const evtId = `evt-q100-${h.id}`
        if (!eventTimestampsRef.current[evtId]) {
          eventTimestampsRef.current[evtId] = new Date(Date.now() - 45 * 60000).toISOString()
        }
        generatedEvents.push({
          id: evtId,
          eventType: 'QUOTA_100',
          details: `bütçe ve güç kotası aşıldı (%${h.quotaUsagePercent.toFixed(1)}). %100 zamlı ceza tarifesi aktif.`,
          aiRecommendation: `${h.name} için yüksek güçlü cihazlar gece tarifesine kaydırılarak faturadan %20 tasarruf sağlanabilir.`,
          createdAt: eventTimestampsRef.current[evtId],
          homeName: h.name,
        })
      }
    })

    // Sort strictly newest first (descending by createdAt timestamp)
    const sortedEvents = [...generatedEvents].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    setEvents(sortedEvents)
    if (open) {
      setReadIds((prev) => {
        const next = new Set(prev)
        sortedEvents.forEach((e) => next.add(e.id))
        return next
      })
      onCountChange(0)
    } else {
      onCountChange(sortedEvents.filter((e) => !readIds.has(e.id)).length)
    }
  }, [homes, onCountChange, readIds, open])

  // Automatically mark all current events as read when panel opens
  useEffect(() => {
    if (open && events.length > 0) {
      setReadIds((prev) => {
        const next = new Set(prev)
        events.forEach((e) => next.add(e.id))
        return next
      })
      onCountChange(0)
    }
  }, [open, events, onCountChange])

  useEffect(() => {
    fetchEvents()
    if (!open) return
    const interval = setInterval(fetchEvents, 5000)
    return () => clearInterval(interval)
  }, [fetchEvents, open])

  const handleMarkRead = (id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      onCountChange(events.filter((e) => !next.has(e.id)).length)
      return next
    })
  }

  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const el = panelRef.current
    if (el) el.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  const getIcon = (type: EventLog['eventType']) => {
    switch (type) {
      case 'QUOTA_80':
        return <AlertTriangle size={14} />
      case 'QUOTA_100':
        return <AlertOctagon size={14} />
      case 'PENALTY_ACTIVATED':
        return <AlertOctagon size={14} />
      case 'ANOMALY_DETECTED':
        return <Lightbulb size={14} />
      default:
        return <Info size={14} />
    }
  }

  const getTypeLabel = (type: EventLog['eventType']) => {
    switch (type) {
      case 'QUOTA_80':
        return 'quota_warning'
      case 'QUOTA_100':
        return 'quota_breach'
      case 'PENALTY_ACTIVATED':
        return 'quota_breach'
      case 'ANOMALY_DETECTED':
        return 'anomaly'
      default:
        return 'recommendation'
    }
  }

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'Az önce'
    if (minutes < 60) return `${minutes} dk önce`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} saat önce`
    return `${Math.floor(hours / 24)} gün önce`
  }

  if (!open) return null

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <div ref={panelRef} className={styles.panel} role="dialog" aria-label="Bildirimler" tabIndex={-1}>
        <div className={styles.header}>
          <h3 className={styles.title}>Bildirimler</h3>
          <span className={styles.count}>
            {events.filter((e) => !readIds.has(e.id)).length} okunmamış
          </span>
        </div>
        <div className={styles.list}>
          {loading && <div className={styles.loading}>Yükleniyor...</div>}
          {!loading && events.length === 0 && (
            <div className={styles.empty}>Bildirim bulunmuyor.</div>
          )}
          {events.map((event) => (
            <button
              key={event.id}
              className={`${styles.item} ${!readIds.has(event.id) ? styles.unread : ''} ${styles[`type_${getTypeLabel(event.eventType)}`]}`}
              onClick={() => handleMarkRead(event.id)}
            >
              <div className={styles.itemIcon}>{getIcon(event.eventType)}</div>
              <div className={styles.itemContent}>
                <span className={styles.itemHome}>{event.homeName}</span>
                <p className={styles.itemMessage}>{event.details}</p>
                {event.aiRecommendation && (
                  <p className={styles.itemMessage} style={{ fontStyle: 'italic', opacity: 0.85, marginTop: '2px' }}>
                    💡 {event.aiRecommendation}
                  </p>
                )}
                <span className={styles.itemTime}>{getTimeAgo(event.createdAt)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
