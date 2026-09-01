export function isoOf(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export function mondayOf(date: Date): Date {
  const start = new Date(date)
  const day = start.getDay() === 0 ? 7 : start.getDay()
  start.setDate(start.getDate() - (day - 1))
  start.setHours(0, 0, 0, 0)
  return start
}

export function currentWeekDates(referenceDate = new Date()): string[] {
  const monday = mondayOf(referenceDate)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(d.getDate() + i)
    return isoOf(d.getFullYear(), d.getMonth(), d.getDate())
  })
}
