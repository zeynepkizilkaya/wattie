import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, AlertOctagon, Lightbulb, Info } from 'lucide-react'
import { api } from '@/services/api'
import { type Notification } from '@/types/home'
import { useToast } from '@/hooks/useToast'
import styles from './NotificationPanel.module.css'

interface NotificationPanelProps {
  open: boolean
  onClose: () => void
  onCountChange: (count: number) => void
}

export function NotificationPanel({ open, onClose, onCountChange }: NotificationPanelProps) {
  const { addToast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await api.getNotifications(0, 50)
      setNotifications(data.content)
      onCountChange(data.content.filter(n => !n.read).length)
    } catch {
      // silent fail for notifications
    } finally {
      setLoading(false)
    }
  }, [onCountChange])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 10000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id)
      setNotifications(prev => {
        const updated = prev.map(n => n.id === id ? { ...n, read: true } : n)
        onCountChange(updated.filter(n => !n.read).length)
        return updated
      })
    } catch {
      addToast('Bildirim güncellenemedi.', 'error')
    }
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'quota_warning': return <AlertTriangle size={14} />
      case 'quota_breach': return <AlertOctagon size={14} />
      case 'anomaly': return <AlertOctagon size={14} />
      case 'recommendation': return <Lightbulb size={14} />
      default: return <Info size={14} />
    }
  }

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'Az önce'
    if (minutes < 60) return `${minutes} dk önce`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} saat önce`
    return `${Math.floor(hours / 24)} gün önce`
  }

  if (!open) return null

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <div className={styles.panel}>
        <div className={styles.header}>
          <h3 className={styles.title}>Bildirimler</h3>
          <span className={styles.count}>
            {notifications.filter(n => !n.read).length} okunmamış
          </span>
        </div>
        <div className={styles.list}>
          {loading && <div className={styles.loading}>Yükleniyor...</div>}
          {!loading && notifications.length === 0 && (
            <div className={styles.empty}>Bildirim bulunmuyor.</div>
          )}
          {notifications.map(notification => (
            <button
              key={notification.id}
              className={`${styles.item} ${!notification.read ? styles.unread : ''} ${styles[`type_${notification.type}`]}`}
              onClick={() => handleMarkRead(notification.id)}
            >
              <div className={styles.itemIcon}>
                {getIcon(notification.type)}
              </div>
              <div className={styles.itemContent}>
                <span className={styles.itemHome}>{notification.homeName}</span>
                <p className={styles.itemMessage}>{notification.message}</p>
                <span className={styles.itemTime}>{getTimeAgo(notification.createdAt)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
