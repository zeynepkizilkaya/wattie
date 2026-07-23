import { useEffect, useState } from 'react'
import styles from './LiveIndicator.module.css'

interface LiveIndicatorProps {
  lastUpdated: number | null
}

export function LiveIndicator({ lastUpdated }: LiveIndicatorProps) {
  const [secondsAgo, setSecondsAgo] = useState(0)

  useEffect(() => {
    if (!lastUpdated) return

    const update = () => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated) / 1000))
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [lastUpdated])

  if (!lastUpdated) return null

  return (
    <div className={styles.indicator}>
      <span className={styles.dot} />
      <span className={styles.text}>
        {secondsAgo < 3 ? 'Canlı' : `${secondsAgo} sn önce`}
      </span>
    </div>
  )
}
