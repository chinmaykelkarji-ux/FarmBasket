import { describe, expect, it } from 'vitest'
import { products } from '@/data/products'
import { alternativesFor, findExactVariant, optionState, resolveSelection, variantLabel } from '@/features/catalog/variants'
import { computeTotals, linePrice, stepQuantity } from '@/features/cart/pricing'
import { applyFilters, defaultFilters } from '@/features/catalog/filters'
import { productService } from '@/services/productService'
import { currentStatus } from '@/services/orderService'
import type { Order } from '@/types'

const tomato = products.find((p) => p.id === 'tomato')!
const onion = products.find((p) => p.id === 'onion')!

describe('catalogue', () => {
  it('has 30–45 SKUs with unique ids and valid recommended variants', () => {
    const skus = products.flatMap((p) => p.variants)
    expect(skus.length).toBeGreaterThanOrEqual(30)
    expect(skus.length).toBeLessThanOrEqual(45)
    expect(new Set(skus.map((v) => v.id)).size).toBe(skus.length)
    for (const p of products) expect(p.variants.some((v) => v.id === p.recommendedVariantId)).toBe(true)
  })
})

describe('variant selection', () => {
  it('finds exact variants and labels them', () => {
    const v = findExactVariant(tomato, { colour: 'red', size: 'medium' })!
    expect(variantLabel(tomato, v)).toBe('Red • Medium')
  })

  it('keeps the changed attribute and adjusts the rest to an existing variant', () => {
    const r = resolveSelection(tomato, { colour: 'red', size: 'small' }, 'colour', 'green')
    expect(r.variant.attributes).toEqual({ colour: 'green', size: 'medium' })
    expect(r.adjusted).toEqual(['size'])
  })

  it('does not mark a colour sold out when other sizes are in stock', () => {
    expect(optionState(tomato, { colour: 'red', size: 'large' }, 'colour', 'red')).toBe('other_combo')
    expect(optionState(tomato, { colour: 'red', size: 'medium' }, 'size', 'large')).toBe('sold_out')
  })

  it('suggests in-stock alternatives for a sold-out variant', () => {
    const redLarge = findExactVariant(tomato, { colour: 'red', size: 'large' })!
    const alts = alternativesFor(tomato, redLarge)
    expect(alts.every((a) => a.inventory !== 'out_of_stock')).toBe(true)
    expect(alts[0].id).toBe('tomato--red-medium')
  })
})

describe('pricing', () => {
  it('prices weight products per base unit', () => {
    const v = findExactVariant(tomato, { colour: 'red', size: 'medium' })!
    expect(linePrice(tomato.unit, v, 1000)).toBe(v.price * 2)
  })

  it('steps weight quantities and clamps to limits', () => {
    expect(stepQuantity(tomato.unit, 500, 1)).toBe(750)
    expect(stepQuantity(tomato.unit, 1000, 1)).toBe(1500)
    expect(stepQuantity(tomato.unit, 250, -1)).toBe(250)
  })

  it('applies delivery fee under threshold and first-order offer', () => {
    const v = findExactVariant(onion, { colour: 'red', size: 'medium' })!
    const small = computeTotals([{ product: onion, variant: v, quantity: 1000 }], { isFirstOrder: true })
    expect(small.deliveryFee).toBeGreaterThan(0)
    expect(small.discount).toBe(0)
    const big = computeTotals([{ product: onion, variant: v, quantity: 10000 }], { isFirstOrder: true })
    expect(big.deliveryFee).toBe(0)
    expect(big.discount).toBeGreaterThan(0)
    expect(big.total).toBe(big.subtotal - big.discount)
  })
})

describe('search', () => {
  it('returns each red onion variant for "red onion"', () => {
    const r = productService.search('red onion', products)
    const labels = r.filter((x) => x.product.id === 'onion').map((x) => variantLabel(onion, x.variant))
    expect(labels).toEqual(expect.arrayContaining(['Red • Small', 'Red • Medium', 'Red • Large']))
    expect(labels).not.toContain('White • Medium')
  })

  it('matches local names and small typos', () => {
    expect(productService.search('aloo', products)[0].product.id).toBe('potato')
    expect(productService.search('tomatto', products)[0].product.id).toBe('tomato')
  })

  it('finds characteristics across products', () => {
    const ids = new Set(productService.search('green', products).map((r) => r.product.id))
    for (const id of ['tomato', 'capsicum', 'green-chilli']) expect(ids.has(id)).toBe(true)
  })
})

describe('filters', () => {
  it('filters by size and picks the matching variant', () => {
    const entries = applyFilters(products, { ...defaultFilters, size: 'small' })
    const t = entries.find((e) => e.product.id === 'tomato')!
    expect(t.variant?.attributes.size).toBe('small')
    expect(entries.every((e) => e.product.variants.some((v) => v.attributes.size === 'small'))).toBe(true)
  })
})

describe('order status', () => {
  it('derives status from the timeline', () => {
    const t0 = Date.now()
    const order = {
      timeline: [
        { status: 'confirmed', at: new Date(t0).toISOString() },
        { status: 'picking', at: new Date(t0 + 1000).toISOString() },
        { status: 'quality_checked', at: new Date(t0 + 2000).toISOString() },
      ],
    } as Order
    expect(currentStatus(order, t0 + 500)).toBe('confirmed')
    expect(currentStatus(order, t0 + 2500)).toBe('quality_checked')
  })
})
