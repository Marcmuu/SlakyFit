import type { WorkoutSession, SessionExercise, SetEntry, ExerciseType } from '../types'

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

export function bestSet(sets: SetEntry[]): SetEntry | undefined {
  return sets.reduce<SetEntry | undefined>((best, s) => {
    if (!best) return s
    return computeE1RM(s.weight, s.reps) > computeE1RM(best.weight, best.reps) ? s : best
  }, undefined)
}

export function bestE1RMForExercise(exerciseId: string, sessions: WorkoutSession[]): number {
  let max = 0
  for (const entry of getExerciseHistory(exerciseId, sessions)) {
    for (const set of entry.sets) {
      max = Math.max(max, computeE1RM(set.weight, set.reps))
    }
  }
  return max
}

export function prForExercise(exerciseId: string, sessions: WorkoutSession[]): SetEntry | undefined {
  let pr: SetEntry | undefined
  for (const entry of getExerciseHistory(exerciseId, sessions)) {
    const candidate = bestSet(entry.sets)
    if (candidate && (!pr || computeE1RM(candidate.weight, candidate.reps) > computeE1RM(pr.weight, pr.reps))) {
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
  const last = getLastPerformance(exerciseId, sessions)
  if (!last || last.sets.length === 0) {
    return { message: 'Sin historial todavía. Elige un peso con el que puedas completar el rango con buena técnica.' }
  }

  const weights = last.sets.map((s) => s.weight)
  const reps = last.sets.map((s) => s.reps)
  const rirs: number[] = last.sets.map((s) => s.rir)
  const lastWeight = weights[weights.length - 1]
  const allAtTop = reps.every((r) => r >= repMax)
  const allBelowMin = reps.every((r) => r < repMin)
  const allZeroRir = rirs.every((r) => r === 0)
  const avgRir = rirs.reduce((a, b) => a + b, 0) / rirs.length

  if (allAtTop && !allZeroRir && avgRir >= rirTargetMin - 1) {
    return {
      recommendedWeight: roundToIncrement(lastWeight + weightIncrement, weightIncrement),
      message: `Buen progreso en la sesión anterior. Sube a ${roundToIncrement(lastWeight + weightIncrement, weightIncrement)} kg e intenta mantener el rango.`,
    }
  }

  if (allAtTop && allZeroRir) {
    return {
      recommendedWeight: lastWeight,
      message: `Completaste el rango pero al fallo (RIR 0). Mantén ${lastWeight} kg y busca terminar con algo más de margen antes de subir.`,
    }
  }

  if (allBelowMin && allZeroRir) {
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
