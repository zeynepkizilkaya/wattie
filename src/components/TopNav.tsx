import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Plus, Zap, Moon, Sun, Bell, LayoutDashboard, Home, LogOut, User as UserIcon } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { NotificationPanel } from './NotificationPanel'
import styles from './TopNav.module.css'

interface TopNavProps {
  onAddHome?: () => void
}

export function TopNav({ onAddHome }: TopNavProps) {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [notifOpen, setNotifOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const currentUser = user || { name: 'Efe Koç', email: 'efe@wattie.io' }

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <div className={styles.leftSection}>
          <Link to="/" className={styles.brand}>
            <Zap size={18} className={styles.brandIcon} />
            <span>Wattie</span>
          </Link>
          <div className={styles.navTabs}>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? `${styles.tab} ${styles.tabActive}` : styles.tab
              }
            >
              <LayoutDashboard size={15} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/house"
              className={({ isActive }) =>
                isActive ? `${styles.tab} ${styles.tabActive}` : styles.tab
              }
            >
              <Home size={15} />
              <span>3D Akıllı Ev</span>
            </NavLink>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.themeBtn}
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Koyu tema' : 'Açık tema'}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

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

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '10px', borderLeft: '1px solid var(--color-hairline)' }}>
            <span className={styles.userName} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 500, color: 'var(--color-ink)' }}>
              <UserIcon size={14} style={{ color: 'var(--color-primary)' }} />
              {currentUser.name}
            </span>
            <button
              className={styles.logoutBtn}
              onClick={handleLogout}
              title="Çıkış Yap"
              aria-label="Çıkış Yap"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
