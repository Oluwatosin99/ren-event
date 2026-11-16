import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient

  const config = useRuntimeConfig()
  const url = (config.supabaseUrl || process.env.SUPABASE_URL || '').trim()
  const key = (config.supabaseKey || process.env.SUPABASE_KEY || '').trim()

  if (!url || !key) {
    return null
  }

  try {
    supabaseClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
    return supabaseClient
  } catch (err) {
    console.warn('[Supabase] Failed to initialize client, fallback will use local SQLite:', err)
    return null
  }
}

