import type { WorkoutSession, Profile, Program, BodyMetric, Goal } from '../types'
import { defaultPhases } from './phases'

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d
}

export function generateDemoData(today: Date = new Date()): {
  sessions: WorkoutSession[]
  profile: Profile
  program: Program
  bodyMetrics: BodyMetric[]
  goals: Goal[]
} {
  // El usuario empezó el programa ayer, así que hoy es su primer día real
  // registrando entrenamientos en la app: no generamos historial ficticio.
  const programStart = addDays(today, -1)
  const program: Program = {
    id: 'vuelta-al-gimnasio-v1',
    name: 'Vuelta al gimnasio V1',
    startDate: isoDate(programStart),
    durationWeeks: 6,
    phases: defaultPhases,
    active: true,
  }

  const profile: Profile = {
    name: 'Marc',
    age: 25,
    heightCm: 183,
    weightKg: 93.4,
    experience: 'Vuelve al gimnasio tras aproximadamente dos años con poca actividad.',
  }

  const bodyMetrics: BodyMetric[] = [{ date: isoDate(programStart), weight: profile.weightKg }]

  const goals: Goal[] = [
    { id: 'goal-dominadas', type: 'exercise-reps', label: 'Dominadas estrictas', exerciseId: 'dominadas', current: 5, target: 10, unit: 'reps' },
    { id: 'goal-press-banca', type: 'exercise-e1rm', label: 'Press banca e1RM', exerciseId: 'press-banca-barra', current: 65, target: 100, unit: 'kg' },
    { id: 'goal-peso-corporal', type: 'bodyweight', label: 'Peso corporal', current: profile.weightKg, target: 82, unit: 'kg' },
  ]

  return { sessions: [], profile, program, bodyMetrics, goals }
}
