import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { type Home } from '@/types/home'
import { BASE_RATE, getPenaltyMultiplier } from '@/utils/billing'
import styles from './CostBreakdownChart.module.css'

interface CostBreakdownChartProps {
  home: Home
}

export function CostBreakdownChart({ home }: CostBreakdownChartProps) {
  if (!home.penaltyActive) return null

  const normalCost = home.totalConsumptionKwh * BASE_RATE
  const actualCost = home.billingAmountTry
  const penaltyCost = actualCost - normalCost

  if (penaltyCost <= 0) return null

  const data = [
    { name: 'Normal Tarife', value: Math.round(normalCost * 100) / 100, color: '#0f62fe' },
    { name: 'Ceza Ek Ücreti', value: Math.round(penaltyCost * 100) / 100, color: '#da1e28' },
  ]

  const multiplier = getPenaltyMultiplier(home.quotaUsagePercent)

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>Maliyet Dağılımı</h4>
      <div className={styles.chartRow}>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              dataKey="value"
              paddingAngle={0}
              stroke="none"
              strokeWidth={0}
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
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
                    <div style={{ fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>{item.name}</div>
                    <div style={{ color: 'var(--color-ink-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Tutar:</span>
                      <strong style={{ color: item.color || 'var(--color-primary)', fontFamily: 'monospace' }}>₺{Number(item.value).toFixed(2)} TL</strong>
                    </div>
                  </div>
                )
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className={styles.legend}>
          {data.map(d => (
            <div key={d.name} className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: d.color }} />
              <span className={styles.legendLabel}>{d.name}</span>
              <span className={styles.legendValue}>{d.value.toFixed(2)} ₺</span>
            </div>
          ))}
          <div className={styles.multiplierInfo}>
            Ceza çarpanı: ×{multiplier.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  )
}
