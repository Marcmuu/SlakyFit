import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../data/store'
import { formatMonthLabel, todayIso } from '../../lib/format'
import { isoOf } from '../../lib/dateGrid'
import PageHeader from '../../components/PageHeader'

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export default function Calendar() {
  const { sessions, routines, activeRoutineId } = useAppStore()
  const navigate = useNavigate()
  const activeRoutine = routines.find((r) => r.id === activeRoutineId)
  const [cursor, setCursor] = useState(() => {
    const t = new Date()
    return new Date(t.getFullYear(), t.getMonth(), 1)
  })

  const sessionsByDate = useMemo(() => {
    const map = new Map<string, typeof sessions>()
    for (const s of sessions) {
      const arr = map.get(s.date) ?? []
      arr.push(s)
      map.set(s.date, arr)
    }
    return map
  }, [sessions])

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstDay = new Date(year, month, 1)
  const startOffset = (firstDay.getDay() + 6) % 7 // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)

  const today = todayIso()

  return (
    <div>
      <PageHeader title="Calendario" subtitle="Tu historial de entrenamientos" />
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="w-9 h-9 rounded-full bg-base-800 text-base-300">
            ‹
          </button>
          <p className="font-bold text-base-100">{formatMonthLabel(cursor)}</p>
          <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="w-9 h-9 rounded-full bg-base-800 text-base-300">
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-xs text-base-500 font-semibold py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) return <div key={i} />
            const iso = isoOf(year, month, day)
            const daySessions = sessionsByDate.get(iso)
            const isToday = iso === today
            return (
              <button
                key={i}
                onClick={() => navigate(`/calendar/${iso}`)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 border ${
                  isToday ? 'border-brand' : 'border-transparent'
                } ${daySessions ? 'bg-base-800' : 'bg-base-900/50'}`}
              >
                <span className={`text-sm tabular ${daySessions ? 'font-bold text-base-100' : 'text-base-500'}`}>{day}</span>
                {daySessions && (
                  <div className="flex gap-0.5">
                    {daySessions.slice(0, 3).map((s, si) => (
                      <span key={si} className="w-1.5 h-1.5 rounded-full" style={{ background: s.dayColor }} />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {activeRoutine && (
          <div className="flex gap-4 mt-5 justify-center flex-wrap text-xs text-base-400">
            {activeRoutine.days.map((day) => (
              <div key={day.id} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: day.color }} />
                {day.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
