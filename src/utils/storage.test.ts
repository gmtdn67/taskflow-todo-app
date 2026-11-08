import { describe, expect, it } from 'vitest'
import type { Task } from '../types/task'
import {
  STORAGE_KEY,
  parseStoredTasks,
  readTasks,
  storageNotice,
  writeTasks,
} from './storage'

const task: Task = {
  id: '1',
  title: 'Проверить хранилище',
  completed: false,
  createdAt: '2026-11-08T09:00:00.000Z',
  updatedAt: '2026-11-08T09:00:00.000Z',
}

function createMemoryStorage(initial?: Record<string, string>) {
  const map = new Map(Object.entries(initial ?? {}))

  return {
    getItem(key: string) {
      return map.has(key) ? (map.get(key) ?? null) : null
    },
    setItem(key: string, value: string) {
      map.set(key, value)
    },
  }
}

describe('LocalStorage', () => {
  it('использует версионированный ключ и сохраняет модель задачи', () => {
    const storage = createMemoryStorage()
    expect(writeTasks(storage, [task])).toBe(true)

    const loaded = readTasks(storage)
    expect(storage.getItem(STORAGE_KEY)).toContain('"title":"Проверить хранилище"')
    expect(loaded).toEqual({ tasks: [task], status: 'ok' })
    expect(loaded.tasks[0]).not.toHaveProperty('filter')
  })

  it('считает отсутствие ключа пустым состоянием', () => {
    expect(parseStoredTasks(null)).toEqual({ tasks: [], status: 'empty' })
    expect(storageNotice('empty')).toBeNull()
  })

  it('обрабатывает повреждённый JSON и неверный формат', () => {
    expect(parseStoredTasks('{')).toEqual({ tasks: [], status: 'corrupt' })
    expect(parseStoredTasks('{"tasks":[]}')).toEqual({ tasks: [], status: 'corrupt' })
    expect(parseStoredTasks('null')).toEqual({ tasks: [], status: 'corrupt' })
    expect(storageNotice('corrupt')).toContain('повреждены')
  })

  it('сохраняет валидные задачи и пропускает повреждённые записи', () => {
    const raw = JSON.stringify([task, { id: 15, title: 'битая' }, null])
    const result = parseStoredTasks(raw)

    expect(result.status).toBe('partial')
    expect(result.tasks).toEqual([task])
    expect(storageNotice('partial')).toContain('пропущена')
  })

  it('считает массив только из битых записей полностью повреждённым', () => {
    expect(parseStoredTasks('[{"id":1}]')).toEqual({ tasks: [], status: 'corrupt' })
  })

  it('сообщает об ошибке чтения и записи', () => {
    const brokenRead = {
      getItem() {
        throw new Error('blocked')
      },
    }
    const brokenWrite = {
      setItem() {
        throw new Error('quota')
      },
    }

    expect(readTasks(brokenRead)).toEqual({ tasks: [], status: 'read_error' })
    expect(writeTasks(brokenWrite, [task])).toBe(false)
  })

  it('сортирует загруженные задачи от новых к старым', () => {
    const older: Task = { ...task, id: 'old', title: 'Старая', createdAt: '2026-11-01T09:00:00.000Z' }
    const result = parseStoredTasks(JSON.stringify([older, task]))

    expect(result.tasks.map((item) => item.id)).toEqual(['1', 'old'])
  })
})
