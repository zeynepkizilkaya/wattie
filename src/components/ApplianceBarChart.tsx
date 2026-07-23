import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { type Appliance } from '@/types/home'
import { isAnomalous } from '@/utils/quota'
import styles from './ApplianceBarChart.module.css'

interface ApplianceBarChartProps {
  appliances: Appliance[]
}

export function ApplianceBarChart({ appliances }: ApplianceBarChartProps) {
  if (appliances.length === 0) return null

  const data = appliances.map(a => ({
    name: a.name.length > 12 ? a.name.slice(0, 12) + '…' : a.name,
    fullName: a.name,
    currentWatt: Math.round(a.currentWatt),
    safeLimit: a.safeLimit,
    usage: Math.round((a.currentWatt / a.safeLimit) * 100),
    anomalous: isAnomalous(a.consecutiveBreaches),
  }))

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>Cihaz Bazlı Tüketim</h4>
      <ResponsiveContainer width="100%" height={Math.max(200, appliances.length * 48)}>
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hairline)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 12, fill: 'var(--color-ink-muted)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--color-hairline)' }}
            unit=" W"
          />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tick={{ fontSize: 12, fill: 'var(--color-ink-muted)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--color-hairline)' }}
          />
          <Tooltip
            contentStyle={{
              border: '1px solid var(--color-hairline)',
              borderRadius: '0px',
              fontSize: '13px',
              background: 'var(--color-canvas)',
            }}
            formatter={(value: unknown, name: unknown) => {
              if (name === 'currentWatt') return [`${value} W`, 'Anlık Tüketim']
              return [`${value} W`, 'Güvenli Limit']
            }}
          />
          <Bar dataKey="safeLimit" fill="var(--color-hairline)" name="safeLimit" barSize={16} />
          <Bar dataKey="currentWatt" name="currentWatt" barSize={16}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.anomalous ? '#da1e28' : entry.usage >= 80 ? '#f1c21b' : '#0f62fe'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
