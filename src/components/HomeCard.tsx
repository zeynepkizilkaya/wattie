import { Home as HomeIcon } from 'lucide-react'
import { type Home } from '@/types/home'
import { getQuotaState } from '@/utils/quota'
import { getHealthScore, getHealthColor } from '@/utils/healthScore'
import { formatKwh, formatCurrency, formatWatt } from '@/utils/format'
import { AnimatedValue } from './AnimatedValue'
import styles from './HomeCard.module.css'

interface HomeCardProps {
  home: Home
  onClick: (home: Home) => void
}

export function HomeCard({ home, onClick }: HomeCardProps) {
  const state = getQuotaState(home.quotaUsagePercent)
  const health = getHealthScore(home)
  const healthColor = getHealthColor(health)
  const anomalyCount = home.appliances.filter(a => a.consecutiveBreaches >= 3).length
  const totalWatt = home.appliances.reduce((sum, a) => sum + a.currentWatt, 0)
  const isNightTariff = (() => { const h = new Date().getHours(); return h >= 22 || h < 6 })()

  return (
    <button
      className={`${styles.card} ${styles[state]}`}
      onClick={() => onClick(home)}
    >
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <HomeIcon size={16} className={styles.homeIcon} />
          <h3 className={styles.name}>{home.name}</h3>
          {anomalyCount > 0 && (
            <span className={styles.anomalyBadge}>{anomalyCount}</span>
          )}
        </div>
      </div>

      <div className={styles.heroRow}>
        <div className={styles.heroMetric}>
          <AnimatedValue
            value={home.quotaUsagePercent.toFixed(1) + '%'}
            className={`${styles.heroValue} ${styles[`text_${state}`]}`}
          />
          <span className={styles.heroLabel}>Kota</span>
        </div>
        {isNightTariff && (
          <span className={styles.nightBadge}>Gece</span>
        )}
        {health < 80 && (
          <div className={styles.healthIndicator}>
            <svg width="32" height="32" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="14" fill="none" stroke="var(--color-surface-2)" strokeWidth="3" />
              <circle
                cx="16" cy="16" r="14"
                fill="none"
                stroke={healthColor}
                strokeWidth="3"
                strokeDasharray={`${(health / 100) * 88} 88`}
                strokeLinecap="round"
                transform="rotate(-90 16 16)"
              />
            </svg>
            <span className={styles.healthValue} style={{ color: healthColor }}>{health}</span>
          </div>
        )}
      </div>

      <div className={styles.quotaBar}>
        <div
          className={`${styles.quotaFill} ${styles[`fill_${state}`]}`}
          style={{ width: `${Math.min(home.quotaUsagePercent, 100)}%` }}
        />
      </div>

      <div className={styles.metrics}>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Anlık Yük</span>
          <AnimatedValue value={formatWatt(totalWatt)} className={styles.metricValue} />
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Tüketim</span>
          <AnimatedValue
            value={formatKwh(home.totalConsumptionKwh)}
            className={styles.metricValue}
          />
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Fatura</span>
          <AnimatedValue
            value={formatCurrency(home.billingAmountTry)}
            className={styles.metricValue}
          />
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Cihaz</span>
          <span className={styles.metricValue}>{home.appliances.length}</span>
        </div>
      </div>
    </button>
  )
}
