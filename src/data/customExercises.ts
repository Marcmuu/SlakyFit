import type { Exercise, ExerciseSection, Muscle, Equipment, ExerciseLogType } from '../types'
import { loadItem, saveItem, STORAGE_KEYS } from './storage'
import { newId } from '../lib/id'

const INCREMENT_BY_EQUIPMENT: Record<Equipment, number> = {
  barbell: 2.5,
  dumbbell: 2,
  machine: 5,
  cable: 2.5,
  bodyweight: 0,
  smith: 2.5,
  plate: 1.25,
}

function loadAll(): Exercise[] {
  return loadItem(STORAGE_KEYS.customExercises, [])
}

export function listCustomExercises(): Exercise[] {
  return loadAll()
}

export interface NewCustomExerciseInput {
  name: string
  section: ExerciseSection
  mainMuscles: Muscle[]
  equipment: Equipment
  logType: ExerciseLogType
}

// Ejercicios que el usuario crea sobre la marcha porque no encuentra el suyo
// en la biblioteca — se guardan aparte de la biblioteca curada (data/exercises.ts)
// para no mezclar contenido verificado con el de cada usuario, pero se resuelven
// igual que cualquier otro ejercicio (ver getExercise/getAllExercises).
export function addCustomExercise(input: NewCustomExerciseInput): Exercise {
  const exercise: Exercise = {
    id: newId('custom'),
    name: input.name.trim(),
    section: input.section,
    mainMuscles: input.mainMuscles,
    pattern: 'Personalizado',
    equipment: input.equipment,
    type: 'isolation',
    logType: input.logType,
    alternativeIds: [],
    media: { kind: 'placeholder', label: input.name.trim() },
    instructions: ['Ejercicio creado por ti — aplica la técnica que ya conoces para este movimiento.'],
    mistakes: ['Rango de movimiento incompleto.', 'Usar impulso en vez de control muscular.'],
    tips: ['Prioriza la técnica antes que el peso.'],
    weightIncrement: INCREMENT_BY_EQUIPMENT[input.equipment],
  }
  saveItem(STORAGE_KEYS.customExercises, [...loadAll(), exercise])
  return exercise
}

export function deleteCustomExercise(id: string): void {
  saveItem(STORAGE_KEYS.customExercises, loadAll().filter((e) => e.id !== id))
}
