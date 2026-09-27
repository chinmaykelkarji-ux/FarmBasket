/**
 * Smart basket — simple seeded rules, not a recommendation engine.
 * Quantities are typical weekly amounts for a 3–4 person household,
 * scaled for smaller / larger families.
 */
import type { Product } from '@/types'
import { clampQuantity } from '@/features/cart/pricing'

export type FamilySize = 'small' | 'medium' | 'large'

export const familySizes: { id: FamilySize; label: string; people: string; multiplier: number }[] = [
  { id: 'small', label: 'Small', people: '1–2 people', multiplier: 0.5 },
  { id: 'medium', label: 'Medium', people: '3–4 people', multiplier: 1 },
  { id: 'large', label: 'Large', people: '5+ people', multiplier: 1.5 },
]

interface Rule {
  productId: string
  base: number
  group: 'core' | 'greens' | 'fruits'
}

const RULES: Rule[] = [
  { productId: 'tomato', base: 1000, group: 'core' },
  { productId: 'onion', base: 1000, group: 'core' },
  { productId: 'potato', base: 1000, group: 'core' },
  { productId: 'carrot', base: 500, group: 'core' },
  { productId: 'beans', base: 500, group: 'core' },
  { productId: 'cucumber', base: 500, group: 'core' },
  { productId: 'capsicum', base: 250, group: 'core' },
  { productId: 'green-chilli', base: 100, group: 'core' },
  { productId: 'ginger', base: 100, group: 'core' },
  { productId: 'garlic', base: 100, group: 'core' },
  { productId: 'coriander', base: 2, group: 'core' },
  { productId: 'curry-leaves', base: 1, group: 'core' },
  { productId: 'spinach', base: 2, group: 'greens' },
  { productId: 'methi', base: 1, group: 'greens' },
  { productId: 'banana', base: 1, group: 'fruits' },
  { productId: 'lemon', base: 1, group: 'fruits' },
]

export interface BasketSuggestion {
  productId: string
  quantity: number
}

export function buildBasket(byId: Record<string, Product>, size: FamilySize, opts: { greens: boolean; fruits: boolean }): BasketSuggestion[] {
  const mult = familySizes.find((f) => f.id === size)!.multiplier
  return RULES.filter((r) => r.group === 'core' || (r.group === 'greens' && opts.greens) || (r.group === 'fruits' && opts.fruits))
    .filter((r) => byId[r.productId])
    .map((r) => {
      const p = byId[r.productId]
      const raw = r.base * mult
      const q = p.unit.kind === 'count' ? Math.max(1, Math.round(raw)) : clampQuantity(p.unit, raw)
      return { productId: r.productId, quantity: q }
    })
}
