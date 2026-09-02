const PREFIX = 'slakyfit:'

export function loadItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // ignore quota / serialization errors in the prototype
  }
}

export function hasItem(key: string): boolean {
  return localStorage.getItem(PREFIX + key) !== null
}

export const STORAGE_KEYS = {
  sessions: 'sessions',
  profile: 'profile',
  goals: 'goals',
  bodyMetrics: 'bodyMetrics',
  program: 'program',
  activeWorkout: 'activeWorkout',
  seeded: 'seeded-v2',
  routines: 'routines',
  activeRoutineId: 'activeRoutineId',
  routinesMigratedV1: 'routines-migrated-v1',
  rirMigratedV1: 'rir-migrated-v1',
} as const

const EXPORT_FORMAT = 'slakyfit-backup'
const EXPORT_VERSION = 1

export interface SlakyFitBackup {
  app: typeof EXPORT_FORMAT
  version: number
  exportedAt: string
  data: Record<string, unknown>
}

export function exportAllData(): SlakyFitBackup {
  const data: Record<string, unknown> = {}
  for (const [name, key] of Object.entries(STORAGE_KEYS)) {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw === null) continue
    try {
      data[name] = JSON.parse(raw)
    } catch {
      // entrada corrupta, se omite del backup
    }
  }
  return { app: EXPORT_FORMAT, version: EXPORT_VERSION, exportedAt: new Date().toISOString(), data }
}

export function importAllData(payload: unknown): void {
  if (!payload || typeof payload !== 'object') {
    throw new Error('El archivo no tiene un formato válido.')
  }
  const backup = payload as Partial<SlakyFitBackup>
  if (backup.app !== EXPORT_FORMAT || !backup.data || typeof backup.data !== 'object') {
    throw new Error('Este archivo no es una copia de seguridad de SlakyFit.')
  }
  for (const [name, key] of Object.entries(STORAGE_KEYS)) {
    const value = (backup.data as Record<string, unknown>)[name]
    if (value !== undefined) {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    }
  }
}
