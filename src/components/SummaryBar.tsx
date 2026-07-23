import { Home, AlertTriangle, AlertOctagon, Zap, Activity } from 'lucide-react'
import { type Home as HomeType } from '@/types/home'
import { getQuotaState } from '@/utils/quota'
import { formatKwh, formatWatt } from '@/utils/format'
import styles from './SummaryBar.module.css'

interface SummaryBarProps {
  homes: HomeType[]
}

export function SummaryBar({ homes }: SummaryBarProps) {
  const totalHomes = homes.length
  const totalKwh = homes.reduce((sum, h) => sum + h.totalConsumptionKwh, 0)
  const totalWatt = homes.reduce((sum, h) =>
    sum + h.appliances.reduce((s, a) => s + a.currentWatt, 0), 0
  )
  const warnings = homes.filter((h) => getQuotaState(h.quotaUsagePercent) === 'warning').length
  const breaches = homes.filter((h) => getQuotaState(h.quotaUsagePercent) === 'breach').length

  return (
    <div className={styles.bar}>
      <div className={styles.stat}>
        <div className={styles.statIcon}>
          <Activity size={18} />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statValue}>{formatWatt(totalWatt)}</span>
          <span className={styles.statLabel}>Anlık Yük</span>
        </div>
      </div>

      <div className={styles.stat}>
        <div className={styles.statIcon}>
          <Home size={18} />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statValue}>{totalHomes}</span>
          <span className={styles.statLabel}>Konut</span>
        </div>
      </div>

      <div className={styles.stat}>
        <div className={styles.statIcon}>
          <Zap size={18} />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statValue}>{formatKwh(totalKwh)}</span>
          <span className={styles.statLabel}>Toplam Tüketim</span>
        </div>
      </div>

      <div className={`${styles.stat} ${warnings > 0 ? styles.statWarning : ''}`}>
        <div className={`${styles.statIcon} ${styles.iconWarning}`}>
          <AlertTriangle size={18} />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statValue}>{warnings}</span>
          <span className={styles.statLabel}>Uyarı</span>
        </div>
      </div>

      <div className={`${styles.stat} ${breaches > 0 ? styles.statError : ''}`}>
        <div className={`${styles.statIcon} ${styles.iconError}`}>
          <AlertOctagon size={18} />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statValue}>{breaches}</span>
          <span className={styles.statLabel}>Kota Aşımı</span>
        </div>
      </div>
    </div>
  )
}
