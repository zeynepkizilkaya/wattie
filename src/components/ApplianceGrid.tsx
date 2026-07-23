import { type Appliance } from '@/types/home'
import { ApplianceCard } from './ApplianceCard'
import styles from './ApplianceGrid.module.css'

interface ApplianceGridProps {
  appliances: Appliance[]
  quotaPercent?: number
  onRemove?: (id: string) => void
  onUpdateLimit?: (id: string, newLimit: number) => void
}

export function ApplianceGrid({ appliances, quotaPercent = 0, onRemove, onUpdateLimit }: ApplianceGridProps) {
  return (
    <div className={styles.grid}>
      {appliances.map((appliance) => (
        <ApplianceCard
          key={appliance.id}
          appliance={appliance}
          quotaPercent={quotaPercent}
          onRemove={onRemove}
          onUpdateLimit={onUpdateLimit}
        />
      ))}
    </div>
  )
}
