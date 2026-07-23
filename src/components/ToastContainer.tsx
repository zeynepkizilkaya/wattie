import { useToast } from '@/hooks/useToast'
import styles from './ToastContainer.module.css'

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className={styles.container} aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
          <span className={styles.message}>{toast.message}</span>
          <button
            className={styles.dismiss}
            onClick={() => removeToast(toast.id)}
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
