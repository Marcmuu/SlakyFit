import type { WorkoutSession, SessionExercise, SetEntry, ExerciseType, Exercise } from '../types'
import { RIR_MIDPOINT } from '../lib/rir'
import { getExercise } from './exercises'
import { effectiveWeight, effectiveReps } from '../lib/setFormat'

export interface ExerciseHistoryEntry {
  date: string
  sets: SetEntry[]
}

export function getExerciseHistory(exerciseId: string, sessions: WorkoutSession[]): ExerciseHistoryEntry[] {
  const entries: ExerciseHistoryEntry[] = []
  for (const session of sessions) {
    const match = session.exercises.find((e) => e.exerciseId === exerciseId)
    if (match && match.sets.length > 0) {
      entries.push({ date: session.date, sets: match.sets.filter((s) => !s.isWarmup) })
    }
  }
  return entries.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getLastPerformance(exerciseId: string, sessions: WorkoutSession[]): ExerciseHistoryEntry | undefined {
  return getExerciseHistory(exerciseId, sessions)[0]
}

export function computeE1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30) * 10) / 10
}

// Solo tiene sentido para ejercicios con peso (propio +lastre o externo);
// un ejercicio de tiempo no tiene una "mejor serie" en términos de e1RM.
export function bestSet(sets: SetEntry[], exercise: Exercise): SetEntry | undefined {
  if (exercise.logType === 'time') return undefined
  return sets.reduce<SetEntry | undefined>((best, s) => {
    if (!best) return s
    return computeE1RM(effectiveWeight(exercise, s), effectiveReps(s)) > computeE1RM(effectiveWeight(exercise, best), effectiveReps(best)) ? s : best
  }, undefined)
}

export function bestE1RMForExercise(exerciseId: string, sessions: WorkoutSession[]): number {
  const exercise = getExercise(exerciseId)
  if (!exercise || exercise.logType === 'time') return 0
  let max = 0
  for (const entry of getExerciseHistory(exerciseId, sessions)) {
    for (const set of entry.sets) {
      max = Math.max(max, computeE1RM(effectiveWeight(exercise, set), effectiveReps(set)))
    }
  }
  return max
}

export function prForExercise(exerciseId: string, sessions: WorkoutSession[]): SetEntry | undefined {
  const exercise = getExercise(exerciseId)
  if (!exercise || exercise.logType === 'time') return undefined
  let pr: SetEntry | undefined
  for (const entry of getExerciseHistory(exerciseId, sessions)) {
    const candidate = bestSet(entry.sets, exercise)
    if (candidate && (!pr || computeE1RM(effectiveWeight(exercise, candidate), effectiveReps(candidate)) > computeE1RM(effectiveWeight(exercise, pr), effectiveReps(pr)))) {
      pr = candidate
    }
  }
  return pr
}

export interface ProgressionResult {
  recommendedWeight?: number
  message: string
}

