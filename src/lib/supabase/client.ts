import { createBrowserClient } from '@supabase/ssr'

// Check if Supabase is configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export function createClient() {
    if (!isSupabaseConfigured) {
        // Return a mock client that doesn't make requests
        return null as unknown as ReturnType<typeof createBrowserClient>
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
