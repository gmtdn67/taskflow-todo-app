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
