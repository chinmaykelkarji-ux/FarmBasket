/**
 * Service layer entry point. The UI imports from here only.
 * env.dataSource === 'supabase' is reserved for the future API adapters.
 */
export { productService } from './productService'
export { cartService } from './cartService'
export { customerService } from './customerService'
export { preferenceService } from './preferenceService'
export { orderService, currentStatus, statusReachedAt, isActive, ORDER_FLOW } from './orderService'
export { feedbackService, qualityIssueLabels } from './feedbackService'
export { slotService } from './slotService'
export { track, getEventLog } from './analytics'

import { db } from './db'

/** Prototype control: wipe all local data so a new interview starts clean. */
export function resetPrototypeData() {
  db.reset()
  try {
    window.localStorage.removeItem('fb:v1:events')
  } catch {
    /* ignore */
  }
}
