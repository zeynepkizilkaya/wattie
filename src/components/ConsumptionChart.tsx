import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { type DailyConsumption } from '@/types/home'
import styles from './ConsumptionChart.module.css'

interface ConsumptionChartProps {
  data: DailyConsumption[]
}

export function ConsumptionChart({ data }: ConsumptionChartProps) {
  if (data.length === 0) {
    return (
      <div className={styles.empty}>Henüz geçmiş veri bulunmuyor.</div>
    )
  }

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>Günlük Tüketim Trendi</h4>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hairline)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: 'var(--color-ink-muted)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--color-hairline)' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--color-ink-muted)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--color-hairline)' }}
            unit=" kWh"
          />
          <Tooltip
            contentStyle={{
              border: '1px solid var(--color-hairline)',
              borderRadius: '0px',
              fontSize: '14px',
            }}
          />
          <Area
            type="monotone"
            dataKey="consumptionKwh"
            stroke="#0f62fe"
            fill="#0f62fe"
            fillOpacity={0.08}
            strokeWidth={2}
            name="Tüketim (kWh)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
