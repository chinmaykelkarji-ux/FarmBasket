import type { CategoryId, Product, ProductVariant } from '@/types'
import { recommendedVariant } from './variants'

export interface CatalogFilters {
  category: CategoryId | 'all'
  type: string | 'all'
  size: string | 'all'
  colour: string | 'all'
  price: 'all' | 'under25' | '25to50' | 'over50'
  sort: 'popular' | 'price_asc' | 'price_desc' | 'name'
}

export const defaultFilters: CatalogFilters = { category: 'all', type: 'all', size: 'all', colour: 'all', price: 'all', sort: 'popular' }

export const sizeFilterOptions = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
]

export const colourFilterOptions = [
  { value: 'red', label: 'Red', swatch: '#D8412C' },
  { value: 'white', label: 'White', swatch: '#EFE6D6' },
  { value: 'green', label: 'Green', swatch: '#5F9A45' },
  { value: 'yellow', label: 'Yellow', swatch: '#EDB42C' },
]

export const priceFilterOptions: { value: CatalogFilters['price']; label: string }[] = [
  { value: 'under25', label: 'Under ₹25' },
  { value: '25to50', label: '₹25 – ₹50' },
  { value: 'over50', label: 'Above ₹50' },
]

export const sortOptions: { value: CatalogFilters['sort']; label: string }[] = [
  { value: 'popular', label: 'Popular' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name (A–Z)' },
]

/** Natural colour of single-colour produce, so colour filters feel intuitive. */
const inherentColour: Record<string, string> = {
  beans: 'green',
  cucumber: 'green',
  okra: 'green',
  spinach: 'green',
  methi: 'green',
  coriander: 'green',
  mint: 'green',
  'curry-leaves': 'green',
  'green-chilli': 'green',
  cabbage: 'green',
  'bottle-gourd': 'green',
  lemon: 'yellow',
  cauliflower: 'white',
  garlic: 'white',
  beetroot: 'red',
}

function variantMatches(p: Product, v: ProductVariant, f: CatalogFilters) {
  if (f.size !== 'all' && v.attributes.size !== f.size) return false
  if (f.colour !== 'all') {
    const colour = v.attributes.colour ?? inherentColour[p.id]
    const c = colour === 'ripe' ? 'yellow' : colour
    if (c !== f.colour) return false
  }
  if (f.price === 'under25' && v.price >= 25) return false
  if (f.price === '25to50' && (v.price < 25 || v.price > 50)) return false
  if (f.price === 'over50' && v.price <= 50) return false
  return true
}

export interface CatalogEntry {
  product: Product
  /** Present when a characteristic filter picked a specific variant. */
  variant?: ProductVariant
}

export function applyFilters(products: Product[], f: CatalogFilters): CatalogEntry[] {
  const attrFiltered = f.size !== 'all' || f.colour !== 'all' || f.price !== 'all'
  const out: CatalogEntry[] = []
  for (const p of products) {
    if (f.category !== 'all' && p.category !== f.category && !p.collections.includes(f.category)) continue
    if (f.type !== 'all' && p.type !== f.type) continue
    if (!attrFiltered) {
      out.push({ product: p })
      continue
    }
    const matches = p.variants.filter((v) => variantMatches(p, v, f))
    if (matches.length === 0) continue
    const rec = recommendedVariant(p)
    const best = matches.find((v) => v.id === rec.id && v.inventory !== 'out_of_stock') ?? matches.find((v) => v.inventory !== 'out_of_stock') ?? matches[0]
    out.push({ product: p, variant: p.variants.length > 1 ? best : undefined })
  }
  const price = (e: CatalogEntry) => (e.variant ?? recommendedVariant(e.product)).price
  switch (f.sort) {
    case 'price_asc':
      return out.sort((a, b) => price(a) - price(b))
    case 'price_desc':
      return out.sort((a, b) => price(b) - price(a))
    case 'name':
      return out.sort((a, b) => a.product.name.localeCompare(b.product.name))
    default:
      return out.sort((a, b) => b.product.popularity - a.product.popularity)
  }
}

export function activeFilterCount(f: CatalogFilters) {
  return (['size', 'colour', 'price'] as const).filter((k) => f[k] !== 'all').length + (f.sort !== 'popular' ? 1 : 0)
}
