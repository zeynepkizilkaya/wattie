import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { type Appliance } from '@/types/home'
import { isAnomalous } from '@/utils/quota'
import styles from './ApplianceBarChart.module.css'

interface ApplianceBarChartProps {
  appliances: Appliance[]
}

export function ApplianceBarChart({ appliances }: ApplianceBarChartProps) {
  if (appliances.length === 0) return null

  const data = appliances.map(a => {
    const safeLimit = a.safeLimit || 2000
    const usage = safeLimit > 0 ? Math.round((a.currentWatt / safeLimit) * 100) : 0
    return {
      name: a.name.length > 14 ? a.name.slice(0, 14) + '…' : a.name,
      fullName: a.name,
      currentWatt: Math.round(a.currentWatt),
      safeLimit,
      usage,
      anomalous: isAnomalous(a.consecutiveBreaches) || a.currentWatt > safeLimit,
    }
  })

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>Cihaz Bazlı Tüketim</h4>
      <ResponsiveContainer width="100%" height={Math.max(200, appliances.length * 48)}>
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hairline)" horizontal={false} opacity={0.3} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: 'var(--color-ink-muted)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--color-hairline)' }}
            unit=" W"
          />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fontSize: 12, fill: 'var(--color-ink)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--color-hairline)' }}
          />
          <Tooltip
            cursor={{ fill: 'rgba(15, 98, 254, 0.12)' }}
            content={({ active, payload, label }) => {
              if (!active || !payload || !payload.length || !payload[0]) return null
              const item = payload[0].payload || {}
              return (
                <div style={{
                  background: 'var(--color-surface-1)',
                  border: '1px solid var(--color-hairline)',
                  borderRadius: '0px',
                  padding: '8px 12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  fontSize: '12px',
                  color: 'var(--color-ink)'
                }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>{item.fullName || label}</div>
                  <div style={{ color: 'var(--color-ink-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Anlık Tüketim:</span>
                    <strong style={{ color: 'var(--color-primary)', fontFamily: 'monospace' }}>{item.currentWatt} W</strong>
                  </div>
                  <div style={{ color: 'var(--color-ink-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span>Güvenli Limit:</span>
                    <strong style={{ color: 'var(--color-ink)', fontFamily: 'monospace' }}>{item.safeLimit} W</strong>
                  </div>
                </div>
              )
            }}
          />
          <Bar dataKey="currentWatt" name="currentWatt" barSize={16} radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.anomalous ? '#ef4444' : entry.usage >= 80 ? '#f59e0b' : '#38bdf8'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
