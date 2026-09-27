/**
 * Variant selection logic — pure functions, no React.
 * A product has attributes (colour, size, variety) and a set of variants that
 * exist for particular attribute combinations. Not every combination exists.
 */
import type { AttributeKey, Product, ProductVariant } from '@/types'
import { titleCase } from '@/utils/format'

export type Selection = Partial<Record<AttributeKey, string>>

export function getVariant(product: Product, variantId: string | undefined): ProductVariant | undefined {
  return product.variants.find((v) => v.id === variantId)
}

export function recommendedVariant(product: Product): ProductVariant {
  return getVariant(product, product.recommendedVariantId) ?? product.variants[0]
}

export function matchesSelection(variant: ProductVariant, selection: Selection): boolean {
  return Object.entries(selection).every(([k, v]) => variant.attributes[k as AttributeKey] === v)
}

export function findExactVariant(product: Product, selection: Selection): ProductVariant | undefined {
  const keys = product.attributes.map((a) => a.key)
  return product.variants.find((v) => keys.every((k) => v.attributes[k] === selection[k]))
}

/**
 * When the customer changes one attribute, keep that choice fixed and find the
 * closest existing variant for the rest (prefers in-stock, then fewest changes).
 */
export function resolveSelection(
  product: Product,
  current: Selection,
  changedKey: AttributeKey,
  value: string,
): { variant: ProductVariant; adjusted: AttributeKey[] } {
  const next: Selection = { ...current, [changedKey]: value }
  const exact = findExactVariant(product, next)
  if (exact) return { variant: exact, adjusted: [] }

  const candidates = product.variants.filter((v) => v.attributes[changedKey] === value)
  const scored = candidates
    .map((v) => {
      const diffs = product.attributes
        .map((a) => a.key)
        .filter((k) => k !== changedKey && v.attributes[k] !== next[k])
      const stockPenalty = v.inventory === 'out_of_stock' ? 10 : 0
      return { v, diffs, score: diffs.length + stockPenalty }
    })
    .sort((a, b) => a.score - b.score)

  const best = scored[0]
  if (!best) {
    const fallback = recommendedVariant(product)
    return { variant: fallback, adjusted: product.attributes.map((a) => a.key) }
  }
  return { variant: best.v, adjusted: best.diffs }
}

/** Whether choosing `value` for `key` (keeping other choices) lands on an existing variant. */
export function optionState(
  product: Product,
  current: Selection,
  key: AttributeKey,
  value: string,
): 'available' | 'sold_out' | 'other_combo' {
  const exact = findExactVariant(product, { ...current, [key]: value })
  if (exact && exact.inventory !== 'out_of_stock') return 'available'
  const anyInStock = product.variants.some((v) => v.attributes[key] === value && v.inventory !== 'out_of_stock')
  return anyInStock ? 'other_combo' : 'sold_out'
}

/** "Red • Medium" */
export function variantLabel(product: Product, variant: ProductVariant): string {
  if (product.attributes.length === 0) return 'Regular'
  return product.attributes
    .map((a) => {
      const val = variant.attributes[a.key]
      const opt = a.options.find((o) => o.value === val)
      return opt?.label ?? (val ? titleCase(val) : '')
    })
    .filter(Boolean)
    .join(' • ')
}

export function attributeLabels(product: Product, selection: Selection): string[] {
  return product.attributes
    .map((a) => a.options.find((o) => o.value === selection[a.key])?.label)
    .filter((x): x is string => Boolean(x))
}

/** In-stock alternatives, nearest first, for a sold-out variant. */
export function alternativesFor(product: Product, variant: ProductVariant, limit = 2): ProductVariant[] {
  return product.variants
    .filter((v) => v.id !== variant.id && v.inventory !== 'out_of_stock')
    .map((v) => ({
      v,
      diff: product.attributes.filter((a) => v.attributes[a.key] !== variant.attributes[a.key]).length,
      rec: v.id === product.recommendedVariantId ? -0.5 : 0,
    }))
    .sort((a, b) => a.diff + a.rec - (b.diff + b.rec))
    .slice(0, limit)
    .map((x) => x.v)
}

export function isCustomizable(product: Product): boolean {
  return product.variants.length > 1
}

export function minPrice(product: Product): number {
  return Math.min(...product.variants.map((v) => v.price))
}
