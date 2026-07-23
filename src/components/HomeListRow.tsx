import { Home as HomeIcon } from 'lucide-react'
import { type Home } from '@/types/home'
import { getQuotaState } from '@/utils/quota'
import { getHealthScore, getHealthColor } from '@/utils/healthScore'
import { formatKwh, formatCurrency, formatWatt } from '@/utils/format'
import { AnimatedValue } from './AnimatedValue'
import styles from './HomeListRow.module.css'

interface HomeListRowProps {
  home: Home
  onClick: (home: Home) => void
}

export function HomeListRow({ home, onClick }: HomeListRowProps) {
  const state = getQuotaState(home.quotaUsagePercent)
  const health = getHealthScore(home)
  const healthColor = getHealthColor(health)
  const anomalyCount = home.appliances.filter(a => a.consecutiveBreaches >= 3).length
  const totalWatt = home.appliances.reduce((sum, a) => sum + a.currentWatt, 0)

  return (
    <button className={`${styles.row} ${styles[state]}`} onClick={() => onClick(home)}>
      <div className={styles.nameCol}>
        <HomeIcon size={14} className={styles.icon} />
        <span className={styles.name}>{home.name}</span>
        {anomalyCount > 0 && (
          <span className={styles.anomalyBadge}>{anomalyCount}</span>
        )}
        {home.penaltyActive && <span className={styles.badge}>Ceza</span>}
      </div>
      <div className={styles.quotaCol}>
        <AnimatedValue
          value={home.quotaUsagePercent.toFixed(1) + '%'}
          className={`${styles.quotaValue} ${styles[`text_${state}`]}`}
        />
        <div className={styles.miniBar}>
          <div
            className={`${styles.miniFill} ${styles[`fill_${state}`]}`}
            style={{ width: `${Math.min(home.quotaUsagePercent, 100)}%` }}
          />
        </div>
      </div>
      <div className={styles.metricCol}>
        <AnimatedValue value={formatWatt(totalWatt)} className={styles.metricValue} />
      </div>
      <div className={styles.metricCol}>
        <AnimatedValue value={formatKwh(home.totalConsumptionKwh)} className={styles.metricValue} />
      </div>
      <div className={styles.metricCol}>
        <AnimatedValue value={formatCurrency(home.billingAmountTry)} className={styles.metricValue} />
      </div>
      <div className={styles.healthCol}>
        <span className={styles.healthDot} style={{ background: healthColor }} />
        <span className={styles.healthValue}>{health}</span>
      </div>
    </button>
  )
}
