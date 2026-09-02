import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../data/store'
import { supabase } from '../../data/supabaseClient'
import { fetchCloudBackup, applyCloudBackup, hasMeaningfulLocalData, pushCloudState, type CloudRow } from '../../data/cloudSync'
import { useBodyScrollLock } from '../../lib/useBodyScrollLock'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'
import Button from '../../components/Button'
import ActionSheet from '../../components/ActionSheet'
import { STORAGE_KEYS, exportAllData, importAllData } from '../../data/storage'

type AuthMode = 'login' | 'signup'

export default function SettingsScreen() {
  const navigate = useNavigate()
  const { user, authReady, lastSyncedAt, syncing, syncNow } = useAppStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)

  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [authInfo, setAuthInfo] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [conflict, setConflict] = useState<{ userId: string; cloud: CloudRow } | null>(null)
  const [resolving, setResolving] = useState(false)
  useBodyScrollLock(conflict !== null)

  function resetDemoData() {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(`slakyfit:${key}`))
    window.location.reload()
  }

  function exportData() {
    const backup = exportAllData()
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `slakyfit-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function importData(file: File) {
    setImportError(null)
    try {
      const payload = JSON.parse(await file.text())
      importAllData(payload)
      window.location.reload()
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'No se pudo leer el archivo.')
    }
  }

  async function handleAuthSubmit() {
    if (!supabase) return
    setAuthError(null)
    setAuthInfo(null)
    setAuthLoading(true)
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (!data.session) {
          setAuthInfo('Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.')
          return
        }
        await pushCloudState(data.user!.id)
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        const userId = data.user!.id
        const cloud = await fetchCloudBackup(userId)
        const local = exportAllData()
        if (!cloud) {
          await pushCloudState(userId)
        } else if (hasMeaningfulLocalData(local)) {
          setConflict({ userId, cloud })
          return
        } else {
          applyCloudBackup(cloud)
          window.location.reload()
          return
        }
      }
      setEmail('')
      setPassword('')
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Algo falló al conectar con la cuenta.')
    } finally {
      setAuthLoading(false)
    }
  }

  async function resolveConflict(choice: 'cloud' | 'local') {
    if (!conflict) return
    setResolving(true)
    try {
      if (choice === 'cloud') {
        applyCloudBackup(conflict.cloud)
        window.location.reload()
      } else {
        await pushCloudState(conflict.userId)
        setConflict(null)
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'No se pudo resolver la sincronización.')
      setConflict(null)
    } finally {
      setResolving(false)
    }
  }

  async function handleSignOut() {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  return (
    <div>
      <PageHeader title="Configuración" onBack />
      <div className="px-4 flex flex-col gap-4">
        <Card>
          <p className="text-sm font-bold mb-1">SlakyFit</p>
          <p className="text-sm text-base-500">Los datos se guardan en este dispositivo, y en la nube si inicias sesión.</p>
        </Card>

        {supabase && authReady && (
          <Card>
            <p className="text-sm font-bold mb-1">Cuenta</p>
            {user ? (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-base-500">
                  Sesión iniciada como <span className="text-base-300 font-semibold">{user.email}</span>
                </p>
                <p className="text-xs text-base-500">
                  {syncing
                    ? 'Sincronizando…'
                    : lastSyncedAt
                      ? `Última sincronización: ${new Date(lastSyncedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
                      : 'Todavía no se ha sincronizado.'}
                </p>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => syncNow()} disabled={syncing}>
                    Sincronizar ahora
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    Cerrar sesión
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-base-500 mb-1">
                  Inicia sesión para que tus entrenamientos viajen contigo entre el móvil y el ordenador.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMode('login')}
                    className={`flex-1 h-9 rounded-lg text-xs font-semibold border ${mode === 'login' ? 'bg-base-100 text-base-950 border-base-100' : 'border-base-700 text-base-300'}`}
                  >
                    Iniciar sesión
                  </button>
                  <button
                    onClick={() => setMode('signup')}
                    className={`flex-1 h-9 rounded-lg text-xs font-semibold border ${mode === 'signup' ? 'bg-base-100 text-base-950 border-base-100' : 'border-base-700 text-base-300'}`}
                  >
                    Crear cuenta
                  </button>
                </div>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="email"
                  placeholder="Email"
                  className="w-full h-11 bg-base-800 border border-base-700 rounded-xl px-3 text-sm text-base-100"
                />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  placeholder="Contraseña"
                  className="w-full h-11 bg-base-800 border border-base-700 rounded-xl px-3 text-sm text-base-100"
                />
                {authError && <p className="text-xs text-accent-push">{authError}</p>}
                {authInfo && <p className="text-xs text-brand">{authInfo}</p>}
                <Button size="lg" onClick={handleAuthSubmit} disabled={authLoading || !email || !password}>
                  {authLoading ? 'Un momento…' : mode === 'signup' ? 'Crear cuenta' : 'Iniciar sesión'}
                </Button>
              </div>
            )}
          </Card>
        )}

        <Card>
          <p className="text-sm font-bold mb-2">Copia de seguridad</p>
          <p className="text-xs text-base-500 mb-3">
            Exporta tu historial a un archivo para guardarlo o pasarlo a otro dispositivo. Importar sobrescribe los
            datos actuales de este navegador.
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={exportData}>
              Exportar datos
            </Button>
            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
              Importar datos
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (file) importData(file)
              }}
            />
          </div>
          {importError && <p className="text-xs text-accent-push mt-2">{importError}</p>}
        </Card>
        <Card>
          <p className="text-sm font-bold mb-2">Restablecer datos de demostración</p>
          <p className="text-xs text-base-500 mb-3">Borra todo el historial local y vuelve a generar los datos de ejemplo.</p>
          <Button variant="danger" onClick={resetDemoData}>
            Restablecer datos
          </Button>
        </Card>
        <Button variant="ghost" onClick={() => navigate('/')}>
          Volver al inicio
        </Button>
      </div>

      {conflict && (
        <ActionSheet onDismiss={() => setConflict(null)}>
          <p className="text-lg font-bold mb-1">¿Qué datos quieres mantener?</p>
          <p className="text-sm text-base-400 mb-5">
            Hay una copia en la nube de{' '}
            <span className="text-base-200 font-semibold">{new Date(conflict.cloud.updated_at).toLocaleString('es-ES')}</span> y datos
            distintos en este dispositivo. Elige cuál conservar — la otra copia se sobrescribirá.
          </p>
          <div className="flex flex-col gap-2.5">
            <Button size="lg" onClick={() => resolveConflict('cloud')} disabled={resolving}>
              Usar la copia de la nube
            </Button>
            <Button variant="secondary" size="lg" onClick={() => resolveConflict('local')} disabled={resolving}>
              Usar este dispositivo
            </Button>
            <Button variant="ghost" onClick={() => setConflict(null)} disabled={resolving}>
              Decidir más tarde
            </Button>
          </div>
        </ActionSheet>
      )}
    </div>
  )
}
