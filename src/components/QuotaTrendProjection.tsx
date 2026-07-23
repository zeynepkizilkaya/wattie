import { useMemo } from 'react'
import { type Home } from '@/types/home'
import styles from './QuotaTrendProjection.module.css'

interface QuotaTrendProjectionProps {
  home: Home
}

export function QuotaTrendProjection({ home }: QuotaTrendProjectionProps) {
  const projection = useMemo(() => {
    const { quotaUsagePercent, totalConsumptionKwh } = home

    if (quotaUsagePercent >= 100) {
      return { status: 'breached' as const, daysLeft: 0, projectedDate: null }
    }

    if (quotaUsagePercent <= 0 || totalConsumptionKwh <= 0) {
      return { status: 'insufficient' as const, daysLeft: null, projectedDate: null }
    }

    // Assume billing period is 30 days, estimate daily rate from current usage
    const dailyRate = quotaUsagePercent / Math.max(1, getDayOfMonth())
    const remaining = 100 - quotaUsagePercent
    const daysLeft = dailyRate > 0 ? Math.ceil(remaining / dailyRate) : null

    if (daysLeft === null || daysLeft > 60) {
      return { status: 'safe' as const, daysLeft, projectedDate: null }
    }

    const projectedDate = new Date()
    projectedDate.setDate(projectedDate.getDate() + daysLeft)

    if (daysLeft <= 3) {
      return { status: 'critical' as const, daysLeft, projectedDate }
    }
    if (daysLeft <= 7) {
      return { status: 'warning' as const, daysLeft, projectedDate }
    }
    return { status: 'normal' as const, daysLeft, projectedDate }
  }, [home.quotaUsagePercent, home.totalConsumptionKwh])

  if (projection.status === 'breached') {
    return (
      <div className={`${styles.container} ${styles.breached}`}>
        <span className={styles.icon}>⚡</span>
        <div className={styles.text}>
          <span className={styles.label}>Kota Aşıldı</span>
          <span className={styles.detail}>Ceza tarifesi aktif</span>
        </div>
      </div>
    )
  }

  if (projection.status === 'insufficient' || projection.status === 'safe') {
    return (
      <div className={`${styles.container} ${styles.safe}`}>
        <span className={styles.icon}>✓</span>
        <div className={styles.text}>
          <span className={styles.label}>Kota Güvende</span>
          <span className={styles.detail}>Mevcut hızda aşım riski düşük</span>
        </div>
      </div>
    )
  }

  const dateStr = projection.projectedDate
    ? projection.projectedDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
    : ''

  return (
    <div className={`${styles.container} ${styles[projection.status]}`}>
      <span className={styles.icon}>{projection.status === 'critical' ? '🔴' : '🟡'}</span>
      <div className={styles.text}>
        <span className={styles.label}>
          {projection.daysLeft} gün içinde kota aşılabilir
        </span>
        <span className={styles.detail}>
          Tahmini aşım: {dateStr}
        </span>
      </div>
      <div className={styles.bar}>
        <div
          className={`${styles.barFill} ${styles[`fill_${projection.status}`]}`}
          style={{ width: `${home.quotaUsagePercent}%` }}
        />
        <div className={styles.barMarker} style={{ left: '100%' }} />
      </div>
    </div>
  )
}

function getDayOfMonth(): number {
  return new Date().getDate()
}
