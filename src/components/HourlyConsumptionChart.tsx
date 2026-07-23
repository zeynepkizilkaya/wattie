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
            contentStyle={{ border: '1px solid var(--color-hairline)', borderRadius: '0px', fontSize: '13px' }}
            formatter={(value: unknown) => [`${Number(value).toFixed(0)} Wh`, 'Tüketim']}
            labelFormatter={(h: unknown) => `${String(h).padStart(2, '0')}:00`}
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
