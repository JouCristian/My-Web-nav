import "server-only"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let adminClient: SupabaseClient | null = null
let publicClient: SupabaseClient | null = null

function requireEnvironmentVariable(name: string) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`缺少环境变量 ${name}`)
  return value
}

export function getSupabaseAdminClient() {
  if (adminClient) return adminClient

  adminClient = createClient(
    requireEnvironmentVariable("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnvironmentVariable("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  )
  return adminClient
}

export function getSupabasePublicClient() {
  if (publicClient) return publicClient

  publicClient = createClient(
    requireEnvironmentVariable("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnvironmentVariable("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  )
  return publicClient
}

