import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

const PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

export function isSupabaseConfigured(): boolean {
  if (!supabaseUrl || !supabaseAnonKey) return false
  if (supabaseUrl.includes('your-project-ref')) return false
  if (supabaseAnonKey === 'your-supabase-anon-key') return false
  return true
}

let client: SupabaseClient | undefined

export function createClient(): SupabaseClient {
  if (!client) {
    client = createSupabaseClient(
      isSupabaseConfigured() ? supabaseUrl : PLACEHOLDER_URL,
      isSupabaseConfigured() ? supabaseAnonKey : PLACEHOLDER_KEY
    )
  }
  return client
}
