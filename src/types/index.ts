/**
 * Domain types for the customer app.
 * These mirror the tables sketched in supabase/schema.sql so the mock
 * services can be swapped for API/Supabase calls without touching the UI.
 */

export type CategoryId = 'vegetables' | 'leafy-greens' | 'fruits' | 'herbs' | 'essentials'

export interface Category {
  id: CategoryId
  name: string
  blurb: string
  art: ArtKind
  tint: string
}

/** Characteristics a customer can choose between. */
export type AttributeKey = 'colour' | 'size' | 'variety'

export interface AttributeOption {
  value: string
  label: string
  /** Short helper text shown under the option, e.g. "Firm, for salads". */
  hint?: string
  /** Visual swatch colour for colour/ripeness choices. */
  swatch?: string
}

export interface ProductAttribute {
  key: AttributeKey
  label: string
  options: AttributeOption[]
}

export type InventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

export type Grade = 'standard' | 'select'

/**
 * How a product is sold.
 * - weight: quantity is grams; price is per `baseQty` grams
 * - count: quantity is a number of units (bunch, piece, pack); price is per unit
 */
export type SellingUnit =
  | { kind: 'weight'; baseQty: number; step: number; min: number; max: number }
  | { kind: 'count'; label: string; labelPlural: string; approx?: string; step: 1; min: 1; max: number }

export interface ProductVariant {
  id: string
  sku: string
  productId: string
  attributes: Partial<Record<AttributeKey, string>>
  grade: Grade
  /** Price in rupees per base unit (per `unit.baseQty` grams, or per count unit). */
  price: number
  /** Optional reference price for comparison. */
  mrp?: number
  inventory: InventoryStatus
  /** Customer-facing one-liner specific to this variant. */
  note: string
  /** Art colour tone, used by the illustration system. */
  tone?: string
}

export interface FreshnessInfo {
  /** e.g. "Received this morning" */
  arrival: string
  /** Typical shelf life at home, in days. */
  shelfLifeDays: number
  /** Where it is usually selected from — deliberately general. */
  sourcing: string
  storageTip: string
}

export type ArtKind =
  | 'tomato' | 'onion' | 'potato' | 'carrot' | 'beans' | 'cucumber' | 'capsicum'
  | 'brinjal' | 'brinjal-long' | 'cabbage' | 'cauliflower' | 'chilli' | 'ginger'
  | 'garlic' | 'coriander' | 'mint' | 'spinach' | 'methi' | 'curry-leaves'
  | 'okra' | 'bottle-gourd' | 'beetroot' | 'banana' | 'lemon' | 'basket'

export interface Product {
  id: string
  slug: string
  name: string
  /** Local names for search + future i18n. */
  aliases: string[]
  category: CategoryId
  /** Secondary collections (e.g. everyday essentials). */
  collections: CategoryId[]
  /** Filter group, e.g. "Onion", "Root vegetables". */
  type: string
  description: string
  art: ArtKind
  tint: string
  unit: SellingUnit
  attributes: ProductAttribute[]
  variants: ProductVariant[]
  /** The variant most customers pick — used for "Recommended". */
  recommendedVariantId: string
  recommendedReason: string
  /** Suggested first quantity (grams or count). */
  defaultQty: number
  rating: number
  ratingCount: number
  freshness: FreshnessInfo
  popularity: number
  /** Indicates prices/stock are seeded mock data. */
  isMockData: true
}

export interface CartItem {
  id: string
  productId: string
  variantId: string
  /** grams for weight items, units for count items */
  quantity: number
  addedAt: string
}

export interface CartTotals {
  itemCount: number
  subtotal: number
  deliveryFee: number
  discount: number
  discountLabel?: string
  total: number
  freeDeliveryGap: number
}

export interface Address {
  id: string
  label: 'Home' | 'Work' | 'Other'
  name: string
  phone: string
  house: string
  street: string
  area: string
  city: string
  pincode: string
  landmark?: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  addresses: Address[]
  defaultAddressId?: string
  createdAt: string
}

export interface CustomerPreference {
  productId: string
  attributes: Partial<Record<AttributeKey, string>>
  quantity: number
  /** 'saved' = explicitly saved by customer; 'learned' = derived from orders */
  source: 'saved' | 'learned'
  note?: string
  updatedAt: string
}

export type DeliverySlotKind = 'asap' | 'later_today' | 'scheduled'

export interface DeliverySlot {
  id: string
  kind: DeliverySlotKind
  label: string
  window: string
  /** Date label, e.g. "Today" or "Tomorrow, 28 Sep" */
  day: string
  available: boolean
  fee: number
}

export type PaymentMethod = 'upi' | 'cod' | 'card'

export type OrderStatus =
  | 'confirmed'
  | 'picking'
  | 'quality_checked'
  | 'packed'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

export interface OrderStatusEvent {
  status: OrderStatus
  /** ISO time the status is (or was) reached. Mock backend precomputes these. */
  at: string
}

export interface OrderItem {
  productId: string
  variantId: string
  productName: string
  variantLabel: string
  attributes: Partial<Record<AttributeKey, string>>
  quantity: number
  quantityLabel: string
  unitPrice: number
  lineTotal: number
}

export interface Order {
  id: string
  number: string
  customerId: string
  items: OrderItem[]
  address: Address
  slot: DeliverySlot
  payment: PaymentMethod
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  placedAt: string
  timeline: OrderStatusEvent[]
  note?: string
}

export type QualityIssue =
  | 'not_fresh'
  | 'damaged'
  | 'wrong_size'
  | 'wrong_variety'
  | 'missing_item'
  | 'other'

export interface QualityFeedback {
  id: string
  orderId: string
  rating: number
  issues: QualityIssue[]
  itemVariantIds: string[]
  comment: string
  createdAt: string
  status: 'received' | 'resolved'
}

export interface SearchResult {
  product: Product
  variant: ProductVariant
  score: number
}
