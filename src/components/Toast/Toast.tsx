import { X } from 'lucide-react'
import type { ToastItem } from '../../hooks/useToasts'
import styles from './Toast.module.css'

type ToastViewportProps = {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  return (
    <div className={styles.region} aria-live="polite" aria-relevant="additions">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={toast.tone === 'danger' ? styles.danger : styles.toast}
          role="status"
        >
          <p className={styles.message}>{toast.message}</p>
          <button
            type="button"
            className={styles.close}
            aria-label="Закрыть уведомление"
            onClick={() => onDismiss(toast.id)}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
