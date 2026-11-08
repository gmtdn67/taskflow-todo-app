import { Inbox, SearchX } from 'lucide-react'
import type { TaskFilter } from '../../types/task'
import styles from './EmptyState.module.css'

type EmptyStateProps = {
  variant: 'empty' | 'no-results'
  filter: TaskFilter
  query: string
}

function noResultCopy(filter: TaskFilter, query: string): { title: string; text: string } {
  if (query.trim()) {
    return {
      title: 'Ничего не найдено',
      text: 'Попробуйте изменить запрос или сбросить фильтр.',
    }
  }

  if (filter === 'active') {
    return {
      title: 'Нет активных задач',
      text: 'Все задачи уже выполнены.',
    }
  }

  if (filter === 'completed') {
    return {
      title: 'Нет выполненных задач',
      text: 'Отметьте задачу выполненной, и она появится здесь.',
    }
  }

  return {
    title: 'Ничего не найдено',
    text: 'Попробуйте изменить запрос или фильтр.',
  }
}

export function EmptyState({ variant, filter, query }: EmptyStateProps) {
  const copy =
    variant === 'empty'
      ? {
          title: 'Пока здесь пусто',
          text: 'Добавьте первую задачу и начните организовывать свой день.',
        }
      : noResultCopy(filter, query)

  const Icon = variant === 'empty' ? Inbox : SearchX

  return (
    <div className={styles.empty} role="status">
      <div className={styles.icon} aria-hidden="true">
        <Icon size={28} />
      </div>
      <h2 className={styles.title}>{copy.title}</h2>
      <p className={styles.text}>{copy.text}</p>
    </div>
  )
}
