import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { WorkoutSession, Profile, Goal, BodyMetric, Program, ActiveWorkout, Routine } from '../types'
import { loadItem, saveItem, hasItem, STORAGE_KEYS } from './storage'
import { generateDemoData } from './demoSeed'
import { migrateRoutinesIfNeeded } from './migrateRoutines'
import { migrateRirIfNeeded } from './migrateRir'

interface AppStoreValue {
  sessions: WorkoutSession[]
  addSession: (session: WorkoutSession) => void
  updateSession: (session: WorkoutSession) => void
  deleteSession: (id: string) => void
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
  routines: Routine[]
  addRoutine: (routine: Routine) => void
  updateRoutine: (routine: Routine) => void
  deleteRoutine: (id: string) => void
  activeRoutineId: string | null
  setActiveRoutineId: (id: string | null) => void
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
migrateRoutinesIfNeeded()
migrateRirIfNeeded()

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
  const [routines, setRoutines] = useState<Routine[]>(() => loadItem(STORAGE_KEYS.routines, []))
  const [activeRoutineId, setActiveRoutineIdState] = useState<string | null>(() =>
    loadItem(STORAGE_KEYS.activeRoutineId, null),
  )

  useEffect(() => saveItem(STORAGE_KEYS.sessions, sessions), [sessions])
  useEffect(() => saveItem(STORAGE_KEYS.profile, profile), [profile])
  useEffect(() => saveItem(STORAGE_KEYS.goals, goals), [goals])
  useEffect(() => saveItem(STORAGE_KEYS.bodyMetrics, bodyMetrics), [bodyMetrics])
  useEffect(() => saveItem(STORAGE_KEYS.activeWorkout, activeWorkout), [activeWorkout])
  useEffect(() => saveItem(STORAGE_KEYS.routines, routines), [routines])
  useEffect(() => saveItem(STORAGE_KEYS.activeRoutineId, activeRoutineId), [activeRoutineId])

  const value = useMemo<AppStoreValue>(
    () => ({
      sessions,
      addSession: (session) => setSessions((prev) => [...prev, session]),
      updateSession: (session) => setSessions((prev) => prev.map((s) => (s.id === session.id ? session : s))),
      deleteSession: (id) => setSessions((prev) => prev.filter((s) => s.id !== id)),
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
      routines,
      addRoutine: (routine) => setRoutines((prev) => [...prev, routine]),
      updateRoutine: (routine) => setRoutines((prev) => prev.map((r) => (r.id === routine.id ? routine : r))),
      deleteRoutine: (id) => {
        const remaining = routines.filter((r) => r.id !== id)
        setRoutines(remaining)
        if (activeRoutineId === id) setActiveRoutineIdState(remaining[0]?.id ?? null)
      },
      activeRoutineId,
      setActiveRoutineId: setActiveRoutineIdState,
    }),
    [sessions, profile, goals, bodyMetrics, program, activeWorkout, routines, activeRoutineId],
  )

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
}

export function useAppStore(): AppStoreValue {
  const ctx = useContext(AppStoreContext)
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider')
  return ctx
}
