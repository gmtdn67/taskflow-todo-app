import { Search, Trash2, X } from 'lucide-react'
import type { TaskFilter } from '../../types/task'
import { formatTaskCount } from '../../utils/text'
import styles from './TaskFilters.module.css'

const FILTERS: { id: TaskFilter; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'active', label: 'Активные' },
  { id: 'completed', label: 'Выполненные' },
]

type TaskFiltersProps = {
  filter: TaskFilter
  query: string
  visibleCount: number
  totalCount: number
  completedCount: number
  onFilterChange: (filter: TaskFilter) => void
  onQueryChange: (query: string) => void
  onClearCompleted: () => void
}

export function TaskFilters({
  filter,
  query,
  visibleCount,
  totalCount,
  completedCount,
  onFilterChange,
  onQueryChange,
  onClearCompleted,
}: TaskFiltersProps) {
  const narrowed = filter !== 'all' || query.trim().length > 0
  const counter = narrowed
    ? `Показано ${visibleCount} из ${totalCount}`
    : formatTaskCount(totalCount)

  return (
    <div className={styles.panel}>
      <div className={styles.controls}>
        <div className={styles.filters} role="group" aria-label="Фильтр задач">
          {FILTERS.map((item) => {
            const active = filter === item.id
            return (
              <button
                key={item.id}
                type="button"
                className={active ? `${styles.filter} ${styles.filterActive}` : styles.filter}
                aria-pressed={active}
                onClick={() => onFilterChange(item.id)}
              >
                {item.label}
              </button>
            )
          })}
        </div>
        <div className={styles.search}>
          <Search className={styles.icon} size={16} aria-hidden="true" />
          <label className="sr-only" htmlFor="task-search">
            Поиск задач
          </label>
          <input
            id="task-search"
            className={styles.searchInput}
            type="search"
            value={query}
            placeholder="Поиск по названию"
            autoComplete="off"
            onChange={(event) => onQueryChange(event.target.value)}
          />
          {query ? (
            <button
              type="button"
              className={styles.clearSearch}
              aria-label="Очистить поиск"
              onClick={() => onQueryChange('')}
            >
              <X size={16} />
            </button>
          ) : null}
        </div>
        <button
          type="button"
          className={styles.clearCompleted}
          disabled={completedCount === 0}
          onClick={onClearCompleted}
        >
          <Trash2 size={16} aria-hidden="true" /> Удалить выполненные
        </button>
      </div>
      <div className={styles.footer}>
        <p aria-live="polite">{counter}</p>
        <p>Осталось {totalCount - completedCount}</p>
      </div>
    </div>
  )
}
