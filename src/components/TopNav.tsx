import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, LogOut, Zap, Moon, Sun, Bell } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { NotificationPanel } from './NotificationPanel'
import styles from './TopNav.module.css'

interface TopNavProps {
  onAddHome?: () => void
}

export function TopNav({ onAddHome }: TopNavProps) {
  const { user, logout, isAuthenticated } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [notifOpen, setNotifOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          <Zap size={18} className={styles.brandIcon} />
          <span>Wattie</span>
        </Link>

        <div className={styles.actions}>
          <button
            className={styles.themeBtn}
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Koyu tema' : 'Açık tema'}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {isAuthenticated && (
            <>
              <div className={styles.notifWrapper}>
                <button
                  className={styles.notifBtn}
                  onClick={() => setNotifOpen(prev => !prev)}
                  aria-label="Bildirimler"
                >
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span className={styles.notifBadge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </button>
                <NotificationPanel
                  open={notifOpen}
                  onClose={() => setNotifOpen(false)}
                  onCountChange={setUnreadCount}
                />
              </div>
              {onAddHome && (
                <button className={styles.addButton} onClick={onAddHome}>
                  <Plus size={14} />
                  <span>Konut Ekle</span>
                </button>
              )}
              <span className={styles.userName}>{user?.name}</span>
              <button className={styles.logoutBtn} onClick={handleLogout} aria-label="Çıkış">
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
