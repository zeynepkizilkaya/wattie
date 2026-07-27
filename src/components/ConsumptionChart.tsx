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
            cursor={{ stroke: 'var(--color-primary)', strokeDasharray: '3 3', strokeWidth: 1.5 }}
            content={({ active, payload, label }) => {
              if (!active || !payload || !payload.length || !payload[0]) return null
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
                  <div style={{ fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>{label}</div>
                  <div style={{ color: 'var(--color-ink-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Tüketim (kWh):</span>
                    <strong style={{ color: 'var(--color-primary)', fontFamily: 'monospace' }}>{val} kWh</strong>
                  </div>
                </div>
              )
            }}
          />
          <Area
            type="monotone"
            dataKey="totalKwh"
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
