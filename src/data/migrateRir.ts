import type { WorkoutSession, ActiveWorkout, SetEntry } from '../types'
import { numericRirToRange } from '../lib/rir'
import { loadItem, saveItem, hasItem, STORAGE_KEYS } from './storage'

function migrateSets(sets: SetEntry[]): SetEntry[] {
  return sets.map((s) => (typeof s.rir === 'number' ? { ...s, rir: numericRirToRange(s.rir as unknown as number) } : s))
}

export function migrateRirIfNeeded(): void {
  if (hasItem(STORAGE_KEYS.rirMigratedV1)) return

  const sessions = loadItem<WorkoutSession[]>(STORAGE_KEYS.sessions, [])
  saveItem(
    STORAGE_KEYS.sessions,
    sessions.map((s) => ({ ...s, exercises: s.exercises.map((e) => ({ ...e, sets: migrateSets(e.sets) })) })),
  )

  const activeWorkout = loadItem<ActiveWorkout | null>(STORAGE_KEYS.activeWorkout, null)
  if (activeWorkout) {
    saveItem(STORAGE_KEYS.activeWorkout, {
      ...activeWorkout,
      exercises: activeWorkout.exercises.map((e) => ({ ...e, sets: migrateSets(e.sets) })),
    })
  }

  saveItem(STORAGE_KEYS.rirMigratedV1, true)
}
