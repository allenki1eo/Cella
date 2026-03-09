import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  // Guard against placeholder values during build/SSR
  if (!url.startsWith('http')) {
    // Return a stub during build — won't be called at runtime
    return createBrowserClient('https://placeholder.supabase.co', key || 'placeholder')
  }

  return createBrowserClient(url, key)
}
