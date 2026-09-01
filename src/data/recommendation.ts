import type { WorkoutSession } from '../types'
import { routineSequence, getRoutineTemplate } from './routines'
import { mondayOf } from '../lib/dateGrid'

export function getLastWorkoutSession(sessions: WorkoutSession[]): WorkoutSession | undefined {
  if (sessions.length === 0) return undefined
  return [...sessions].sort((a, b) => (a.date < b.date ? 1 : -1))[0]
}

function templateIdFor(session: WorkoutSession): string {
  if (session.actualCategory === 'legs') return 'legs'
  return `${session.actualCategory}-${(session.actualVariant ?? 'A').toLowerCase()}`
}

export function getRecommendedTemplateId(sessions: WorkoutSession[]): string {
  const last = getLastWorkoutSession(sessions)
  if (!last) return routineSequence[0]
  const lastId = templateIdFor(last)
  const idx = routineSequence.indexOf(lastId)
  if (idx === -1) return routineSequence[0]
  return routineSequence[(idx + 1) % routineSequence.length]
}

export function getRecommendedTemplate(sessions: WorkoutSession[]) {
  const id = getRecommendedTemplateId(sessions)
  return getRoutineTemplate(id)!
}

export function countSessionsThisWeek(sessions: WorkoutSession[], referenceDate = new Date()): number {
  const start = mondayOf(referenceDate)
  return sessions.filter((s) => new Date(s.date) >= start).length
}
