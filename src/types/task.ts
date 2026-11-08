export type Task = {
  id: string
  title: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

export type TaskFilter = 'all' | 'active' | 'completed'

export type TaskStats = {
  total: number
  completed: number
  remaining: number
  percent: number
}

export type TitleError = 'empty' | 'too_long'

/** Результат проверки и нормализации названия задачи */
export type TitleValidationResult =
  | {
      ok: true
      value: string
    }
  | {
      ok: false
      reason: TitleError
    }

/** Результат операций, возвращающих обновлённый список задач */
export type TaskListResult =
  | {
      ok: true
      tasks: Task[]
    }
  | {
      ok: false
      reason: TitleError | 'missing'
    }

/** Результат мутации задач в хранилище */
export type TaskMutationResult =
  | {
      ok: true
      saved: boolean
      unchanged?: boolean
      completed?: boolean
    }
  | {
      ok: false
      reason: TitleError | 'missing'
    }