import { brand } from '@/config/brand'
import { commerce } from '@/config/commerce'
import type { Address, DeliverySlot, Order, OrderItem, OrderStatus, PaymentMethod, Product } from '@/types'
import { computeTotals, linePrice } from '@/features/cart/pricing'
import { getVariant, variantLabel } from '@/features/catalog/variants'
import { formatQuantity, uid } from '@/utils/format'
import { db, latency } from './db'

const TABLE = 'orders'
const COUNTER = 'order_counter'

export const ORDER_FLOW: OrderStatus[] = ['confirmed', 'picking', 'quality_checked', 'packed', 'out_for_delivery', 'delivered']

export interface PlaceOrderInput {
  lines: { product: Product; variantId: string; quantity: number }[]
  address: Address
  slot: DeliverySlot
  payment: PaymentMethod
  note?: string
}

function readAll(): Order[] {
  return db.read<Order[]>(TABLE, [])
}

function writeAll(orders: Order[]) {
  db.write(TABLE, orders)
}

function buildTimeline(placedAt: Date) {
  const t = commerce.trackingTimelineSeconds
  return ORDER_FLOW.map((status) => ({
    status,
    at: new Date(placedAt.getTime() + t[status as keyof typeof t] * 1000).toISOString(),
  }))
}

export function currentStatus(order: Order, now = Date.now()): OrderStatus {
  let status: OrderStatus = 'confirmed'
  for (const e of order.timeline) if (new Date(e.at).getTime() <= now) status = e.status
  return status
}

export function statusReachedAt(order: Order, status: OrderStatus): string | undefined {
  return order.timeline.find((e) => e.status === status)?.at
}

export function isActive(order: Order, now = Date.now()) {
  const s = currentStatus(order, now)
  return s !== 'delivered' && s !== 'cancelled'
}

export const orderService = {
  async place(input: PlaceOrderInput): Promise<Order> {
    await latency(700)
    if (input.lines.length === 0) throw new Error('Your basket is empty.')
    const existing = readAll()

    // NOTE: prices are recomputed from catalogue variant IDs, never taken from the UI.
    const items: OrderItem[] = input.lines.map((l) => {
      const variant = getVariant(l.product, l.variantId)
      if (!variant) throw new Error(`${l.product.name} is no longer available.`)
      if (variant.inventory === 'out_of_stock') throw new Error(`${l.product.name} (${variantLabel(l.product, variant)}) just sold out.`)
      return {
        productId: l.product.id,
        variantId: variant.id,
        productName: l.product.name,
        variantLabel: variantLabel(l.product, variant),
        attributes: variant.attributes,
        quantity: l.quantity,
        quantityLabel: formatQuantity(l.product.unit, l.quantity),
        unitPrice: variant.price,
        lineTotal: linePrice(l.product.unit, variant, l.quantity),
      }
    })

    const totals = computeTotals(
      input.lines.map((l) => ({ product: l.product, variant: getVariant(l.product, l.variantId)!, quantity: l.quantity })),
      { isFirstOrder: existing.length === 0, slotFee: input.slot.fee },
    )

    const counter = db.read<number>(COUNTER, 1023) + 1
    db.write(COUNTER, counter)
    const placedAt = new Date()

    const order: Order = {
      id: uid('ord_'),
      number: `${brand.orderPrefix}${counter}`,
      customerId: 'cust_local',
      items,
      address: input.address,
      slot: input.slot,
      payment: input.payment,
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
      discount: totals.discount,
      total: totals.total,
      placedAt: placedAt.toISOString(),
      timeline: input.slot.kind === 'asap' ? buildTimeline(placedAt) : [{ status: 'confirmed', at: placedAt.toISOString() }],
      note: input.note?.trim().slice(0, 300) || undefined,
    }
    writeAll([order, ...existing])
    return order
  },

  async list(): Promise<Order[]> {
    await latency(260)
    return readAll()
  },

  listSync(): Order[] {
    return readAll()
  },

  async get(id: string): Promise<Order | undefined> {
    await latency(200)
    return readAll().find((o) => o.id === id || o.number === id)
  },

  /** Prototype control: move the order one step forward now. */
  advance(id: string): Order | undefined {
    const orders = readAll()
    const order = orders.find((o) => o.id === id)
    if (!order) return undefined
    const now = Date.now()
    const idx = ORDER_FLOW.indexOf(currentStatus(order, now))
    const next = ORDER_FLOW[idx + 1]
    if (!next) return order
    const t = commerce.trackingTimelineSeconds
    const base = t[next as keyof typeof t]
    order.timeline = ORDER_FLOW.map((status, i) => {
      if (i <= idx) return order.timeline.find((e) => e.status === status) ?? { status, at: new Date(now).toISOString() }
      return { status, at: new Date(now + (t[status as keyof typeof t] - base) * 1000).toISOString() }
    })
    writeAll(orders)
    return order
  },

  /** Prototype control: mark delivered immediately. */
  completeDelivery(id: string): Order | undefined {
    const orders = readAll()
    const order = orders.find((o) => o.id === id)
    if (!order) return undefined
    const now = Date.now()
    order.timeline = ORDER_FLOW.map((status) => {
      const existing = order.timeline.find((e) => e.status === status)
      const at = existing && new Date(existing.at).getTime() <= now ? existing.at : new Date(now).toISOString()
      return { status, at }
    })
    writeAll(orders)
    return order
  },
}
