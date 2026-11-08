import { useCallback, useRef } from 'react'
import type { Task, TaskMutationResult } from '../types/task'
import { useLocalStorage } from './useLocalStorage'
import {
  addTask as insertTask,
  clearCompleted as removeCompleted,
  createId,
  deleteTask as removeTask,
  normalizeTitle,
  toggleTask as switchTask,
  updateTask as replaceTaskTitle,
} from '../utils/task'
import { storageNotice, type StorageStatus } from '../utils/storage'

export function useTasks(): {
  tasks: Task[]
  status: StorageStatus
  notice: string | null
  addTask: (title: string) => TaskMutationResult
  toggleTask: (id: string) => TaskMutationResult
  deleteTask: (id: string) => TaskMutationResult
  editTask: (id: string, title: string) => TaskMutationResult
  clearCompleted: () => TaskMutationResult
} {
  const { tasks, persist, snapshot } = useLocalStorage()
  const tasksRef = useRef(tasks)
  tasksRef.current = tasks

  const apply = useCallback(
    (next: Task[]) => {
      tasksRef.current = next
      return persist(next)
    },
    [persist],
  )

  const addTask = useCallback(
    (title: string): TaskMutationResult => {
      const result = insertTask(tasksRef.current, title, { id: createId(), now: new Date() })
      if (!result.ok) return result

      return { ok: true, saved: apply(result.tasks) }
    },
    [apply],
  )

  const toggleTask = useCallback(
    (id: string): TaskMutationResult => {
      const current = tasksRef.current.find((task) => task.id === id)
      if (!current) return { ok: false, reason: 'missing' }

      const saved = apply(switchTask(tasksRef.current, id, new Date()))
      return { ok: true, saved, completed: !current.completed }
    },
    [apply],
  )

  const deleteTask = useCallback(
    (id: string): TaskMutationResult => {
      const exists = tasksRef.current.some((task) => task.id === id)
      if (!exists) return { ok: false, reason: 'missing' }

      return { ok: true, saved: apply(removeTask(tasksRef.current, id)) }
    },
    [apply],
  )

  const editTask = useCallback(
    (id: string, title: string): TaskMutationResult => {
      const current = tasksRef.current.find((task) => task.id === id)
      if (!current) return { ok: false, reason: 'missing' }

      const normalized = normalizeTitle(title)
      if (!normalized.ok) return normalized
      if (normalized.value === current.title) return { ok: true, saved: true, unchanged: true }

      const result = replaceTaskTitle(tasksRef.current, id, normalized.value, new Date())
      if (!result.ok) return result

      return { ok: true, saved: apply(result.tasks) }
    },
    [apply],
  )

  const clearCompleted = useCallback((): TaskMutationResult => {
    return { ok: true, saved: apply(removeCompleted(tasksRef.current)) }
  }, [apply])

  return {
    tasks,
    status: snapshot.status,
    notice: storageNotice(snapshot.status),
    addTask,
    toggleTask,
    deleteTask,
    editTask,
    clearCompleted,
  }
}
