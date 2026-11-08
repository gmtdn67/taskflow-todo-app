import { describe, expect, it } from 'vitest'
import {
  addTask,
  clearCompleted,
  deleteTask,
  filterTasks,
  getTaskStats,
  normalizeTitle,
  sortTasksNewestFirst,
  titleErrorMessage,
  toggleTask,
  updateTask,
  type Task,
} from './task'
import { formatTaskCount, pluralize } from './text'
import { formatLongDate, formatTaskDate } from './date'

const older = new Date('2026-11-01T12:00:00.000Z')
const newer = new Date('2026-11-08T12:00:00.000Z')

function task(partial: Partial<Task> & Pick<Task, 'id' | 'title'>): Task {
  return {
    completed: false,
    createdAt: older.toISOString(),
    updatedAt: older.toISOString(),
    ...partial,
  }
}

describe('normalizeTitle', () => {
  it('обрезает пробелы и отклоняет пустое название', () => {
    expect(normalizeTitle('   ')).toEqual({ ok: false, reason: 'empty' })
    expect(normalizeTitle('  Купить молоко  ')).toEqual({ ok: true, value: 'Купить молоко' })
  })

  it('ограничивает длину 200 символами', () => {
    expect(normalizeTitle('я'.repeat(201))).toEqual({ ok: false, reason: 'too_long' })
    expect(titleErrorMessage('too_long')).toContain('200')
  })
})

describe('операции со списком задач', () => {
  it('добавляет новую задачу сверху', () => {
    const initial = [task({ id: '1', title: 'Старая' })]
    const result = addTask(initial, '  Новая  ', { id: '2', now: newer })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.tasks.map((item) => item.title)).toEqual(['Новая', 'Старая'])
    expect(result.tasks[0]).toMatchObject({
      id: '2',
      completed: false,
      createdAt: newer.toISOString(),
      updatedAt: newer.toISOString(),
    })
    expect(initial[0]?.title).toBe('Старая')
  })

  it('не добавляет пустую задачу', () => {
    expect(addTask([], '   ', { id: '1', now: newer }).ok).toBe(false)
  })

  it('отмечает задачу и снимает отметку, не меняя исходный объект', () => {
    const original = task({ id: '1', title: 'Отчёт' })
    const completed = toggleTask([original], '1', newer)
    const active = toggleTask(completed, '1', newer)

    expect(original.completed).toBe(false)
    expect(completed[0]?.completed).toBe(true)
    expect(active[0]?.completed).toBe(false)
    expect(completed[0]).not.toBe(original)
  })

  it('удаляет задачу и очищает только выполненные', () => {
    const tasks = [
      task({ id: '1', title: 'Активная' }),
      task({ id: '2', title: 'Готово', completed: true }),
    ]

    expect(deleteTask(tasks, '1').map((item) => item.id)).toEqual(['2'])
    expect(clearCompleted(tasks).map((item) => item.id)).toEqual(['1'])
    expect(tasks).toHaveLength(2)
  })

  it('обновляет название и оставляет порядок по дате создания', () => {
    const tasks = sortTasksNewestFirst([
      task({ id: 'old', title: 'Старая', createdAt: older.toISOString() }),
      task({ id: 'new', title: 'Новая', createdAt: newer.toISOString() }),
    ])
    const updated = updateTask(tasks, 'old', '  Старая, но точнее  ', newer)

    expect(updated.ok).toBe(true)
    if (!updated.ok) return
    expect(updated.tasks.map((item) => item.id)).toEqual(['new', 'old'])
    expect(updated.tasks[1]?.title).toBe('Старая, но точнее')
  })
})

describe('фильтры, поиск и статистика', () => {
  const tasks = [
    task({ id: '1', title: 'Купить молоко' }),
    task({ id: '2', title: 'Ёлка к празднику', completed: true }),
  ]

  it('фильтрует активные и выполненные', () => {
    expect(filterTasks(tasks, 'active', '').map((item) => item.id)).toEqual(['1'])
    expect(filterTasks(tasks, 'completed', '').map((item) => item.id)).toEqual(['2'])
  })

  it('ищет без учёта регистра и буквы ё', () => {
    expect(filterTasks(tasks, 'all', 'МОЛОКО').map((item) => item.id)).toEqual(['1'])
    expect(filterTasks(tasks, 'all', 'елка').map((item) => item.id)).toEqual(['2'])
    expect(filterTasks(tasks, 'active', 'елка')).toEqual([])
  })

  it('считает прогресс и не делит на ноль', () => {
    expect(getTaskStats(tasks)).toEqual({ total: 2, completed: 1, remaining: 1, percent: 50 })
    expect(getTaskStats([])).toEqual({ total: 0, completed: 0, remaining: 0, percent: 0 })
  })
})

describe('русские подписи', () => {
  it('склоняет количество задач', () => {
    expect(pluralize(1, ['задача', 'задачи', 'задач'])).toBe('задача')
    expect(pluralize(2, ['задача', 'задачи', 'задач'])).toBe('задачи')
    expect(pluralize(5, ['задача', 'задачи', 'задач'])).toBe('задач')
    expect(pluralize(21, ['задача', 'задачи', 'задач'])).toBe('задача')
    expect(formatTaskCount(11)).toBe('11 задач')
  })

  it('форматирует дату по-русски и переживает некорректное значение', () => {
    expect(formatLongDate(new Date('2026-11-08T12:00:00.000Z')).toLocaleLowerCase('ru-RU')).toContain(
      'ноября',
    )
    expect(formatTaskDate('не дата')).toBe('Дата неизвестна')
  })
})
