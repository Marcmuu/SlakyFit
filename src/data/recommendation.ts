import type { WorkoutSession, Routine, RoutineDay } from '../types'
import { mondayOf } from '../lib/dateGrid'

export function getLastWorkoutSession(sessions: WorkoutSession[]): WorkoutSession | undefined {
  if (sessions.length === 0) return undefined
  return [...sessions].sort((a, b) => (a.date < b.date ? 1 : -1))[0]
}

export function getRecommendedDay(routine: Routine | undefined, sessions: WorkoutSession[]): RoutineDay | undefined {
  if (!routine || routine.days.length === 0) return undefined
  const days = [...routine.days].sort((a, b) => a.order - b.order)
  const lastInRoutine = sessions.filter((s) => s.routineId === routine.id).sort((a, b) => (a.date < b.date ? 1 : -1))[0]
  if (!lastInRoutine) return days[0]
  const idx = days.findIndex((d) => d.id === lastInRoutine.dayId)
  if (idx === -1) return days[0]
  return days[(idx + 1) % days.length]
}

export function countSessionsThisWeek(sessions: WorkoutSession[], referenceDate = new Date()): number {
  const start = mondayOf(referenceDate)
  return sessions.filter((s) => new Date(s.date) >= start).length
}
