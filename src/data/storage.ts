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
} as const
