import type { CartItem } from '@/types'
import { db } from './db'

const TABLE = 'cart'

/** Persists the active cart. Future: server-side cart keyed by customer/session. */
export const cartService = {
  load(): CartItem[] {
    return db.read<CartItem[]>(TABLE, [])
  },
  save(items: CartItem[]): void {
    db.write(TABLE, items)
  },
}
