import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkqyadgssduttoatjegy.supabase.co'
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrcXlhZGdzc2R1dHRvYXRqZWd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3NjU5NzYsImV4cCI6MjEwOTM0MTk3Nn0.ho6TkQtBNFmTBFZ_B2m2mClt-2chlo3C71r-NL07DTs'

export function createSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
