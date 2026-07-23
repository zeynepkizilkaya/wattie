import { useState, useEffect, useRef, memo } from 'react'
import styles from './AnimatedSparklineSVG.module.css'

const WIDTH = 400
const HEIGHT = 100
const MAX_POINTS = 30

function generateValue(base: number): number {
  return base + (Math.random() - 0.5) * 400
}

function pointsToPath(points: number[]): string {
  if (points.length < 2) return ''
  const step = WIDTH / (MAX_POINTS - 1)
  let d = `M 0 ${points[0]}`
  for (let i = 1; i < points.length; i++) {
    const x = i * step
    const prev = points[i - 1]
    const curr = points[i]
    const cpx1 = (i - 0.5) * step
    d += ` C ${cpx1} ${prev} ${cpx1} ${curr} ${x} ${curr}`
  }
  return d
}

function pointsToFillPath(points: number[]): string {
  const line = pointsToPath(points)
  if (!line) return ''
  const lastX = (points.length - 1) * (WIDTH / (MAX_POINTS - 1))
  return `${line} L ${lastX} ${HEIGHT} L 0 ${HEIGHT} Z`
}

function AnimatedSparklineSVGInner() {
  const baseWatt = 2847
  const [points, setPoints] = useState<number[]>(() => {
    const initial: number[] = []
    for (let i = 0; i < MAX_POINTS; i++) {
      const val = generateValue(baseWatt)
      const y = HEIGHT - ((val - 2000) / 1600) * HEIGHT
      initial.push(Math.max(5, Math.min(HEIGHT - 5, y)))
    }
    return initial
  })
  const [currentWatt, setCurrentWatt] = useState(baseWatt)
  const [delta, setDelta] = useState(12)
  const prevWattRef = useRef(baseWatt)

  useEffect(() => {
    const interval = setInterval(() => {
      const newVal = generateValue(baseWatt)
      const y = HEIGHT - ((newVal - 2000) / 1600) * HEIGHT
      const clampedY = Math.max(5, Math.min(HEIGHT - 5, y))

      setPoints(prev => {
        const next = [...prev.slice(1), clampedY]
        return next
      })

      const newWatt = Math.round(newVal)
      setCurrentWatt(newWatt)

      const prev = prevWattRef.current
      if (prev > 0) {
        const pct = Math.round(((newWatt - prev) / prev) * 100)
        setDelta(pct)
      }
      prevWattRef.current = newWatt
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const linePath = pointsToPath(points)
  const fillPath = pointsToFillPath(points)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.labelValue}>{currentWatt.toLocaleString('tr-TR')}</span>
          <span className={styles.labelUnit}>W anlık yük</span>
        </div>
        <div className={styles.headerRight}>
          <span className={delta >= 0 ? styles.deltaUp : styles.deltaDown}>
            {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}%
          </span>
          <span className={styles.deltaLabel}>değişim</span>
        </div>
      </div>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
      >
        {Array.from({ length: 5 }, (_, i) => (
          <line
            key={i}
            x1="0"
            y1={HEIGHT * ((i + 1) / 6)}
            x2={WIDTH}
            y2={HEIGHT * ((i + 1) / 6)}
            className={styles.gridLine}
          />
        ))}

        <path d={fillPath} className={styles.fill} />
        <path d={linePath} className={styles.line1} />
      </svg>
      <div className={styles.xAxis}>
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>Şimdi</span>
      </div>
    </div>
  )
}

export const AnimatedSparklineSVG = memo(AnimatedSparklineSVGInner)
