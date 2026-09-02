import type { Routine, WorkoutSession } from '../types'
import { routineTemplates, routineSequence } from './routines'
import { newId } from '../lib/id'
import { colorForDayIndex } from '../lib/color'
import { loadItem, saveItem, hasItem, STORAGE_KEYS } from './storage'

const LEGACY_DAY_COLORS: Record<string, string> = {
  'push-a': '#ff6b57',
  'pull-a': '#4fb0ff',
  legs: '#c4ff3d',
  'push-b': '#ff6b57',
  'pull-b': '#4fb0ff',
}

function buildInitialRoutine(): Routine {
  const now = new Date().toISOString()
  return {
    id: newId('routine'),
    name: 'Rutina 1',
    createdAt: now,
    updatedAt: now,
    days: routineSequence.map((templateId, i) => {
      const template = routineTemplates.find((t) => t.id === templateId)!
      return {
        id: templateId,
        name: template.name,
        order: i + 1,
        color: LEGACY_DAY_COLORS[templateId] ?? colorForDayIndex(i),
        exercises: template.items.map((item) => ({
          id: newId('slot'),
          exerciseId: item.exerciseId,
          order: item.order,
          targetSets: item.targetSets,
          repMin: item.repMin,
          repMax: item.repMax,
        })),
      }
    }),
  }
}

interface LegacySession {
  id: string
  date: string
  actualCategory?: 'push' | 'pull' | 'legs'
  actualVariant?: 'A' | 'B' | null
  dayName?: string
  [key: string]: unknown
}

function migrateSession(raw: LegacySession, routine: Routine): WorkoutSession {
  if (raw.dayName) return raw as unknown as WorkoutSession
  const templateId = raw.actualCategory === 'legs' ? 'legs' : `${raw.actualCategory}-${(raw.actualVariant ?? 'A').toLowerCase()}`
  const day = routine.days.find((d) => d.id === templateId) ?? routine.days[0]
  const { actualCategory, actualVariant, recommendedTemplateId, includedAbs, ...rest } = raw
  return { ...rest, routineId: routine.id, dayId: day.id, dayName: day.name, dayColor: day.color } as WorkoutSession
}

export function migrateRoutinesIfNeeded(): void {
  if (hasItem(STORAGE_KEYS.routinesMigratedV1)) return

  const existingRoutines = loadItem<Routine[]>(STORAGE_KEYS.routines, [])
  if (existingRoutines.length === 0) {
    const routine = buildInitialRoutine()
    saveItem(STORAGE_KEYS.routines, [routine])
    saveItem(STORAGE_KEYS.activeRoutineId, routine.id)

    const oldSessions = loadItem<LegacySession[]>(STORAGE_KEYS.sessions, [])
    saveItem(
      STORAGE_KEYS.sessions,
      oldSessions.map((s) => migrateSession(s, routine)),
    )
  }

  saveItem(STORAGE_KEYS.routinesMigratedV1, true)
}
