import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { WorkoutSession, Profile, Goal, BodyMetric, Program, ActiveWorkout } from '../types'
import { loadItem, saveItem, hasItem, STORAGE_KEYS } from './storage'
import { generateDemoData } from './demoSeed'

interface AppStoreValue {
  sessions: WorkoutSession[]
  addSession: (session: WorkoutSession) => void
  profile: Profile
  updateProfile: (profile: Profile) => void
  goals: Goal[]
  addGoal: (goal: Goal) => void
  updateGoal: (goal: Goal) => void
  deleteGoal: (id: string) => void
  bodyMetrics: BodyMetric[]
  addBodyMetric: (metric: BodyMetric) => void
  program: Program
  activeWorkout: ActiveWorkout | null
  setActiveWorkout: (workout: ActiveWorkout | null) => void
}

const AppStoreContext = createContext<AppStoreValue | undefined>(undefined)

function initializeSeed() {
  if (hasItem(STORAGE_KEYS.seeded)) return
  const demo = generateDemoData()
  saveItem(STORAGE_KEYS.sessions, demo.sessions)
  saveItem(STORAGE_KEYS.profile, demo.profile)
  saveItem(STORAGE_KEYS.program, demo.program)
  saveItem(STORAGE_KEYS.bodyMetrics, demo.bodyMetrics)
  saveItem(STORAGE_KEYS.goals, demo.goals)
  saveItem(STORAGE_KEYS.seeded, true)
}

initializeSeed()

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<WorkoutSession[]>(() => loadItem(STORAGE_KEYS.sessions, []))
  const [profile, setProfile] = useState<Profile>(() =>
    loadItem(STORAGE_KEYS.profile, { name: '', age: 0, heightCm: 0, weightKg: 0, experience: '' }),
  )
  const [goals, setGoals] = useState<Goal[]>(() => loadItem(STORAGE_KEYS.goals, []))
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetric[]>(() => loadItem(STORAGE_KEYS.bodyMetrics, []))
  const [program] = useState<Program>(() => loadItem(STORAGE_KEYS.program, null as unknown as Program))
  const [activeWorkout, setActiveWorkoutState] = useState<ActiveWorkout | null>(() =>
    loadItem(STORAGE_KEYS.activeWorkout, null),
  )

  useEffect(() => saveItem(STORAGE_KEYS.sessions, sessions), [sessions])
  useEffect(() => saveItem(STORAGE_KEYS.profile, profile), [profile])
  useEffect(() => saveItem(STORAGE_KEYS.goals, goals), [goals])
  useEffect(() => saveItem(STORAGE_KEYS.bodyMetrics, bodyMetrics), [bodyMetrics])
  useEffect(() => saveItem(STORAGE_KEYS.activeWorkout, activeWorkout), [activeWorkout])

  const value = useMemo<AppStoreValue>(
    () => ({
      sessions,
      addSession: (session) => setSessions((prev) => [...prev, session]),
      profile,
      updateProfile: setProfile,
      goals,
      addGoal: (goal) => setGoals((prev) => [...prev, goal]),
      updateGoal: (goal) => setGoals((prev) => prev.map((g) => (g.id === goal.id ? goal : g))),
      deleteGoal: (id) => setGoals((prev) => prev.filter((g) => g.id !== id)),
      bodyMetrics,
      addBodyMetric: (metric) =>
        setBodyMetrics((prev) => [...prev.filter((m) => m.date !== metric.date), metric].sort((a, b) => (a.date < b.date ? -1 : 1))),
      program,
      activeWorkout,
      setActiveWorkout: setActiveWorkoutState,
    }),
    [sessions, profile, goals, bodyMetrics, program, activeWorkout],
  )

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
}

export function useAppStore(): AppStoreValue {
  const ctx = useContext(AppStoreContext)
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider')
  return ctx
}
