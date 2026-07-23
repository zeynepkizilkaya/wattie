import styles from './Skeleton.module.css'

export function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={styles.line} style={{ width: '60%', height: '24px' }} />
      <div className={styles.row}>
        <div className={styles.line} style={{ width: '80px', height: '32px' }} />
        <div className={styles.line} style={{ width: '100px', height: '32px' }} />
        <div className={styles.line} style={{ width: '90px', height: '32px' }} />
      </div>
      <div className={styles.line} style={{ width: '100%', height: '4px' }} />
    </div>
  )
}
