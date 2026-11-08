import { Calendar, Check, Pencil, Trash2 } from 'lucide-react'
import { memo, useEffect, useRef, useState, type FormEvent } from 'react'
import type { Task, TaskMutationResult } from '../../types/task'
import { formatTaskDate } from '../../utils/date'
import { TITLE_MAX_LENGTH, titleErrorMessage } from '../../utils/task'
import styles from './TaskItem.module.css'

type TaskItemProps = {
  task: Task
  isEditing: boolean
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onStartEdit: (id: string) => void
  onCancelEdit: () => void
  onSave: (id: string, title: string) => TaskMutationResult
}

type EditFormProps = {
  taskId: string
  initialTitle: string
  onSave: (title: string) => TaskMutationResult
  onCancel: () => void
}

function EditForm({ taskId, initialTitle, onSave, onCancel }: EditFormProps) {
  const [draft, setDraft] = useState(initialTitle)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = onSave(draft)

    if (!result.ok && (result.reason === 'empty' || result.reason === 'too_long')) {
      setError(titleErrorMessage(result.reason))
    }
  }

  return (
    <form className={styles.editor} onSubmit={handleSubmit}>
      <div className={styles.editRow}>
        <label className="sr-only" htmlFor={`edit-${taskId}`}>
          Название задачи
        </label>
        <input
          ref={inputRef}
          id={`edit-${taskId}`}
          className={styles.editInput}
          value={draft}
          maxLength={TITLE_MAX_LENGTH}
          aria-label="Название задачи"
          aria-invalid={error ? true : undefined}
          onChange={(event) => {
            setDraft(event.target.value)
            if (error) setError(null)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault()
              onCancel()
            }
          }}
        />
        <button className={styles.save} type="submit">
          Сохранить
        </button>
        <button className={styles.cancel} type="button" onClick={onCancel}>
          Отмена
        </button>
      </div>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </form>
  )
}

export const TaskItem = memo(function TaskItem({
  task,
  isEditing,
  onToggle,
  onDelete,
  onStartEdit,
  onCancelEdit,
  onSave,
}: TaskItemProps) {
  const [leaving, setLeaving] = useState(false)
  const removed = useRef(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
  }, [])

  const requestDelete = () => {
    if (removed.current || leaving) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      removed.current = true
      onDelete(task.id)
      return
    }

    setLeaving(true)
    timerRef.current = window.setTimeout(() => {
      if (removed.current) return
      removed.current = true
      onDelete(task.id)
    }, 180)
  }

  const itemClass = [styles.item, task.completed ? styles.completed : '', leaving ? styles.leaving : '']
    .filter(Boolean)
    .join(' ')

  return (
    <li className={itemClass}>
      <label className={styles.check}>
        <input
          type="checkbox"
          checked={task.completed}
          aria-label={
            task.completed
              ? `Снять отметку с «${task.title}»`
              : `Отметить «${task.title}» выполненной`
          }
          onChange={() => onToggle(task.id)}
        />
        <span className={styles.box} aria-hidden="true">
          <Check size={14} strokeWidth={3} />
        </span>
      </label>

      {isEditing ? (
        <EditForm
          taskId={task.id}
          initialTitle={task.title}
          onCancel={onCancelEdit}
          onSave={(title) => onSave(task.id, title)}
        />
      ) : (
        <>
          <div className={styles.content}>
            <p className={styles.title}>{task.title}</p>
            <p className={styles.meta}>
              <Calendar size={14} aria-hidden="true" />
              <span>Создано {formatTaskDate(task.createdAt)}</span>
            </p>
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.iconButton}
              aria-label={`Редактировать «${task.title}»`}
              onClick={() => onStartEdit(task.id)}
            >
              <Pencil size={16} />
            </button>
            <button
              type="button"
              className={styles.dangerButton}
              aria-label={`Удалить «${task.title}»`}
              onClick={requestDelete}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </>
      )}
    </li>
  )
})
