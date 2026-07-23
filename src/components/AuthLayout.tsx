import { Outlet, useLocation } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { EnergyIllustration } from './EnergyIllustration'
import styles from '../pages/Auth.module.css'

export function AuthLayout() {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className={styles.page}>
      <div className={styles.illustrationSide}>
        <EnergyIllustration />
      </div>
      <div className={styles.formAnimWrapper}>
        <button
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Koyu tema' : 'Açık tema'}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
        <div key={location.pathname} style={{ width: '100%' }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
