import type { Routine, Muscle, WorkoutSession } from '../types'
import { getExercise } from './exercises'
import { getExerciseHistory, computeE1RM } from './progression'
import { effectiveWeight, effectiveReps } from '../lib/setFormat'

// Umbral orientativo: por debajo de esto en un ciclo completo de la rutina,
// el músculo probablemente recibe poco estímulo para crecer.
const LOW_VOLUME_THRESHOLD = 6

export interface MuscleVolume {
  label: Muscle
  value: number
}

export function volumeByMuscleForRoutine(routine: Routine): MuscleVolume[] {
  const map = new Map<Muscle, number>()
  for (const day of routine.days) {
    for (const slot of day.exercises) {
      const exercise = getExercise(slot.exerciseId)
      if (!exercise) continue
      for (const muscle of exercise.mainMuscles) {
        map.set(muscle, (map.get(muscle) ?? 0) + slot.targetSets)
      }
    }
  }
  return [...map.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)
}

export function lowVolumeMuscles(routine: Routine): MuscleVolume[] {
  return volumeByMuscleForRoutine(routine).filter((m) => m.value < LOW_VOLUME_THRESHOLD)
}

export interface StagnantExercise {
  exerciseId: string
  exerciseName: string
}

// Compara el e1RM de la sesión más reciente con el de 3 sesiones atrás para
// ese ejercicio. Si no ha mejorado al menos un 1%, se marca como estancado.
// Reglas internas, sin IA — solo mira los datos que ya se han registrado.
export function stagnantExercisesInRoutine(routine: Routine, sessions: WorkoutSession[]): StagnantExercise[] {
  const seen = new Set<string>()
  const result: StagnantExercise[] = []

  for (const day of routine.days) {
    for (const slot of day.exercises) {
      if (seen.has(slot.exerciseId)) continue
      seen.add(slot.exerciseId)

      const exercise = getExercise(slot.exerciseId)
      if (!exercise || exercise.logType === 'time') continue

      const history = getExerciseHistory(slot.exerciseId, sessions)
      if (history.length < 3) continue

      const lastThree = history.slice(0, 3)
      const e1rms = lastThree.map((h) => Math.max(0, ...h.sets.map((s) => computeE1RM(effectiveWeight(exercise, s), effectiveReps(s)))))
      const [mostRecent, , threeAgo] = e1rms
      const improved = mostRecent > threeAgo * 1.01

      if (!improved) {
        result.push({ exerciseId: slot.exerciseId, exerciseName: exercise.name })
      }
    }
  }

  return result
}
