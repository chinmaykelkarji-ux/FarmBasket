/**
 * Pricing rules. The client computes these for display only — production
 * checkout must re-price every line on the server from variant IDs.
 */
import { commerce } from '@/config/commerce'
import type { CartTotals, Product, ProductVariant, SellingUnit } from '@/types'

export function linePrice(unit: SellingUnit, variant: ProductVariant, quantity: number): number {
  const raw = unit.kind === 'weight' ? (variant.price * quantity) / unit.baseQty : variant.price * quantity
  return Math.round(raw * 100) / 100
}

export function clampQuantity(unit: SellingUnit, quantity: number): number {
  const q = Math.round(quantity / unit.step) * unit.step
  return Math.min(unit.max, Math.max(unit.min, q))
}

export function stepQuantity(unit: SellingUnit, quantity: number, direction: 1 | -1): number {
  // Weight products step faster above 1 kg (250 g → 500 g) to keep taps low.
  let step: number = unit.step
  if (unit.kind === 'weight' && unit.step < 500 && (direction === 1 ? quantity >= 1000 : quantity > 1000)) step = 500
  return clampQuantity(unit, quantity + direction * step)
}

/** Quick-pick quantity chips shown on the product page. */
export function quantityPresets(unit: SellingUnit): number[] {
  if (unit.kind === 'count') return [1, 2, 3].filter((n) => n <= unit.max)
  if (unit.baseQty <= 100) return [100, 250, 500].filter((g) => g >= unit.min && g <= unit.max)
  if (unit.baseQty === 250) return [250, 500, 1000].filter((g) => g >= unit.min && g <= unit.max)
  return [500, 1000, 2000].filter((g) => g >= unit.min && g <= unit.max)
}

export interface PricedLine {
  product: Product
  variant: ProductVariant
  quantity: number
}

export function computeTotals(lines: PricedLine[], opts: { isFirstOrder: boolean; slotFee?: number }): CartTotals {
  const subtotal = Math.round(lines.reduce((sum, l) => sum + linePrice(l.product.unit, l.variant, l.quantity), 0) * 100) / 100
  const itemCount = lines.length
  const baseFee = subtotal === 0 || subtotal >= commerce.freeDeliveryThreshold ? 0 : commerce.deliveryFee
  const deliveryFee = subtotal === 0 ? 0 : baseFee + (opts.slotFee ?? 0)
  const offer = commerce.firstOrderOffer
  const discount = opts.isFirstOrder && subtotal >= offer.minSubtotal ? offer.amount : 0
  return {
    itemCount,
    subtotal,
    deliveryFee,
    discount,
    discountLabel: discount ? offer.label : undefined,
    total: Math.max(0, Math.round((subtotal + deliveryFee - discount) * 100) / 100),
    freeDeliveryGap: subtotal > 0 && subtotal < commerce.freeDeliveryThreshold ? commerce.freeDeliveryThreshold - subtotal : 0,
  }
}
