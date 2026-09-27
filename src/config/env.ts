/** Read public environment configuration. Never place secrets in VITE_* variables. */
export const env = {
  dataSource: (import.meta.env.VITE_DATA_SOURCE as 'mock' | 'supabase' | undefined) ?? 'mock',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string | undefined,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
  isDev: import.meta.env.DEV,
}
