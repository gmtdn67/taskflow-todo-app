const longDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const taskDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatLongDate(date: Date): string {
  const formatted = longDateFormatter.format(date)
  return formatted.charAt(0).toLocaleUpperCase('ru-RU') + formatted.slice(1)
}

export function formatTaskDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Дата неизвестна'
  return taskDateFormatter.format(date)
}
