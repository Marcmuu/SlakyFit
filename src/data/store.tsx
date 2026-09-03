import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import type { WorkoutSession, Profile, Goal, BodyMetric, Program, ActiveWorkout, Routine, Activity } from '../types'
import { loadItem, saveItem, hasItem, STORAGE_KEYS } from './storage'
import { generateDemoData } from './demoSeed'
import { migrateRoutinesIfNeeded } from './migrateRoutines'
import { migrateRirIfNeeded } from './migrateRir'
import { supabase } from './supabaseClient'
import { pushCloudState } from './cloudSync'

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
  activities: Activity[]
  addActivity: (activity: Activity) => void
  updateActivity: (activity: Activity) => void
  deleteActivity: (id: string) => void
  user: User | null
  authReady: boolean
  lastSyncedAt: string | null
  syncing: boolean
  syncNow: () => Promise<void>
}

const AppStoreContext = createContext<AppStoreValue | undefined>(undefined)

function initializeSeed() {
  if (hasItem(STORAGE_KEYS.seeded)) return
  if (supabase) {
    // En modo multiusuario (login activado) cada cuenta rellena su propio
    // perfil durante el onboarding — no tiene sentido precargar aquí los
    // datos de demostración de un usuario concreto para cualquier
    // dispositivo/cuenta nueva.
    saveItem(STORAGE_KEYS.seeded, true)
    return
  }
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
  const [activities, setActivities] = useState<Activity[]>(() => loadItem(STORAGE_KEYS.activities, []))

  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(!supabase)
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => loadItem('lastSyncedAt', null))
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setAuthReady(true)
    })
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.subscription.unsubscribe()
  }, [])

  async function syncNow() {
    if (!user) return
    setSyncing(true)
    try {
      await pushCloudState(user.id)
      const now = new Date().toISOString()
      setLastSyncedAt(now)
      saveItem('lastSyncedAt', now)
    } finally {
      setSyncing(false)
    }
  }

  // Empuja el estado completo a la nube ~1.5s después del último cambio,
  // solo si hay sesión iniciada. Sin cuenta, la app sigue siendo puramente local.
  useEffect(() => {
    if (!user) return
    const timeout = setTimeout(() => {
      syncNow().catch(() => {
        // Sin conexión o error puntual: se reintentará en el siguiente cambio.
      })
    }, 1500)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, sessions, profile, goals, bodyMetrics, routines, activeRoutineId, activities])

  useEffect(() => saveItem(STORAGE_KEYS.sessions, sessions), [sessions])
  useEffect(() => saveItem(STORAGE_KEYS.profile, profile), [profile])
  useEffect(() => saveItem(STORAGE_KEYS.goals, goals), [goals])
  useEffect(() => saveItem(STORAGE_KEYS.bodyMetrics, bodyMetrics), [bodyMetrics])
  useEffect(() => saveItem(STORAGE_KEYS.activeWorkout, activeWorkout), [activeWorkout])
  useEffect(() => saveItem(STORAGE_KEYS.routines, routines), [routines])
  useEffect(() => saveItem(STORAGE_KEYS.activeRoutineId, activeRoutineId), [activeRoutineId])
  useEffect(() => saveItem(STORAGE_KEYS.activities, activities), [activities])

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
      activities,
      addActivity: (activity) => setActivities((prev) => [...prev, activity]),
      updateActivity: (activity) => setActivities((prev) => prev.map((a) => (a.id === activity.id ? activity : a))),
      deleteActivity: (id) => setActivities((prev) => prev.filter((a) => a.id !== id)),
      user,
      authReady,
      lastSyncedAt,
      syncing,
      syncNow,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessions, profile, goals, bodyMetrics, program, activeWorkout, routines, activeRoutineId, activities, user, authReady, lastSyncedAt, syncing],
  )

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
}

export function useAppStore(): AppStoreValue {
  const ctx = useContext(AppStoreContext)
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider')
  return ctx
}
