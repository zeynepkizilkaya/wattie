import { Zap, Calendar, DollarSign, Award, Clock } from 'lucide-react'

interface EnergyStatsProps {
  currentPower: number
  todayConsumption: number
  monthlyConsumption: number
  estimatedCost: number
  efficiencyRating: string
  peakTime: string
}

export function EnergyStats({
  currentPower,
  todayConsumption,
  monthlyConsumption,
  estimatedCost,
  efficiencyRating,
  peakTime
}: EnergyStatsProps) {
  const cards = [
    {
      title: 'Anlık Güç',
      value: `${currentPower} W`,
      sub: 'Anlık kullanım',
      icon: <Zap size={18} color="var(--color-primary)" />,
      bg: 'var(--color-surface-2)'
    },
    {
      title: 'Bugünkü Tüketim',
      value: `${todayConsumption} kWh`,
      sub: 'Günlük toplam',
      icon: <Calendar size={18} color="var(--color-semantic-success)" />,
      bg: 'var(--color-surface-2)'
    },
    {
      title: 'Aylık Tüketim',
      value: `${monthlyConsumption} kWh`,
      sub: 'Faturalama tahmini',
      icon: <Calendar size={18} color="var(--color-semantic-error)" />,
      bg: 'var(--color-surface-2)'
    },
    {
      title: 'Aylık Maliyet',
      value: `₺${estimatedCost.toFixed(2)}`,
      sub: 'Tahmini fatura',
      icon: <DollarSign size={18} color="var(--color-semantic-warning)" />,
      bg: 'var(--color-surface-2)'
    },
    {
      title: 'Verimlilik Sınıfı',
      value: efficiencyRating,
      sub: 'Enerji Etiketi',
      icon: <Award size={18} color="var(--color-primary)" />,
      bg: 'var(--color-surface-2)'
    },
    {
      title: 'Yoğun Kullanım',
      value: peakTime,
      sub: 'En yüksek yük',
      icon: <Clock size={18} color="var(--color-ink-muted)" />,
      bg: 'var(--color-surface-2)'
    }
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '0.75rem',
      marginTop: '1.25rem'
    }}>
      {cards.map((card, index) => (
        <div
          key={index}
          style={{
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-hairline)',
            borderRadius: '0px',
            padding: '0.85rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
                      }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'var(--color-ink-muted)',
            fontSize: '0.72rem',
            fontWeight: 600,
            letterSpacing: '0.03em',
            textTransform: 'uppercase'
          }}>
            <span>{card.title}</span>
            <div style={{
              display: 'flex',
              padding: '0.3rem',
              borderRadius: '0px',
              backgroundColor: card.bg
            }}>{card.icon}</div>
          </div>

          <div style={{
            fontSize: '1.2rem',
            fontWeight: 600,
            color: 'var(--color-ink)',
            marginTop: '0.1rem'
          }}>
            {card.value}
          </div>

          <div style={{
            fontSize: '0.68rem',
            color: 'var(--color-ink-muted)',
            fontWeight: 400
          }}>
            {card.sub}
          </div>
        </div>
      ))}
    </div>
  )
}
