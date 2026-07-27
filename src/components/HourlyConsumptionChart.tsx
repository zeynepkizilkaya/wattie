import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'
import styles from './HourlyConsumptionChart.module.css'

interface HourlyConsumptionChartProps {
  data: Array<{ hour: number; consumptionWh: number }>
}

export function HourlyConsumptionChart({ data }: HourlyConsumptionChartProps) {
  if (data.length === 0) return null

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>Saatlik Tüketim Dağılımı</h4>
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendDotNight} />
          Gece (22:00-06:00)
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDotDay} />
          Gündüz
        </span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hairline)" vertical={false} />
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 11, fill: 'var(--color-ink-muted)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--color-hairline)' }}
            tickFormatter={(h: number) => `${String(h).padStart(2, '0')}`}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--color-ink-muted)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--color-hairline)' }}
            unit=" Wh"
          />
          <Tooltip
            cursor={{ fill: 'rgba(15, 98, 254, 0.12)' }}
            content={({ active, payload, label }) => {
              if (!active || !payload || !payload.length || !payload[0]) return null
              const hourStr = `${String(label).padStart(2, '0')}:00`
              const val = payload[0].value
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
                  <div style={{ fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>Saat: {hourStr}</div>
                  <div style={{ color: 'var(--color-ink-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Tüketim:</span>
                    <strong style={{ color: 'var(--color-primary)', fontFamily: 'monospace' }}>{Number(val).toFixed(0)} Wh</strong>
                  </div>
                </div>
              )
            }}
          />
          <ReferenceLine x={6} stroke="var(--color-semantic-warning)" strokeDasharray="3 3" strokeWidth={1} />
          <ReferenceLine x={22} stroke="var(--color-semantic-warning)" strokeDasharray="3 3" strokeWidth={1} />
          <Bar dataKey="consumptionWh" barSize={10}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.hour >= 22 || entry.hour < 6 ? '#24a148' : '#0f62fe'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
