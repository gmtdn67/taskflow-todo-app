import type { Task, TaskFilter, TaskStats, TitleError, TaskListResult, TitleValidationResult } from '../types/task'
import { normalizeSearch } from './text'

export const TITLE_MAX_LENGTH = 200

export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function normalizeTitle(
  title: string,
): TitleValidationResult {
  const value = title.trim()

  if (!value) return { ok: false, reason: 'empty' }
  if (value.length > TITLE_MAX_LENGTH) return { ok: false, reason: 'too_long' }

  return { ok: true, value }
}

export function titleErrorMessage(reason: TitleError): string {
  if (reason === 'empty') return 'Введите название задачи'
  return `Название не должно быть длиннее ${TITLE_MAX_LENGTH} символов`
}

export function createTask(title: string, meta: { id: string; now: Date }): Task {
  const timestamp = meta.now.toISOString()

  return {
    id: meta.id,
    title,
    completed: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

export function sortTasksNewestFirst(tasks: readonly Task[]): Task[] {
  return [...tasks].sort((left, right) => {
    const byDate = right.createdAt.localeCompare(left.createdAt)
    if (byDate !== 0) return byDate
    return right.id.localeCompare(left.id)
  })
}

export function addTask(
  tasks: readonly Task[],
  title: string,
  meta: { id: string; now: Date },
): TaskListResult {
  const normalized = normalizeTitle(title)

  if (normalized.ok === false) {
    return { ok: false, reason: normalized.reason }
  }

  return {
    ok: true,
    tasks: sortTasksNewestFirst([createTask(normalized.value, meta), ...tasks]),
  }
}

export function toggleTask(tasks: readonly Task[], id: string, now: Date): Task[] {
  return tasks.map((task) =>
    task.id === id
      ? { ...task, completed: !task.completed, updatedAt: now.toISOString() }
      : task,
  )
}

export function deleteTask(tasks: readonly Task[], id: string): Task[] {
  return tasks.filter((task) => task.id !== id)
}

export function updateTask(
  tasks: readonly Task[],
  id: string,
  title: string,
  now: Date,
): TaskListResult {
  const normalized = normalizeTitle(title)

  if (normalized.ok === false) {
    return { ok: false, reason: normalized.reason }
  }

  const exists = tasks.some((task) => task.id === id)
  if (!exists) return { ok: false, reason: 'missing' }

  const next = tasks.map((task) =>
    task.id === id ? { ...task, title: normalized.value, updatedAt: now.toISOString() } : task,
  )

  return { ok: true, tasks: sortTasksNewestFirst(next) }
}

export function clearCompleted(tasks: readonly Task[]): Task[] {
  return tasks.filter((task) => !task.completed)
}

export function filterTasks(
  tasks: readonly Task[],
  filter: TaskFilter,
  query: string,
): Task[] {
  const normalizedQuery = normalizeSearch(query)

  return tasks.filter((task) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && !task.completed) ||
      (filter === 'completed' && task.completed)

    if (!matchesFilter) return false
    if (!normalizedQuery) return true

    return normalizeSearch(task.title).includes(normalizedQuery)
  })
}

export function getTaskStats(tasks: readonly Task[]): TaskStats {
  const total = tasks.length
  const completed = tasks.filter((task) => task.completed).length
  const remaining = total - completed
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)

  return { total, completed, remaining, percent }
}
