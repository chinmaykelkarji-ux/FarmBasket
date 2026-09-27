/**
 * Mock persistence layer.
 *
 * There is no production backend yet, so the mock services persist "tables"
 * in the browser (localStorage, with an in-memory fallback when storage is
 * blocked). Only services import this file — UI code never touches storage.
 * Swap each service's implementation for Supabase/API calls later.
 */

const NAMESPACE = 'fb:v1:'
const memory = new Map<string, string>()

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(NAMESPACE + key)
  } catch {
    return memory.get(key) ?? null
  }
}

function safeSet(key: string, value: string) {
  try {
    window.localStorage.setItem(NAMESPACE + key, value)
  } catch {
    memory.set(key, value)
  }
}

export const db = {
  read<T>(table: string, fallback: T): T {
    const raw = safeGet(table)
    if (!raw) return fallback
    try {
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  },
  write<T>(table: string, value: T): void {
    safeSet(table, JSON.stringify(value))
  },
  reset(): void {
    try {
      Object.keys(window.localStorage)
        .filter((k) => k.startsWith(NAMESPACE))
        .forEach((k) => window.localStorage.removeItem(k))
    } catch {
      /* ignore */
    }
    memory.clear()
  },
}

/** Simulated network latency so loading states are exercised. */
export function latency(ms = 180): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