export function recommendNextWeight(
  exerciseId: string,
  sessions: WorkoutSession[],
  repMin: number,
  repMax: number,
  rirTargetMin: number,
  weightIncrement: number,
): ProgressionResult {
  const exercise = getExercise(exerciseId)
  const last = getLastPerformance(exerciseId, sessions)

  if (exercise?.logType === 'time') {
    if (!last || last.sets.length === 0) {
      return { message: 'Sin historial todavía. Mantén la posición con buena técnica el mayor tiempo posible.' }
    }
    const lastDuration = last.sets[last.sets.length - 1].durationSec ?? 0
    return { message: `La última vez aguantaste ${lastDuration}s. Intenta igualar o superar ese tiempo sin perder la técnica.` }
  }

  if (exercise?.logType === 'bodyweight-reps') {
    if (!last || last.sets.length === 0) {
      return { message: 'Sin historial todavía. Haz las repeticiones que puedas con buena técnica.' }
    }
    const lastExtra = last.sets[last.sets.length - 1].extraWeight ?? 0
    const allAtTop = last.sets.every((s) => (s.reps ?? 0) >= repMax)
    if (allAtTop) {
      return lastExtra > 0
        ? { message: `Completaste el rango con +${lastExtra} kg de lastre. Prueba a subir un poco el lastre.` }
        : { message: 'Completaste el rango en todas las series. Prueba a añadir algo de lastre la próxima vez.' }
    }
    return { message: 'Mantén el mismo lastre e intenta sumar alguna repetición respecto a la última vez.' }
  }

  if (!exercise || !last || last.sets.length === 0) {
    return { message: 'Sin historial todavía. Elige un peso con el que puedas completar el rango con buena técnica.' }
  }

  const weights = last.sets.map((s) => effectiveWeight(exercise, s))
  const reps = last.sets.map((s) => effectiveReps(s))
  const rirMidpoints = last.sets.map((s) => RIR_MIDPOINT[s.rir])
  const lastWeight = weights[weights.length - 1]
  const allAtTop = reps.every((r) => r >= repMax)
  const allBelowMin = reps.every((r) => r < repMin)
  const allNearFailure = last.sets.every((s) => s.rir === '0-1')
  const avgRir = rirMidpoints.reduce((a, b) => a + b, 0) / rirMidpoints.length

  if (allAtTop && !allNearFailure && avgRir >= rirTargetMin - 1) {
    return {
      recommendedWeight: roundToIncrement(lastWeight + weightIncrement, weightIncrement),
      message: `Buen progreso en la sesión anterior. Sube a ${roundToIncrement(lastWeight + weightIncrement, weightIncrement)} kg e intenta mantener el rango.`,
    }
  }

  if (allAtTop && allNearFailure) {
    return {
      recommendedWeight: lastWeight,
      message: `Completaste el rango pero cerca del fallo (RIR 0-1). Mantén ${lastWeight} kg y busca terminar con algo más de margen antes de subir.`,
    }
  }

  if (allBelowMin && allNearFailure) {
    const suggestedLow = roundToIncrement(lastWeight - weightIncrement, weightIncrement)
    return {
      recommendedWeight: suggestedLow,
      message: `El peso parece exigente para el rango actual. Prueba entre ${suggestedLow} y ${lastWeight} kg la próxima vez.`,
    }
  }

  if (reps.some((r) => r >= repMax) && avgRir >= rirTargetMin) {
    return {
      recommendedWeight: lastWeight,
      message: `Vas por buen camino. Mantén ${lastWeight} kg e intenta que todas las series lleguen a ${repMax} reps.`,
    }
  }

  return {
    recommendedWeight: lastWeight,
    message: `Mantén ${lastWeight} kg e intenta mejorar repeticiones o terminar con menos RIR.`,
  }
}

function roundToIncrement(value: number, increment: number): number {
  if (increment <= 0) return Math.round(value * 2) / 2
  return Math.round(value / increment) * increment
}

export interface WarmupSet {
  weight: number
  reps: string
  label: string
}

export function generateWarmup(workingWeight: number, type: ExerciseType, isFirstCompoundOfSession: boolean): WarmupSet[] {
  if (!workingWeight || workingWeight <= 0) return []
  if (type === 'compound-main' && isFirstCompoundOfSession) {
    return [
      { weight: roundToIncrement(workingWeight * 0.4, 2.5), reps: '8-10', label: 'Aproximación 1' },
      { weight: roundToIncrement(workingWeight * 0.6, 2.5), reps: '5', label: 'Aproximación 2' },
      { weight: roundToIncrement(workingWeight * 0.8, 2.5), reps: '2-3', label: 'Aproximación 3' },
    ]
  }
  if (type === 'compound-main' || type === 'compound-secondary') {
    return [{ weight: roundToIncrement(workingWeight * 0.6, 2.5), reps: '5-6', label: 'Aproximación' }]
  }
  return []
}
