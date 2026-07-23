import { Activity, Bell, TrendingDown, Home, BarChart3, Shield, type LucideIcon } from 'lucide-react'
import { AnimatedSparklineSVG } from './AnimatedSparklineSVG'
import styles from './EnergyIllustration.module.css'

const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Activity, title: 'Gerçek Zamanlı İzleme', desc: 'Her cihazın anlık watt tüketimini saniye saniye takip edin' },
  { icon: Bell, title: 'Akıllı Uyarılar', desc: 'Kota %80\'e ulaştığında otomatik bildirim alın' },
  { icon: TrendingDown, title: 'Maliyet Kontrolü', desc: 'Ceza tarifesine girmeden tüketiminizi optimize edin' },
  { icon: Home, title: 'Çoklu Konut', desc: 'Tüm konutlarınızı tek panelden yönetin' },
  { icon: BarChart3, title: 'Günlük Trendler', desc: 'Geçmişe dönük tüketim grafikleri ile analiz yapın' },
  { icon: Shield, title: 'Anomali Tespiti', desc: 'Arızalı cihazları otomatik tespit edin' },
]

const MINI_STATS = [
  { label: 'Aktif Konut', value: '12', color: 'var(--color-primary)' },
  { label: 'Kota Uyarısı', value: '3', color: 'var(--color-semantic-warning)' },
  { label: 'Anomali', value: '1', color: 'var(--color-semantic-error)' },
  { label: 'Tasarruf', value: '%18', color: 'var(--color-semantic-success)' },
]

export function EnergyIllustration() {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h2 className={styles.heading}>Enerji yönetiminde<br />yeni nesil kontrol.</h2>
        <p className={styles.description}>
          Konutlarınızın anlık tüketimini izleyin, kota aşımlarını önleyin, fatura maliyetlerinizi düşürün.
        </p>
      </div>

      <div className={styles.miniStats}>
        {MINI_STATS.map(({ label, value, color }) => (
          <div key={label} className={styles.miniStat}>
            <span className={styles.miniStatValue} style={{ color }}>{value}</span>
            <span className={styles.miniStatLabel}>{label}</span>
          </div>
        ))}
      </div>

      <AnimatedSparklineSVG />

      <div className={styles.features}>
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className={styles.feature}>
            <div className={styles.featureIconBox}>
              <Icon size={16} />
            </div>
            <div className={styles.featureTextGroup}>
              <span className={styles.featureTitle}>{title}</span>
              <span className={styles.featureDesc}>{desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
