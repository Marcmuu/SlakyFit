import { supabase } from './supabaseClient'
import { exportAllData, importAllData, type SlakyFitBackup } from './storage'

const TABLE = 'app_backups'

export interface CloudRow {
  data: SlakyFitBackup
  updated_at: string
}

export async function fetchCloudBackup(userId: string): Promise<CloudRow | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from(TABLE).select('data, updated_at').eq('user_id', userId).maybeSingle()
  if (error) throw error
  return (data as CloudRow) ?? null
}

export async function pushCloudState(userId: string): Promise<void> {
  if (!supabase) return
  const backup = exportAllData()
  const { error } = await supabase.from(TABLE).upsert({ user_id: userId, data: backup, updated_at: new Date().toISOString() })
  if (error) throw error
}

export function applyCloudBackup(row: CloudRow): void {
  importAllData(row.data)
}

// Un dispositivo "recién instalado" nunca tiene entrenamientos registrados —
// la rutina semilla y el perfil demo se generan solos, pero una sesión solo
// existe si el usuario registró o hizo backfill de un entreno de verdad. Es la
// señal más fiable de "aquí hay datos reales que no se pueden pisar en silencio".
export function hasMeaningfulLocalData(local: SlakyFitBackup): boolean {
  const sessions = (local.data.sessions as unknown[] | undefined) ?? []
  return sessions.length > 0
}
