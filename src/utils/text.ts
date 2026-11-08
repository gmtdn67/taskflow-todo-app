export function pluralize(count: number, forms: readonly [string, string, string]): string {
  const absolute = Math.abs(count) % 100
  const lastDigit = absolute % 10

  if (absolute > 10 && absolute < 20) return forms[2]
  if (lastDigit === 1) return forms[0]
  if (lastDigit >= 2 && lastDigit <= 4) return forms[1]
  return forms[2]
}

export function formatTaskCount(count: number): string {
  return `${count} ${pluralize(count, ['задача', 'задачи', 'задач'])}`
}

export function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase('ru-RU').replaceAll('ё', 'е')
}
