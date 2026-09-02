import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Sin estas variables la app sigue funcionando 100% local (como siempre) —
// iniciar sesión es opcional, nunca un requisito para usar SlakyFit.
export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null
