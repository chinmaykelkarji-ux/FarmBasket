/**
 * Analytics hooks. Currently logs to the console and keeps a local event log
 * (useful during customer interviews). Connect a real provider in `send()`.
 */
import { env } from '@/config/env'

export type AnalyticsEvent =
  | 'product_viewed'
  | 'product_customized'
  | 'variant_selected'
  | 'add_to_cart'
  | 'cart_updated'
  | 'checkout_started'
  | 'order_placed'
  | 'preference_saved'
  | 'quality_issue_reported'
  | 'reorder_clicked'
  | 'search_performed'
  | 'basket_built'

export interface TrackedEvent {
  event: AnalyticsEvent
  props: Record<string, unknown>
  at: string
  path: string
}

const LOG_KEY = 'fb:v1:events'
const MAX_EVENTS = 500

function send(e: TrackedEvent) {
  // Future: posthog.capture(e.event, e.props) / supabase.from('events').insert(e)
  if (env.isDev) console.info(`[analytics] ${e.event}`, e.props)
}

export function track(event: AnalyticsEvent, props: Record<string, unknown> = {}) {
  const e: TrackedEvent = { event, props, at: new Date().toISOString(), path: window.location.pathname }
  try {
    const log = JSON.parse(window.localStorage.getItem(LOG_KEY) ?? '[]') as TrackedEvent[]
    log.push(e)
    window.localStorage.setItem(LOG_KEY, JSON.stringify(log.slice(-MAX_EVENTS)))
  } catch {
    /* storage unavailable — ignore */
  }
  send(e)
}

export function getEventLog(): TrackedEvent[] {
  try {
    return JSON.parse(window.localStorage.getItem(LOG_KEY) ?? '[]') as TrackedEvent[]
  } catch {
    return []
  }
}
