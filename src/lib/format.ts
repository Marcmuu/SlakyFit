const dayFormatter = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long' })
const weekdayFormatter = new Intl.DateTimeFormat('es-ES', { weekday: 'long' })
const monthFormatter = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' })

export function formatDayLabel(isoDate: string): string {
  return dayFormatter.format(new Date(isoDate + 'T00:00:00'))
}

export function formatWeekday(isoDate: string): string {
  const label = weekdayFormatter.format(new Date(isoDate + 'T00:00:00'))
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function formatMonthLabel(date: Date): string {
  const label = monthFormatter.format(date)
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function isSameDay(a: string, b: string): boolean {
  return a === b
}

export function formatWeight(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1)
}
