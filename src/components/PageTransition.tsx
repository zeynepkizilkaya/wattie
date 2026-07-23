import { type ReactNode } from 'react'
import styles from './PageTransition.module.css'

interface PageTransitionProps {
  children: ReactNode
  delay?: 0 | 1 | 2 | 3 | 4
}

const STAGGER: Record<number, string> = {
  0: '',
  1: styles.stagger1 ?? '',
  2: styles.stagger2 ?? '',
  3: styles.stagger3 ?? '',
  4: styles.stagger4 ?? '',
}

export function PageTransition({ children, delay = 0 }: PageTransitionProps) {
  return (
    <div className={`${styles.enter} ${STAGGER[delay]}`}>
      {children}
    </div>
  )
}
