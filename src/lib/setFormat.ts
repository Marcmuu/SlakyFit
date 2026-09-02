import type { Exercise, SetEntry } from '../types'
import { formatWeight } from './format'

// Peso "real" de una serie según el tipo de registro del ejercicio: para
// peso corporal usamos solo el lastre añadido (no conocemos con precisión
// el peso corporal en cada sesión pasada), y el tiempo no tiene peso.
export function effectiveWeight(exercise: Exercise, set: SetEntry): number {
  if (exercise.logType === 'weight-reps') return set.weight ?? 0
  if (exercise.logType === 'bodyweight-reps') return set.extraWeight ?? 0
  return 0
}

export function effectiveReps(set: SetEntry): number {
  return set.reps ?? 0
}

export function setVolume(exercise: Exercise, set: SetEntry): number {
  if (exercise.logType === 'time') return 0
  return effectiveWeight(exercise, set) * effectiveReps(set)
}

export function describeSet(exercise: Exercise, set: SetEntry): string {
  if (exercise.logType === 'time') {
    return `${set.durationSec ?? 0}s`
  }
  if (exercise.logType === 'bodyweight-reps') {
    return set.extraWeight ? `+${formatWeight(set.extraWeight)} kg × ${set.reps ?? 0}` : `${set.reps ?? 0} reps`
  }
  return `${formatWeight(set.weight ?? 0)} kg × ${set.reps ?? 0}`
}
