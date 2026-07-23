import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { type Appliance } from '@/types/home'
import styles from './AppliancePieChart.module.css'

const COLORS = ['#0f62fe', '#6929c4', '#1192e8', '#005d5d', '#9f1853', '#fa4d56', '#570408', '#198038']

interface PieDataEntry {
  name: string
  value: number
  percent: number
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: PieDataEntry }> }) {
  if (!active || !payload?.[0]) return null
  const { name, value } = payload[0].payload
  return (
    <div className={styles.tooltip}>
      <span>{name}</span>
      <strong>{value} W</strong>
    </div>
  )
}

interface AppliancePieChartProps {
  appliances: Appliance[]
}

export function AppliancePieChart({ appliances }: AppliancePieChartProps) {
  const totalWatt = appliances.reduce((sum, a) => sum + a.currentWatt, 0)

  if (totalWatt === 0) return null

  const data: PieDataEntry[] = appliances.map((a) => ({
    name: a.name,
    value: Math.round(a.currentWatt * 10) / 10,
    percent: Math.round((a.currentWatt / totalWatt) * 1000) / 10,
  }))

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>Cihaz Enerji Dağılımı</h4>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              dataKey="value"
              nameKey="name"
              paddingAngle={2}
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
          </PieChart>
        </ResponsiveContainer>
        <ul className={styles.legend}>
          {data.map((entry, index) => (
            <li key={entry.name} className={styles.legendItem}>
              <span
                className={styles.legendDot}
                style={{ background: COLORS[index % COLORS.length] }}
              />
              <span className={styles.legendLabel}>{entry.name}</span>
              <span className={styles.legendValue}>{entry.percent}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
