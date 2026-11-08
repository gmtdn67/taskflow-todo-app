import { Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import type { TaskMutationResult } from '../../types/task'
import { TITLE_MAX_LENGTH, titleErrorMessage } from '../../utils/task'
import styles from './TaskForm.module.css'

type TaskFormProps = {
  onAdd: (title: string) => TaskMutationResult
}

export function TaskForm({ onAdd }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = onAdd(title)

    if (!result.ok) {
      if (result.reason === 'empty' || result.reason === 'too_long') {
        setError(titleErrorMessage(result.reason))
      }
      return
    }

    setTitle('')
    setError(null)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.row}>
        <label className="sr-only" htmlFor="task-title">
          Новая задача
        </label>
        <input
          id="task-title"
          className={error ? `${styles.input} ${styles.invalid}` : styles.input}
          value={title}
          maxLength={TITLE_MAX_LENGTH}
          placeholder="Что нужно сделать сегодня?"
          autoComplete="off"
          enterKeyHint="done"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'task-title-error' : 'task-title-hint'}
          onChange={(event) => {
            setTitle(event.target.value)
            if (error) setError(null)
          }}
        />
        <button className={styles.submit} type="submit">
          <Plus size={18} strokeWidth={2.4} aria-hidden="true" />
          <span className={styles.submitText}>Добавить</span>
        </button>
      </div>
      {error ? (
        <p id="task-title-error" className={styles.error} role="alert">
          {error}
        </p>
      ) : (
        <p id="task-title-hint" className={styles.meta}>
          Enter — чтобы добавить · до {TITLE_MAX_LENGTH} символов
        </p>
      )}
    </form>
  )
}
