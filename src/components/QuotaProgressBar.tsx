import styles from './QuotaProgressBar.module.css'

interface QuotaProgressBarProps {
  quotaPercent: number
}

export function QuotaProgressBar({ quotaPercent }: QuotaProgressBarProps) {
  const maxDisplay = 180
  const fillWidth = Math.min((quotaPercent / maxDisplay) * 100, 100)

  const getState = () => {
    if (quotaPercent >= 100) return 'breach'
    if (quotaPercent >= 80) return 'warning'
    return 'normal'
  }

  const getTierLabel = () => {
    if (quotaPercent < 80) return 'Normal kullanım'
    if (quotaPercent < 100) return 'Uyarı seviyesi — %80 aşıldı'
    if (quotaPercent < 120) return 'Kota aşımı — Kademe 1 ceza'
    if (quotaPercent < 140) return 'Kota aşımı — Kademe 2 ceza'
    if (quotaPercent < 160) return 'Kota aşımı — Kademe 3 ceza'
    return 'Kota aşımı — Kademe 4 ceza'
  }

  const state = getState()
  const thresholds = [80, 100, 120, 140, 160]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={`${styles.percent} ${styles[state]}`}>
          {quotaPercent.toFixed(1)}%
        </span>
        <span className={styles.tierLabel}>{getTierLabel()}</span>
      </div>
      <div className={styles.track}>
        <div
          className={`${styles.fill} ${styles[`fill_${state}`]}`}
          style={{ width: `${fillWidth}%` }}
        />
        {thresholds.map(t => (
          <div
            key={t}
            className={`${styles.marker} ${t === 100 ? styles.markerPrimary : ''}`}
            style={{ left: `${(t / maxDisplay) * 100}%` }}
          >
            <span className={styles.markerLabel}>{t}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
