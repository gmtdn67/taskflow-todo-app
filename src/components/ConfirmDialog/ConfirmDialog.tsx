import { useEffect, useRef } from 'react'
import { pluralize } from '../../utils/text'
import styles from './ConfirmDialog.module.css'

type ConfirmDialogProps = {
  open: boolean
  count: number
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({ open, count, onConfirm, onClose }: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return undefined

    const previouslyFocused = document.activeElement
    cancelRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button')
      if (!focusable || focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first || !last) return

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [open, onClose])

  if (!open) return null

  const adjective = pluralize(count, ['выполненную', 'выполненные', 'выполненных'])
  const noun = pluralize(count, ['задачу', 'задачи', 'задач'])

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-text"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-title" className={styles.title}>
          Удалить {count} {adjective} {noun}?
        </h2>
        <p id="confirm-text" className={styles.text}>
          Это действие нельзя отменить. Активные задачи останутся в списке.
        </p>
        <div className={styles.actions}>
          <button ref={cancelRef} type="button" className={styles.cancel} onClick={onClose}>
            Отмена
          </button>
          <button type="button" className={styles.confirm} onClick={onConfirm}>
            Удалить
          </button>
        </div>
      </div>
    </div>
  )
}
