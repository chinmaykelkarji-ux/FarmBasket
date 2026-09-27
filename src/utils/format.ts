import type { SellingUnit } from '@/types'

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2, minimumFractionDigits: 0 })

export function formatPrice(amount: number): string {
  return inr.format(Math.round(amount * 100) / 100)
}

export function formatGrams(grams: number): string {
  if (grams >= 1000) return `${parseFloat((grams / 1000).toFixed(2))} kg`
  return `${grams} g`
}

/** "1 kg", "2 bunches", "1 piece" */
export function formatQuantity(unit: SellingUnit, quantity: number): string {
  if (unit.kind === 'weight') return formatGrams(quantity)
  if (unit.label === 'dozen') return `${quantity} dozen`
  return `${quantity} ${quantity === 1 ? unit.label : unit.labelPlural}`
}

/** "/ 500 g", "/ bunch" */
export function formatUnitSuffix(unit: SellingUnit): string {
  if (unit.kind === 'weight') return `/ ${formatGrams(unit.baseQty)}`
  return `/ ${unit.label}`
}

export function titleCase(s: string): string {
  return s
    .split(/[-\s]/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ')
    .replace('Semi Ripe', 'Semi-ripe')
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)}, ${formatTime(iso)}`
}

export function uid(prefix = ''): string {
  const rand = Math.random().toString(36).slice(2, 8)
  return `${prefix}${Date.now().toString(36)}${rand}`
}

/** Compact quantity for steppers: "500 g", "1.5 kg", "2" */
export function formatQuantityShort(unit: SellingUnit, quantity: number): string {
  return unit.kind === 'weight' ? formatGrams(quantity) : String(quantity)
}
