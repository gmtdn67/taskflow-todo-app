import { useCallback, useState } from 'react'
import type { Task } from '../types/task'
import {
  loadTasksFromBrowser,
  saveTasksToBrowser,
  type LoadResult,
} from '../utils/storage'

export function useLocalStorage(): {
  tasks: Task[]
  persist: (next: Task[]) => boolean
  snapshot: LoadResult
} {
  const [snapshot] = useState(loadTasksFromBrowser)
  const [tasks, setTasks] = useState(snapshot.tasks)

  const persist = useCallback((next: Task[]) => {
    setTasks(next)
    return saveTasksToBrowser(next)
  }, [])

  return { tasks, persist, snapshot }
}
