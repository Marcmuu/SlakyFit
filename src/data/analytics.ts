import type { WorkoutSession, Muscle } from '../types'
import { getExercise, exercises } from './exercises'
import { getExerciseHistory, prForExercise } from './progression'
import { setVolume, describeSet } from '../lib/setFormat'
import { mondayOf } from '../lib/dateGrid'

export function totalSets(sessions: WorkoutSession[]): number {
  return sessions.reduce((sum, s) => sum + s.exercises.reduce((a, e) => a + e.sets.length, 0), 0)
}

export function totalVolume(sessions: WorkoutSession[]): number {
  return sessions.reduce((sum, s) => sum + s.exercises.reduce((a, e) => a + volumeForSessionExercise(e), 0), 0)
}

function volumeForSessionExercise(sessionEx: WorkoutSession['exercises'][number]): number {
  const exercise = getExercise(sessionEx.exerciseId)
  if (!exercise) return 0
  return sessionEx.sets.reduce((sum, s) => sum + setVolume(exercise, s), 0)
}

export function volumeByMuscle(sessions: WorkoutSession[]): { label: Muscle; value: number }[] {
  const map = new Map<Muscle, number>()
  for (const session of sessions) {
    for (const sessionEx of session.exercises) {
      const exercise = getExercise(sessionEx.exerciseId)
      if (!exercise) continue
      const volume = volumeForSessionExercise(sessionEx)
      for (const muscle of exercise.mainMuscles) {
        map.set(muscle, (map.get(muscle) ?? 0) + volume)
      }
    }
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)
}

export interface RecentPR {
  exerciseName: string
  description: string
  date: string
}

export function mostRecentPR(sessions: WorkoutSession[]): RecentPR | undefined {
  let best: RecentPR | undefined
  for (const exercise of exercises) {
    if (exercise.section !== 'main' || exercise.logType === 'time') continue
    const pr = prForExercise(exercise.id, sessions)
    if (!pr) continue
    const history = getExerciseHistory(exercise.id, sessions)
    const achievedAt = history.find((h) => h.sets.some((s) => s === pr))
    if (!achievedAt) continue
    if (!best || achievedAt.date > best.date) {
      best = { exerciseName: exercise.name, description: describeSet(exercise, pr), date: achievedAt.date }
    }
  }
  return best
}

export function weekTrainingDates(sessions: WorkoutSession[], referenceDate = new Date()): Set<string> {
  const start = mondayOf(referenceDate)
  const dates = new Set<string>()
  for (const s of sessions) {
    if (new Date(s.date) >= start) dates.add(s.date)
  }
  return dates
}

export function averageSessionsPerWeek(sessions: WorkoutSession[]): number {
  if (sessions.length === 0) return 0
  const dates = sessions.map((s) => new Date(s.date).getTime())
  const spanDays = Math.max(1, (Math.max(...dates) - Math.min(...dates)) / 86400000 + 1)
  return Math.round((sessions.length / (spanDays / 7)) * 10) / 10
}
