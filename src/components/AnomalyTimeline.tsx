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
  timestamp: string
}

export function AnomalyTimeline({ appliances }: AnomalyTimelineProps) {
  const entries: TimelineEntry[] = appliances
    .filter(a => a.consecutiveBreaches > 0)
    .sort((a, b) => b.consecutiveBreaches - a.consecutiveBreaches)
    .map(a => ({
      applianceId: a.id,
      applianceName: a.name,
      status: a.consecutiveBreaches >= 3 ? 'active' : 'resolved',
      breaches: a.consecutiveBreaches,
      timestamp: getRelativeTime(a.consecutiveBreaches),
    }))

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

function getRelativeTime(breaches: number): string {
  const minutes = breaches * 2
  if (minutes < 60) return `~${minutes} dk önce başladı`
  const hours = Math.floor(minutes / 60)
  return `~${hours} saat önce başladı`
}
