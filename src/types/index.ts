export type Category = 'push' | 'pull' | 'legs'
export type Variant = 'A' | 'B' | null

export type ExerciseType = 'compound-main' | 'compound-secondary' | 'isolation'

export type ExerciseLogType = 'weight-reps' | 'bodyweight-reps' | 'time'

export type Equipment = 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight' | 'smith'

export type Muscle =
  | 'pecho'
  | 'espalda'
  | 'hombro'
  | 'biceps'
  | 'triceps'
  | 'cuadriceps'
  | 'isquios'
  | 'gluteo'
  | 'gemelos'
  | 'core'
  | 'antebrazo'

export type ExerciseSection = 'main' | 'abs' | 'mobility' | 'flexibility'

export interface Exercise {
  id: string
  name: string
  section: ExerciseSection
  mainMuscles: Muscle[]
  pattern: string
  equipment: Equipment
  type: ExerciseType
  logType: ExerciseLogType
  alternativeIds: string[]
  media: { kind: 'placeholder'; label: string }
  instructions: string[]
  mistakes: string[]
  tips: string[]
  weightIncrement: number
  defaultDurationSec?: number
  comparisonGroup?: string
  externalImages?: string[]
}

export interface RoutineList {
  id: string
  name: string
  section: 'abs' | 'mobility' | 'flexibility'
  durationLabel: string
  exerciseIds: string[]
  usedBefore?: Category
}

export interface RoutineItem {
  exerciseId: string
  order: number
  targetSets: number
  repMin: number
  repMax: number
}

export interface RoutineTemplate {
  id: string
  category: Category
  variant: Variant
  name: string
  items: RoutineItem[]
}

export type RirRange = '0-1' | '1-2' | '2-3' | '3+'

export interface SetEntry {
  weight?: number
  extraWeight?: number
  reps?: number
  durationSec?: number
  rir: RirRange
  isWarmup?: boolean
}

export interface SessionExercise {
  exerciseId: string
  originalExerciseId?: string
  order: number
  isExtra: boolean
  isSkipped?: boolean
  sets: SetEntry[]
  comparisonNotes?: string
}

export interface Activity {
  id: string
  date: string
  name: string
  emoji: string
  color: string
  durationMin?: number
  notes?: string
}

export interface WorkoutSession {
  id: string
  date: string
  routineId: string | null
  dayId: string | null
  dayName: string
  dayColor: string
  durationMin?: number
  notes?: string
  exercises: SessionExercise[]
}

export interface BodyMetric {
  date: string
  weight: number
}

export type GoalType = 'exercise-e1rm' | 'exercise-reps' | 'bodyweight'

export interface Goal {
  id: string
  type: GoalType
  label: string
  exerciseId?: string
  current: number
  target: number
  unit: string
}

export interface ProgramPhase {
  name: string
  weekStart: number
  weekEnd: number
  rirTargets: {
    compoundMain: [number, number]
    compoundSecondary: [number, number]
    isolation: [number, number]
  }
}

export interface Program {
  id: string
  name: string
  startDate: string
  durationWeeks: number
  phases: ProgramPhase[]
  active: boolean
}

export interface Profile {
  name: string
  age: number
  heightCm: number
  weightKg: number
  experience: string
}

export interface ActiveWorkoutExercise {
  exerciseId: string
  originalExerciseId?: string
  order: number
  isExtra: boolean
  targetSets: number
  repMin: number
  repMax: number
  sets: SetEntry[]
}

export interface ActiveWorkout {
  routineId: string
  dayId: string
  dayName: string
  dayColor: string
  startedAt: string
  exercises: ActiveWorkoutExercise[]
}

export interface RoutineDayExercise {
  id: string
  exerciseId: string
  order: number
  targetSets: number
  repMin: number
  repMax: number
}

export interface RoutineDay {
  id: string
  name: string
  order: number
  color: string
  exercises: RoutineDayExercise[]
}

export interface Routine {
  id: string
  name: string
  days: RoutineDay[]
  createdAt: string
  updatedAt: string
}
