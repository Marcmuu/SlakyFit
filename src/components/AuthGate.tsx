import { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '../data/store'
import { supabase } from '../data/supabaseClient'
import { fetchCloudBackup, applyCloudBackup, pushCloudState, markUserResolved, isUserResolved, hasMeaningfulLocalData } from '../data/cloudSync'
import { resetLocalDataForNewAccount, exportAllData } from '../data/storage'
import Button from './Button'
import ActionSheet from './ActionSheet'
import type { Routine, WorkoutSession } from '../types'

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, authReady } = useAppStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [needsChoice, setNeedsChoice] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [checkingCloud, setCheckingCloud] = useState(false)

  useEffect(() => {
    if (!supabase || !user || isUserResolved(user.id)) return
    setCheckingCloud(true)
    fetchCloudBackup(user.id)
      .then(async (cloud) => {
        if (cloud) {
          applyCloudBackup(cloud)
          markUserResolved(user.id)
          window.location.reload()
          return
        }
        // Sin copia en la nube todavía. Si este dispositivo no tiene nada
        // relevante que perder (p.ej. solo quedó una rutina de otra cuenta
        // pero cero entrenamientos), no tiene sentido preguntar — se resuelve
        // como cuenta nueva directamente y el usuario cae en el asistente de
        // creación de rutina.
        if (!hasMeaningfulLocalData(exportAllData())) {
          resetLocalDataForNewAccount()
          await pushCloudState(user.id)
          markUserResolved(user.id)
          window.location.reload()
          return
        }
        setNeedsChoice(true)
        setCheckingCloud(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'No se pudo comprobar tu copia en la nube.')
        setCheckingCloud(false)
      })
  }, [user])

  async function chooseThisDevice() {
    if (!user) return
    setResolving(true)
    try {
      await pushCloudState(user.id)
      markUserResolved(user.id)
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo sincronizar.')
      setResolving(false)
    }
  }

  async function chooseFresh() {
    if (!user) return
    setResolving(true)
    try {
      resetLocalDataForNewAccount()
      await pushCloudState(user.id)
      markUserResolved(user.id)
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo sincronizar.')
      setResolving(false)
    }
  }

  const localSummary = useMemo(() => {
    if (!needsChoice) return null
    const backup = exportAllData()
    const routines = (backup.data.routines as Routine[] | undefined) ?? []
    const sessions = (backup.data.sessions as WorkoutSession[] | undefined) ?? []
    return { routines, sessions }
  }, [needsChoice])

  async function submit() {
    if (!supabase) return
    setError(null)
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.')
    } finally {
      setLoading(false)
    }
  }

  if (!supabase) return <>{children}</>
  if (!authReady) return <div className="min-h-screen supports-[height:100dvh]:min-h-[100dvh] bg-base-950" />
  if (user && !needsChoice && !checkingCloud) return <>{children}</>

  return (
    <div className="min-h-screen supports-[height:100dvh]:min-h-[100dvh] bg-base-950 text-base-100 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #c4ff3d 1px, transparent 1px)', backgroundSize: '22px 22px' }}
      />
      <div className="w-full max-w-xs flex flex-col items-center relative">
        <div className="w-16 h-16 rounded-2xl bg-brand flex items-center justify-center mb-4 shadow-[0_0_40px_-8px_rgba(196,255,61,0.5)]">
          <span className="text-3xl font-black text-base-950">S</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight mb-1">SlakyFit</h1>
        <p className="text-sm text-base-400 mb-8 text-center">
          {checkingCloud ? 'Comprobando tu cuenta…' : 'Inicia sesión para continuar'}
        </p>

        {!user && !checkingCloud && (
          <div className="w-full flex flex-col gap-3">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              placeholder="Email"
              className="w-full h-12 bg-base-800 border border-base-700 rounded-xl px-4 text-sm text-base-100"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              placeholder="Contraseña"
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              className="w-full h-12 bg-base-800 border border-base-700 rounded-xl px-4 text-sm text-base-100"
            />
            {error && <p className="text-xs text-accent-push">{error}</p>}
            <Button size="lg" className="w-full mt-1" onClick={submit} disabled={loading || !email || !password}>
              {loading ? 'Un momento…' : 'Iniciar sesión'}
            </Button>
          </div>
        )}
      </div>

      {needsChoice && localSummary && (
        <ActionSheet>
          <p className="text-lg font-bold mb-1">Todavía no hay nada guardado para esta cuenta</p>
          <p className="text-sm text-base-400 mb-4">Este dispositivo tiene datos locales. Elige qué hacer con ellos:</p>

          <div className="rounded-xl bg-base-800/60 border border-base-700 p-3 mb-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-base-400">Rutinas en este dispositivo</span>
              <span className="font-semibold text-base-100 tabular">{localSummary.routines.length}</span>
            </div>
            {localSummary.routines.length > 0 && (
              <p className="text-xs text-base-500 mt-0.5 truncate">{localSummary.routines.map((r) => r.name).join(', ')}</p>
            )}
            <div className="flex items-center justify-between mt-2">
              <span className="text-base-400">Entrenamientos registrados</span>
              <span className="font-semibold text-base-100 tabular">{localSummary.sessions.length}</span>
            </div>
          </div>

          {error && <p className="text-xs text-accent-push mb-3">{error}</p>}
          <div className="flex flex-col gap-2.5">
            <Button size="lg" onClick={chooseThisDevice} disabled={resolving}>
              {resolving ? 'Un momento…' : 'Sí, quedarme con esto y vincularlo a mi cuenta'}
            </Button>
            <Button variant="secondary" size="lg" onClick={chooseFresh} disabled={resolving}>
              No, empezar esta cuenta en blanco
            </Button>
          </div>
          <p className="text-[11px] text-base-500 mt-3 text-center">
            "Empezar en blanco" borra lo de arriba de este dispositivo — úsalo solo si es un usuario nuevo, no tú mismo en otro sitio.
          </p>
        </ActionSheet>
      )}
    </div>
  )
}
