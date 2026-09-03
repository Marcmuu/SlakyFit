import { useEffect, useState } from 'react'
import { useAppStore } from '../data/store'
import { supabase } from '../data/supabaseClient'
import { fetchCloudBackup, applyCloudBackup, pushCloudState, markUserResolved, isUserResolved } from '../data/cloudSync'
import { resetLocalDataForNewAccount } from '../data/storage'
import Button from './Button'
import ActionSheet from './ActionSheet'

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
      .then((cloud) => {
        if (cloud) {
          applyCloudBackup(cloud)
          markUserResolved(user.id)
          window.location.reload()
        } else {
          setNeedsChoice(true)
          setCheckingCloud(false)
        }
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
  if (!authReady) return <div className="min-h-screen bg-base-950" />
  if (user && !needsChoice && !checkingCloud) return <>{children}</>

  return (
    <div className="min-h-screen bg-base-950 text-base-100 flex flex-col items-center justify-center px-6 relative overflow-hidden">
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

      {needsChoice && (
        <ActionSheet>
          <p className="text-lg font-bold mb-1">¿Primera vez con esta cuenta?</p>
          <p className="text-sm text-base-400 mb-5">
            No hay datos guardados todavía para tu cuenta. ¿Quieres partir de lo que ya hay en este dispositivo, o empezar en blanco?
          </p>
          {error && <p className="text-xs text-accent-push mb-3">{error}</p>}
          <div className="flex flex-col gap-2.5">
            <Button size="lg" onClick={chooseThisDevice} disabled={resolving}>
              Usar los datos de este dispositivo
            </Button>
            <Button variant="secondary" size="lg" onClick={chooseFresh} disabled={resolving}>
              Empezar de cero
            </Button>
          </div>
        </ActionSheet>
      )}
    </div>
  )
}
