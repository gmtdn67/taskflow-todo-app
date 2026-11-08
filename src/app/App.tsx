import { Calendar } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { ConfirmDialog } from '../components/ConfirmDialog/ConfirmDialog'
import { Header } from '../components/Header/Header'
import { ProgressBar } from '../components/ProgressBar/ProgressBar'
import { TaskFilters } from '../components/TaskFilters/TaskFilters'
import { TaskForm } from '../components/TaskForm/TaskForm'
import { TaskList } from '../components/TaskList/TaskList'
import { TaskStats } from '../components/TaskStats/TaskStats'
import { ToastViewport } from '../components/Toast/Toast'
import { useTasks } from '../hooks/useTasks'
import { useToasts, type ToastTone } from '../hooks/useToasts'
import type { TaskFilter, TaskMutationResult } from '../types/task'
import { formatLongDate } from '../utils/date'
import { normalizeSearch } from '../utils/text'
import { filterTasks, getTaskStats } from '../utils/task'
import styles from './App.module.css'

function notify(
  push: (message: string, tone?: ToastTone) => void,
  saved: boolean,
  message: string,
) {
  if (saved) {
    push(message)
    return
  }

  push('Изменение не сохранилось на устройстве', 'danger')
}

export default function App() {
  const { tasks, status, notice, addTask, toggleTask, deleteTask, editTask, clearCompleted } =
    useTasks()
  const { toasts, push, dismiss } = useToasts(notice)
  const [filter, setFilter] = useState<TaskFilter>('all')
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const stats = useMemo(() => getTaskStats(tasks), [tasks])
  const visibleTasks = useMemo(() => filterTasks(tasks, filter, query), [tasks, filter, query])
  const todayLabel = formatLongDate(new Date())

  const handleAdd = useCallback(
    (title: string): TaskMutationResult => {
      const result = addTask(title)
      if (!result.ok) return result

      const normalizedQuery = normalizeSearch(query)
      if (filter === 'completed') setFilter('all')
      if (normalizedQuery && !normalizeSearch(title).includes(normalizedQuery)) setQuery('')

      notify(push, result.saved, 'Задача добавлена')
      return result
    },
    [addTask, filter, push, query],
  )

  const handleToggle = useCallback(
    (id: string) => {
      const result = toggleTask(id)
      if (!result.ok) return
      notify(push, result.saved, result.completed ? 'Задача выполнена' : 'Отметка снята')
    },
    [push, toggleTask],
  )

  const handleDelete = useCallback(
    (id: string) => {
      const result = deleteTask(id)
      if (!result.ok) return
      setEditingId((current) => (current === id ? null : current))
      notify(push, result.saved, 'Задача удалена')
    },
    [deleteTask, push],
  )

  const handleSave = useCallback(
    (id: string, title: string): TaskMutationResult => {
      const result = editTask(id, title)
      if (!result.ok) return result

      setEditingId((current) => (current === id ? null : current))
      if (!result.unchanged) notify(push, result.saved, 'Задача обновлена')
      return result
    },
    [editTask, push],
  )

  const handleFilterChange = (next: TaskFilter) => {
    setFilter(next)
    setEditingId(null)
  }

  const closeConfirm = useCallback(() => setConfirmOpen(false), [])

  const handleClearCompleted = () => {
    const result = clearCompleted()
    setConfirmOpen(false)
    if (!result.ok) return
    notify(push, result.saved, 'Выполненные задачи удалены')
  }

  const progressText =
    stats.total === 0
      ? 'Добавьте задачу, чтобы увидеть прогресс'
      : `Выполнено ${stats.completed} из ${stats.total}`

  return (
    <>
      <Header status={status} />
      <main className={styles.main} id="tasks">
        <div className={styles.card}>
          <div className={styles.intro}>
            <div>
              <h1 className={styles.title}>Ваши задачи</h1>
              <p className={styles.date}>
                <Calendar size={16} aria-hidden="true" />
                <time dateTime={new Date().toISOString().slice(0, 10)}>{todayLabel}</time>
              </p>
            </div>
            <section className={styles.progressCard} aria-label="Прогресс">
              <div className={styles.progressTop}>
                <div>
                  <p className={styles.progressLabel}>Прогресс</p>
                  <p className={styles.progressHint}>{progressText}</p>
                </div>
                <p className={stats.percent === 100 ? styles.percentDone : styles.percent}>
                  {stats.percent}%
                </p>
              </div>
              <ProgressBar percent={stats.percent} />
            </section>
          </div>

          <TaskForm onAdd={handleAdd} />

          <TaskFilters
            filter={filter}
            query={query}
            visibleCount={visibleTasks.length}
            totalCount={stats.total}
            completedCount={stats.completed}
            onFilterChange={handleFilterChange}
            onQueryChange={(value) => {
              setQuery(value)
              setEditingId(null)
            }}
            onClearCompleted={() => setConfirmOpen(true)}
          />

          <TaskList
            tasks={visibleTasks}
            hasAnyTasks={tasks.length > 0}
            filter={filter}
            query={query}
            editingId={editingId}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onStartEdit={setEditingId}
            onCancelEdit={() => setEditingId(null)}
            onSave={handleSave}
          />

          <TaskStats stats={stats} />
        </div>
      </main>

      <ToastViewport toasts={toasts} onDismiss={dismiss} />
      <ConfirmDialog
        open={confirmOpen}
        count={stats.completed}
        onClose={closeConfirm}
        onConfirm={handleClearCompleted}
      />
    </>
  )
}
