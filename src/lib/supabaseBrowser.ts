'use client'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Este patch se asegura que el entorno tenga fetch
if (typeof fetch === 'undefined') {
  throw new Error('🚨 "fetch" no está definido en este entorno.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
