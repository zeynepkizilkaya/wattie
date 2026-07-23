import { useEffect, useRef, useState } from 'react'
import styles from './AnimatedValue.module.css'

interface AnimatedValueProps {
  value: string
  className?: string
}

export function AnimatedValue({ value, className = '' }: AnimatedValueProps) {
  const prevRef = useRef(value)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (prevRef.current !== value) {
      prevRef.current = value
      setFlash(true)
      const id = setTimeout(() => setFlash(false), 600)
      return () => clearTimeout(id)
    }
  }, [value])

  return (
    <span className={`${className} ${flash ? styles.flash : ''}`}>
      {value}
    </span>
  )
}
