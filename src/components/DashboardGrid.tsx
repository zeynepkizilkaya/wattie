import { Home } from 'lucide-react'
import { type Home as HomeType } from '@/types/home'
import { HomeCard } from './HomeCard'
import { HomeListRow } from './HomeListRow'
import { SkeletonCard } from './Skeleton'
import styles from './DashboardGrid.module.css'

export type ViewMode = 'grid' | 'list'

interface DashboardGridProps {
  homes: HomeType[]
  loading: boolean
  onHomeClick: (home: HomeType) => void
  viewMode?: ViewMode
}

export function DashboardGrid({ homes, loading, onHomeClick, viewMode = 'grid' }: DashboardGridProps) {
  if (loading && homes.length === 0) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (homes.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>
          <Home size={48} />
        </div>
        <h3 className={styles.emptyTitle}>Henüz kayıtlı konut yok</h3>
        <p className={styles.emptyDesc}>
          İlk konutunuzu ekleyerek enerji tüketimini izlemeye başlayın.
          Cihazlarınızı tanımlayın, kota limitleri belirleyin ve
          gerçek zamanlı takip sistemini kullanmaya başlayın.
        </p>
        <div className={styles.emptySteps}>
          <div className={styles.emptyStep}>
            <span className={styles.stepNumber}>1</span>
            <span className={styles.stepText}>Konut ekleyin</span>
          </div>
          <div className={styles.emptyStep}>
            <span className={styles.stepNumber}>2</span>
            <span className={styles.stepText}>Cihazları tanımlayın</span>
          </div>
          <div className={styles.emptyStep}>
            <span className={styles.stepNumber}>3</span>
            <span className={styles.stepText}>İzlemeye başlayın</span>
          </div>
        </div>
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <div className={styles.list}>
        <div className={styles.listHeader}>
          <span>Konut</span>
          <span>Kota</span>
          <span>Anlık Yük</span>
          <span>Tüketim</span>
          <span>Fatura</span>
          <span>Sağlık</span>
        </div>
        {homes.map((home) => (
          <HomeListRow key={home.id} home={home} onClick={onHomeClick} />
        ))}
      </div>
    )
  }

  return (
    <div className={styles.grid}>
      {homes.map((home) => (
        <HomeCard key={home.id} home={home} onClick={onHomeClick} />
      ))}
    </div>
  )
}
