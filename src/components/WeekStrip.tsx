import { currentWeekDates } from '../lib/dateGrid'
import { todayIso } from '../lib/format'
import { readableTextColor } from '../lib/color'
import type { WorkoutSession } from '../types'

const LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export default function WeekStrip({ sessions }: { sessions: WorkoutSession[] }) {
  const dates = currentWeekDates()
  const today = todayIso()
  const byDate = new Map<string, WorkoutSession>()
  for (const s of sessions) if (!byDate.has(s.date)) byDate.set(s.date, s)

  return (
    <div className="flex justify-between">
      {dates.map((date, i) => {
        const session = byDate.get(date)
        const isToday = date === today
        const isFuture = date > today
        return (
          <div key={date} className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] text-base-500 font-semibold">{LABELS[i]}</span>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold tabular border ${
                isToday ? 'border-brand' : 'border-transparent'
              } ${session ? '' : isFuture ? 'bg-base-900' : 'bg-base-800'}`}
              style={session ? { background: session.dayColor } : undefined}
            >
              <span style={session ? { color: readableTextColor(session.dayColor) } : undefined} className={!session ? (isFuture ? 'text-base-600' : 'text-base-400') : undefined}>
                {Number(date.slice(-2))}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
