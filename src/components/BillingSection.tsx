import { Receipt } from 'lucide-react'
import { type Home } from '@/types/home'
import { calculateTieredBilling, getPenaltyTierLabel, BASE_RATE } from '@/utils/billing'
import styles from './BillingSection.module.css'

interface BillingSectionProps {
  home: Home
}

export function BillingSection({ home }: BillingSectionProps) {
  const tiered = calculateTieredBilling(home.totalConsumptionKwh, home.quotaUsagePercent)

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          <Receipt size={16} className={styles.sectionIcon} />
          Faturalandırma (Kademeli Tarife)
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
          <span className={styles.billingLabel}>Baz Fiyat (Kota İçi)</span>
          <span className={styles.billingValue}>{BASE_RATE.toFixed(2)} ₺/kWh</span>
        </div>
        {home.penaltyActive && (
          <>
            <div className={styles.billingRow}>
              <span className={styles.billingLabel}>Aşım Ceza Çarpanı</span>
              <span className={`${styles.billingValue} ${styles.text_breach}`}>
                ×{tiered.multiplier.toFixed(2)} (Aşan kısma özel)
              </span>
            </div>
            <div className={styles.billingRow}>
              <span className={styles.billingLabel}>Aşım Birim Fiyatı</span>
              <span className={`${styles.billingValue} ${styles.text_breach}`}>
                {tiered.penaltyRate.toFixed(2)} ₺/kWh
              </span>
            </div>
          </>
        )}
        <div className={styles.billingRow}>
          <span className={styles.billingLabel}>Toplam Tüketim</span>
          <span className={styles.billingValue}>{home.totalConsumptionKwh.toFixed(2)} kWh</span>
        </div>

        {home.penaltyActive && (
          <>
            <div className={styles.billingRow}>
              <span className={styles.billingLabel}>└ Kota İçi Tüketim (%100)</span>
              <span className={styles.billingValue}>{tiered.normalKwh.toFixed(2)} kWh ({tiered.normalCost.toFixed(2)} ₺)</span>
            </div>
            <div className={styles.billingRow}>
              <span className={styles.billingLabel}>└ Kota Aşan Tüketim</span>
              <span className={`${styles.billingValue} ${styles.text_breach}`}>{tiered.excessKwh.toFixed(2)} kWh ({tiered.excessCost.toFixed(2)} ₺)</span>
            </div>
          </>
        )}

        <div className={styles.billingSeparator} />
        <div className={styles.billingRow}>
          <span className={styles.billingLabel}>Hesaplama</span>
          <span className={styles.billingCalc}>
            {home.penaltyActive
              ? `(${tiered.normalKwh.toFixed(2)} × ${BASE_RATE.toFixed(2)} ₺) + (${tiered.excessKwh.toFixed(2)} × ${tiered.penaltyRate.toFixed(2)} ₺)`
              : `${home.totalConsumptionKwh.toFixed(2)} × ${BASE_RATE.toFixed(2)} ₺`}
          </span>
        </div>
        <div className={styles.billingRow}>
          <span className={styles.billingTotalLabel}>Toplam Fatura</span>
          <span className={styles.billingTotal}>{tiered.totalBill.toFixed(2)} ₺</span>
        </div>
      </div>
    </section>
  )
}
