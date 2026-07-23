import { useMemo } from 'react'
import { type Appliance } from '@/types/home'
import { getApplianceIcon } from '@/utils/applianceIcons'
import styles from './DeviceComparisonChart.module.css'

interface DeviceComparisonChartProps {
  appliances: Appliance[]
}

const COLORS = ['#0f62fe', '#24a148', '#8a3ffc', '#f1c21b', '#da1e28', '#007d79', '#6929c4', '#ff832b']

export function DeviceComparisonChart({ appliances }: DeviceComparisonChartProps) {
  const wattKey = appliances.map(a => `${a.id}:${a.currentWatt}`).join(',')
  const data = useMemo(() => {
    const total = appliances.reduce((sum, a) => sum + a.currentWatt, 0)
    if (total === 0) return []
    return appliances
      .map((a, i) => ({
        id: a.id,
        name: a.name,
        watt: a.currentWatt,
        percent: (a.currentWatt / total) * 100,
        color: COLORS[i % COLORS.length],
      }))
      .sort((a, b) => b.watt - a.watt)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wattKey])

  if (data.length === 0) return null

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>Cihaz Karşılaştırması</h4>

      <div className={styles.stackedBar}>
        {data.map(d => (
          <div
            key={d.id}
            className={styles.segment}
            style={{ width: `${d.percent}%`, background: d.color }}
            title={`${d.name}: ${d.watt.toFixed(0)}W (${d.percent.toFixed(1)}%)`}
          />
        ))}
      </div>

      <div className={styles.legend}>
        {data.map(d => {
          const Icon = getApplianceIcon(d.name)
          return (
            <div key={d.id} className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: d.color }} />
              <Icon size={12} />
              <span className={styles.legendName}>{d.name}</span>
              <span className={styles.legendPercent}>{d.percent.toFixed(0)}%</span>
              <span className={styles.legendWatt}>{d.watt.toFixed(0)}W</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
