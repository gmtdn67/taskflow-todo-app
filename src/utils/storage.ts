import type { Task } from '../types/task'
import { sortTasksNewestFirst } from './task'

export const STORAGE_KEY = 'taskflow_tasks_v1'

export type StorageStatus = 'ok' | 'empty' | 'partial' | 'corrupt' | 'read_error'

export type LoadResult = {
  tasks: Task[]
  status: StorageStatus
}

type TaskStorage = Pick<Storage, 'getItem' | 'setItem'>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isTask(value: unknown): value is Task {
  if (!isRecord(value)) return false

  return (
    typeof value.id === 'string' &&
    value.id.trim().length > 0 &&
    typeof value.title === 'string' &&
    value.title.trim().length > 0 &&
    typeof value.completed === 'boolean' &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string' &&
    !Number.isNaN(Date.parse(value.createdAt)) &&
    !Number.isNaN(Date.parse(value.updatedAt))
  )
}

export function parseStoredTasks(raw: string | null): LoadResult {
  if (raw === null) return { tasks: [], status: 'empty' }

  try {
    const parsed: unknown = JSON.parse(raw)

    if (!Array.isArray(parsed)) return { tasks: [], status: 'corrupt' }
    if (parsed.length === 0) return { tasks: [], status: 'ok' }

    const tasks = sortTasksNewestFirst(parsed.filter(isTask))

    if (tasks.length === parsed.length) return { tasks, status: 'ok' }
    if (tasks.length === 0) return { tasks: [], status: 'corrupt' }

    return { tasks, status: 'partial' }
  } catch {
    return { tasks: [], status: 'corrupt' }
  }
}

export function storageNotice(status: StorageStatus): string | null {
  switch (status) {
    case 'partial':
      return 'Часть сохранённых задач была повреждена и пропущена.'
    case 'corrupt':
      return 'Сохранённые данные повреждены. Список задач начат заново.'
    case 'read_error':
      return 'Не удалось прочитать локальные данные.'
    case 'ok':
    case 'empty':
      return null
    default: {
      const unreachable: never = status
      return unreachable
    }
  }
}

export function readTasks(storage: Pick<TaskStorage, 'getItem'>): LoadResult {
  try {
    return parseStoredTasks(storage.getItem(STORAGE_KEY))
  } catch {
    return { tasks: [], status: 'read_error' }
  }
}

export function writeTasks(storage: Pick<TaskStorage, 'setItem'>, tasks: readonly Task[]): boolean {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    return true
  } catch {
    return false
  }
}

export function loadTasksFromBrowser(): LoadResult {
  try {
    if (typeof localStorage === 'undefined') return { tasks: [], status: 'read_error' }
    return readTasks(localStorage)
  } catch {
    return { tasks: [], status: 'read_error' }
  }
}

export function saveTasksToBrowser(tasks: readonly Task[]): boolean {
  try {
    if (typeof localStorage === 'undefined') return false
    return writeTasks(localStorage, tasks)
  } catch {
    return false
  }
}
