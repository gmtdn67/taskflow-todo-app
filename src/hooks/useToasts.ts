import { useCallback, useEffect, useRef, useState } from 'react'
import { createId } from '../utils/task'

export type ToastTone = 'success' | 'danger'

export type ToastItem = {
  id: string
  message: string
  tone: ToastTone
}

const TOAST_LIMIT = 3
const TOAST_DURATION = 3400

export function useToasts(initialNotice: string | null): {
  toasts: ToastItem[]
  push: (message: string, tone?: ToastTone) => void
  dismiss: (id: string) => void
} {
  const [toasts, setToasts] = useState<ToastItem[]>(() =>
    initialNotice ? [{ id: 'storage-notice', message: initialNotice, tone: 'danger' }] : [],
  )
  const timers = useRef(new Map<string, number>())

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
    const timer = timers.current.get(id)
    if (timer !== undefined) {
      window.clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const push = useCallback(
    (message: string, tone: ToastTone = 'success') => {
      const id = createId()
      setToasts((current) => [...current, { id, message, tone }].slice(-TOAST_LIMIT))
      const timer = window.setTimeout(() => dismiss(id), TOAST_DURATION)
      timers.current.set(id, timer)
    },
    [dismiss],
  )

  useEffect(() => {
    if (!initialNotice) return undefined

    const timer = window.setTimeout(() => dismiss('storage-notice'), TOAST_DURATION)
    timers.current.set('storage-notice', timer)

    return () => {
      window.clearTimeout(timer)
      timers.current.delete('storage-notice')
    }
  }, [dismiss, initialNotice])

  useEffect(() => {
    const activeTimers = timers.current

    return () => {
      activeTimers.forEach((timer) => window.clearTimeout(timer))
      activeTimers.clear()
    }
  }, [])

  return { toasts, push, dismiss }
}
