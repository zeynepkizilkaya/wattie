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
              strokeWidth={0}
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ border: '1px solid var(--color-hairline)', borderRadius: '0px', fontSize: '13px' }}
              formatter={(value: unknown) => [`${Number(value).toFixed(2)} ₺`]}
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
