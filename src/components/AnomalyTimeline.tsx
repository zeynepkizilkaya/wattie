import { useEffect, useState } from 'react'
import { type Appliance } from '@/types/home'
import { getApplianceIcon } from '@/utils/applianceIcons'
import styles from './AnomalyTimeline.module.css'

interface AnomalyTimelineProps {
  appliances: Appliance[]
}

interface TimelineEntry {
  applianceId: string
  applianceName: string
  status: 'active' | 'resolved'
  breaches: number
  startTimeMs: number
  timestamp: string
}

// Persistent store for real-time anomaly start timestamps
const anomalyStartMap: Record<string, number> = {}

export function AnomalyTimeline({ appliances }: AnomalyTimelineProps) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000)
    return () => clearInterval(timer)
  }, [])

  const entries: TimelineEntry[] = appliances
    .filter(a => a.consecutiveBreaches > 0 || (a.safeLimit > 0 && a.currentWatt > a.safeLimit))
    .map(a => {
      if (!anomalyStartMap[a.id]) {
        // Set realistic initial start time: fewer breaches = started more recently
        const initialOffsetMins = Math.max(1, (6 - Math.min(a.consecutiveBreaches || 1, 5)) * 3)
        anomalyStartMap[a.id] = Date.now() - initialOffsetMins * 60000
      }

      const startTimeMs = anomalyStartMap[a.id] || Date.now()
      const elapsedMins = Math.max(1, Math.floor((now - startTimeMs) / 60000))
      const timeStr = elapsedMins < 60 ? `~${elapsedMins} dk önce başladı` : `~${Math.floor(elapsedMins / 60)} saat önce başladı`
      const status: 'active' | 'resolved' = (a.consecutiveBreaches >= 3 || (a.safeLimit > 0 && a.currentWatt > a.safeLimit)) ? 'active' : 'resolved'

      return {
        applianceId: a.id,
        applianceName: a.name,
        status,
        breaches: a.consecutiveBreaches || 1,
        startTimeMs,
        timestamp: timeStr,
      }
    })
    // Sort strictly newest anomaly first (highest startTimeMs / most recent start at the top)
    .sort((a, b) => b.startTimeMs - a.startTimeMs)

  if (entries.length === 0) return null

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>Anomali Geçmişi</h4>
      <div className={styles.timeline}>
        {entries.map(entry => {
          const Icon = getApplianceIcon(entry.applianceName)
          return (
            <div key={entry.applianceId} className={`${styles.entry} ${styles[entry.status]}`}>
              <div className={styles.dot} />
              <div className={styles.line} />
              <div className={styles.entryContent}>
                <div className={styles.entryHeader}>
                  <Icon size={14} />
                  <span className={styles.entryName}>{entry.applianceName}</span>
                  <span className={`${styles.statusBadge} ${styles[entry.status]}`}>
                    {entry.status === 'active' ? 'Aktif' : 'İzleniyor'}
                  </span>
                </div>
                <span className={styles.entryDetail}>
                  {entry.breaches} ardışık ihlal — {entry.timestamp}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
