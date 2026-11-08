import type { Task, TaskFilter, TaskMutationResult } from '../../types/task'
import { EmptyState } from '../EmptyState/EmptyState'
import { TaskItem } from '../TaskItem/TaskItem'
import styles from './TaskList.module.css'

type TaskListProps = {
  tasks: Task[]
  hasAnyTasks: boolean
  filter: TaskFilter
  query: string
  editingId: string | null
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onStartEdit: (id: string) => void
  onCancelEdit: () => void
  onSave: (id: string, title: string) => TaskMutationResult
}

export function TaskList({
  tasks,
  hasAnyTasks,
  filter,
  query,
  editingId,
  onToggle,
  onDelete,
  onStartEdit,
  onCancelEdit,
  onSave,
}: TaskListProps) {
  if (!hasAnyTasks) {
    return <EmptyState variant="empty" filter={filter} query={query} />
  }

  if (tasks.length === 0) {
    return <EmptyState variant="no-results" filter={filter} query={query} />
  }

  return (
    <ul className={styles.list} aria-label="Список задач">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          isEditing={editingId === task.id}
          onToggle={onToggle}
          onDelete={onDelete}
          onStartEdit={onStartEdit}
          onCancelEdit={onCancelEdit}
          onSave={onSave}
        />
      ))}
    </ul>
  )
}
