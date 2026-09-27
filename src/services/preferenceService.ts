import type { CustomerPreference, Order } from '@/types'
import { db } from './db'

const TABLE = 'preferences'

type PrefMap = Record<string, CustomerPreference>

/**
 * "Your usual" — deterministic, no ML.
 * Saved preferences always win. Otherwise the most recent order line for a
 * product becomes a learned preference.
 */
export const preferenceService = {
  all(): PrefMap {
    return db.read<PrefMap>(TABLE, {})
  },

  save(pref: Omit<CustomerPreference, 'updatedAt' | 'source'> & { source?: CustomerPreference['source'] }): PrefMap {
    const map = this.all()
    map[pref.productId] = { ...pref, source: pref.source ?? 'saved', updatedAt: new Date().toISOString() }
    db.write(TABLE, map)
    return map
  },

  remove(productId: string): PrefMap {
    const map = this.all()
    delete map[productId]
    db.write(TABLE, map)
    return map
  },

  learnFromOrder(order: Order): PrefMap {
    const map = this.all()
    for (const item of order.items) {
      const existing = map[item.productId]
      if (existing?.source === 'saved') continue
      map[item.productId] = {
        productId: item.productId,
        attributes: item.attributes,
        quantity: item.quantity,
        source: 'learned',
        updatedAt: order.placedAt,
      }
    }
    db.write(TABLE, map)
    return map
  },
}
