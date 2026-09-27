import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { cartService, orderService, track } from '@/services'
import type { CartItem, CartTotals, Product, ProductVariant } from '@/types'
import { clampQuantity, computeTotals } from '@/features/cart/pricing'
import { getVariant } from '@/features/catalog/variants'
import { uid } from '@/utils/format'
import { useCatalog } from './CatalogContext'

type Action =
  | { type: 'add'; productId: string; variantId: string; quantity: number }
  | { type: 'setQty'; lineId: string; quantity: number }
  | { type: 'remove'; lineId: string }
  | { type: 'changeVariant'; lineId: string; variantId: string; quantity: number }
  | { type: 'replace'; items: CartItem[] }
  | { type: 'clear' }

function reducer(state: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case 'add': {
      const existing = state.find((i) => i.variantId === action.variantId)
      if (existing) return state.map((i) => (i === existing ? { ...i, quantity: i.quantity + action.quantity } : i))
      return [
        ...state,
        { id: uid('ci_'), productId: action.productId, variantId: action.variantId, quantity: action.quantity, addedAt: new Date().toISOString() },
      ]
    }
    case 'setQty':
      return state.map((i) => (i.id === action.lineId ? { ...i, quantity: action.quantity } : i))
    case 'remove':
      return state.filter((i) => i.id !== action.lineId)
    case 'changeVariant': {
      const line = state.find((i) => i.id === action.lineId)
      if (!line) return state
      const dupe = state.find((i) => i.variantId === action.variantId && i.id !== action.lineId)
      if (dupe) {
        return state
          .filter((i) => i.id !== action.lineId)
          .map((i) => (i.id === dupe.id ? { ...i, quantity: i.quantity + action.quantity } : i))
      }
      return state.map((i) => (i.id === action.lineId ? { ...i, variantId: action.variantId, quantity: action.quantity } : i))
    }
    case 'replace':
      return action.items
    case 'clear':
      return []
  }
}

export interface CartLine extends CartItem {
  product: Product
  variant: ProductVariant
}

interface CartApi {
  items: CartItem[]
  lines: CartLine[]
  totals: CartTotals
  isFirstOrder: boolean
  add: (product: Product, variant: ProductVariant, quantity: number, source?: string) => void
  setQuantity: (lineId: string, quantity: number) => void
  remove: (lineId: string) => void
  changeVariant: (lineId: string, variantId: string, quantity: number) => void
  addMany: (entries: { product: Product; variant: ProductVariant; quantity: number }[], source: string) => number
  clear: () => void
  quantityOf: (variantId: string) => number
}

const CartContext = createContext<CartApi | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { byId } = useCatalog()
  const [items, dispatch] = useReducer(reducer, undefined, () => cartService.load())

  useEffect(() => cartService.save(items), [items])

  const lines = useMemo<CartLine[]>(
    () =>
      items.flatMap((i) => {
        const product = byId[i.productId]
        const variant = product && getVariant(product, i.variantId)
        return product && variant ? [{ ...i, product, variant }] : []
      }),
    [items, byId],
  )

  const isFirstOrder = orderService.listSync().length === 0
  const totals = useMemo(() => computeTotals(lines, { isFirstOrder }), [lines, isFirstOrder])

  const add = useCallback<CartApi['add']>((product, variant, quantity, source = 'product') => {
    const q = clampQuantity(product.unit, quantity)
    dispatch({ type: 'add', productId: product.id, variantId: variant.id, quantity: q })
    track('add_to_cart', { productId: product.id, variantId: variant.id, quantity: q, source })
  }, [])

  const setQuantity = useCallback((lineId: string, quantity: number) => {
    if (quantity <= 0) dispatch({ type: 'remove', lineId })
    else dispatch({ type: 'setQty', lineId, quantity })
    track('cart_updated', { lineId, quantity, change: quantity <= 0 ? 'remove' : 'quantity' })
  }, [])

  const remove = useCallback((lineId: string) => {
    dispatch({ type: 'remove', lineId })
    track('cart_updated', { lineId, change: 'remove' })
  }, [])

  const changeVariant = useCallback((lineId: string, variantId: string, quantity: number) => {
    dispatch({ type: 'changeVariant', lineId, variantId, quantity })
    track('cart_updated', { lineId, variantId, quantity, change: 'variant' })
  }, [])

  const addMany = useCallback<CartApi['addMany']>((entries, source) => {
    let added = 0
    for (const e of entries) {
      if (e.variant.inventory === 'out_of_stock') continue
      dispatch({ type: 'add', productId: e.product.id, variantId: e.variant.id, quantity: clampQuantity(e.product.unit, e.quantity) })
      added++
    }
    track('add_to_cart', { source, count: added })
    return added
  }, [])

  const clear = useCallback(() => dispatch({ type: 'clear' }), [])
  const quantityOf = useCallback((variantId: string) => items.find((i) => i.variantId === variantId)?.quantity ?? 0, [items])

  const value = useMemo(
    () => ({ items, lines, totals, isFirstOrder, add, setQuantity, remove, changeVariant, addMany, clear, quantityOf }),
    [items, lines, totals, isFirstOrder, add, setQuantity, remove, changeVariant, addMany, clear, quantityOf],
  )
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
