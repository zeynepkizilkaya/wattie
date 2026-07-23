import { Link } from 'react-router-dom'
import { TopNav } from '@/components/TopNav'
import styles from './NotFound.module.css'

export function NotFound() {
  return (
    <>
    <TopNav />
    <div className={styles.page}>
      <h1 className={styles.code}>404</h1>
      <p className={styles.message}>Aradığınız sayfa bulunamadı.</p>
      <Link to="/" className={styles.link}>Panele Dön</Link>
    </div>
    </>
  )
}
