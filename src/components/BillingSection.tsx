import { Receipt } from 'lucide-react'
import { type Home } from '@/types/home'
import { getEffectiveRate, getPenaltyMultiplier, getPenaltyTierLabel, BASE_RATE } from '@/utils/billing'
import styles from './BillingSection.module.css'

interface BillingSectionProps {
  home: Home
}

export function BillingSection({ home }: BillingSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          <Receipt size={16} className={styles.sectionIcon} />
          Faturalandırma
        </h2>
      </div>
      <div className={styles.billingCard}>
        <div className={styles.billingRow}>
          <span className={styles.billingLabel}>Tarife Türü</span>
          <span className={`${styles.billingValue} ${home.penaltyActive ? styles.text_breach : ''}`}>
            {getPenaltyTierLabel(home.quotaUsagePercent)}
          </span>
        </div>
        <div className={styles.billingRow}>
          <span className={styles.billingLabel}>Baz Fiyat</span>
          <span className={styles.billingValue}>{BASE_RATE.toFixed(2)} ₺/kWh</span>
        </div>
        {home.penaltyActive && (
          <div className={styles.billingRow}>
            <span className={styles.billingLabel}>Ceza Çarpanı</span>
            <span className={`${styles.billingValue} ${styles.text_breach}`}>
              ×{getPenaltyMultiplier(home.quotaUsagePercent).toFixed(2)}
            </span>
          </div>
        )}
        <div className={styles.billingRow}>
          <span className={styles.billingLabel}>Uygulanan Fiyat</span>
          <span className={`${styles.billingValue} ${home.penaltyActive ? styles.text_breach : ''}`}>
            {getEffectiveRate(home.quotaUsagePercent).toFixed(2)} ₺/kWh
          </span>
        </div>
        <div className={styles.billingRow}>
          <span className={styles.billingLabel}>Toplam Tüketim</span>
          <span className={styles.billingValue}>{home.totalConsumptionKwh.toFixed(2)} kWh</span>
        </div>
        <div className={styles.billingSeparator} />
        <div className={styles.billingRow}>
          <span className={styles.billingLabel}>Hesaplama</span>
          <span className={styles.billingCalc}>
            {home.totalConsumptionKwh.toFixed(2)} × {getEffectiveRate(home.quotaUsagePercent).toFixed(2)} ₺
          </span>
        </div>
        <div className={styles.billingRow}>
          <span className={styles.billingTotalLabel}>Toplam Fatura</span>
          <span className={styles.billingTotal}>{home.billingAmountTry.toFixed(2)} ₺</span>
        </div>
      </div>
    </section>
  )
}
