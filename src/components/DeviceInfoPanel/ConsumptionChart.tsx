import React from 'react'

interface ChartDataPoint {
  time: string
  value: number
}

interface ConsumptionChartProps {
  data: ChartDataPoint[]
}

export function ConsumptionChart({ data }: ConsumptionChartProps) {
  if (!data || data.length === 0) return null

  const values = data.map((d) => d.value)
  const maxVal = Math.max(...values, 10)
  const minVal = Math.min(...values, 0)
  const range = maxVal - minVal

  const width = 280
  const height = 100
  const padding = 15

  // Map values to SVG coordinate points
  const points = data.map((d, index) => {
    const x = padding + (index * (width - 2 * padding)) / (data.length - 1)
    // Invert Y coordinate since SVG Y grows downwards
    const y = height - padding - ((d.value - minVal) / range) * (height - 2 * padding)
    return { x, y }
  })

  // Create path strings
  const pathData = points.reduce(
    (acc, p, index) => (index === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ''
  )

  // Gradient area path string
  const lastPoint = points[points.length - 1]
  const firstPoint = points[0]
  const areaData = points.length > 0 && lastPoint && firstPoint 
    ? `${pathData} L ${lastPoint.x} ${height - padding} L ${firstPoint.x} ${height - padding} Z` 
    : ''

  return (
    <div style={{
      marginTop: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.65rem',
      background: 'var(--color-surface-2)',
      border: '1px solid var(--color-hairline)',
      borderRadius: '0px',
      padding: '1.1rem'
    }}>
      <div style={{
        fontSize: '0.78rem',
        fontWeight: 600,
        color: 'var(--color-ink-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em'
      }}>
        Son Yük Tüketimi Trendi (W)
      </div>

      <div style={{
        position: 'relative',
        width: '100%',
        height: `${height}px`,
        marginTop: '0.35rem'
      }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f62fe" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0f62fe" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="var(--color-hairline)"
            strokeWidth={1}
          />
          <line
            x1={padding}
            y1={padding}
            x2={width - padding}
            y2={padding}
            stroke="var(--color-hairline)"
            strokeWidth={1}
            strokeDasharray="4 4"
          />

          {/* Area fill */}
          <path d={areaData} fill="url(#chartGlow)" />

          {/* Path line */}
          <path
            d={pathData}
            fill="none"
            stroke="#0f62fe"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points dots */}
          {points.map((p, index) => (
            <circle
              key={index}
              cx={p.x}
              cy={p.y}
              r={3}
              fill="#fff"
              stroke="#0f62fe"
              strokeWidth={1.5}
            />
          ))}
        </svg>
      </div>

      {/* X Axis Time Labels */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 0.5rem',
        fontSize: '0.65rem',
        color: 'var(--color-ink-muted)',
        fontWeight: 600
      }}>
        {data.map((d, index) => (
          <span key={index}>{d.time}</span>
        ))}
      </div>
    </div>
  )
}
