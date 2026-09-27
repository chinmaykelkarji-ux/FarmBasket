import { products as seed } from '@/data/products'
import { categories } from '@/data/categories'
import type { Category, CategoryId, Product, SearchResult } from '@/types'
import { recommendedVariant } from '@/features/catalog/variants'
import { latency } from './db'

let loaded = false

async function ensureLoaded() {
  if (!loaded) {
    await latency(380)
    loaded = true
  }
}

export interface ProductQuery {
  category?: CategoryId | 'all'
  type?: string
  size?: string
  colour?: string
  priceMax?: number
  sort?: 'popular' | 'price_asc' | 'price_desc' | 'name'
}

export const productService = {
  async list(): Promise<Product[]> {
    await ensureLoaded()
    return seed
  },

  async categories(): Promise<Category[]> {
    return categories
  },

  async getBySlug(slug: string): Promise<Product | undefined> {
    await ensureLoaded()
    return seed.find((p) => p.slug === slug || p.id === slug)
  },

  /** Types shown as filter chips. */
  types(): string[] {
    return ['Tomato', 'Onion', 'Potato', 'Root vegetables', 'Leafy', 'Herbs', 'Beans & pods', 'Capsicum & chilli', 'Brinjal', 'Cabbage & cauliflower', 'Gourds & cucumbers', 'Ginger & garlic', 'Fruits']
  },

  freshToday(all: Product[]): Product[] {
    const ids = ['tomato', 'onion', 'potato', 'carrot', 'beans', 'capsicum', 'cucumber', 'brinjal', 'cauliflower', 'okra']
    return ids.map((id) => all.find((p) => p.id === id)).filter((p): p is Product => Boolean(p))
  },

  popular(all: Product[], limit = 8): Product[] {
    return [...all].sort((a, b) => b.popularity - a.popularity).slice(0, limit)
  },

  search,
  suggestions,
}

// ---------------------------------------------------------------------------
// Search — deterministic token matching across names, local names, types and
// variant characteristics. "red onion" returns each red onion variant.
// ---------------------------------------------------------------------------

function norm(s: string) {
  return s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

function editDistanceAtMostOne(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false
  let i = 0
  let j = 0
  let edits = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++
      j++
      continue
    }
    if (++edits > 1) return false
    if (a.length > b.length) i++
    else if (b.length > a.length) j++
    else {
      i++
      j++
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1
}

function tokenMatches(token: string, words: string[]): number {
  let best = 0
  for (const w of words) {
    if (w === token) return 3
    if (w.startsWith(token) && token.length >= 2) best = Math.max(best, 2)
    else if (token.length >= 4 && (w.startsWith(token.slice(0, -1)) || token.startsWith(w)) && w.length >= 4) best = Math.max(best, 1.5)
    else if (token.length >= 5 && editDistanceAtMostOne(token, w)) best = Math.max(best, 1)
  }
  return best
}

const SYNONYMS: Record<string, string> = {
  greens: 'leafy',
  leaves: 'leafy',
  veggies: 'vegetables',
  veg: 'vegetables',
  big: 'large',
  baby: 'small',
}

function productWords(p: Product): string[] {
  const cat = categories.find((c) => c.id === p.category)?.name ?? ''
  return norm([p.name, ...p.aliases, p.type, cat, p.category].join(' ')).split(' ')
}

function variantWords(p: Product, attrs: Record<string, string | undefined>): string[] {
  const words: string[] = []
  for (const a of p.attributes) {
    const val = attrs[a.key]
    const opt = a.options.find((o) => o.value === val)
    if (opt) words.push(...norm(`${opt.value} ${opt.label}`).split(' '))
  }
  return words
}

function search(query: string, all: Product[]): SearchResult[] {
  const tokens = norm(query)
    .split(' ')
    .filter(Boolean)
    .map((t) => SYNONYMS[t] ?? t)
  if (tokens.length === 0) return []

  const results: SearchResult[] = []
  for (const p of all) {
    const pWords = productWords(p)
    const productScores = tokens.map((t) => tokenMatches(t, pWords))
    const hasProductMatch = productScores.some((s) => s > 0)

    const variantHits = p.variants
      .map((v) => {
        const vWords = variantWords(p, v.attributes as Record<string, string | undefined>)
        const scores = tokens.map((t, i) => Math.max(productScores[i], tokenMatches(t, vWords) * 0.9))
        const attrMatched = tokens.some((t) => tokenMatches(t, vWords) > 0)
        const all = scores.every((s) => s > 0)
        return { v, all, attrMatched, score: scores.reduce((a, b) => a + b, 0) }
      })
      .filter((h) => h.all)

    if (variantHits.length === 0) continue

    const attrSpecific = variantHits.some((h) => h.attrMatched) && p.attributes.length > 0
    if (attrSpecific) {
      // Customer searched for characteristics — show each matching variant.
      for (const h of variantHits.filter((x) => x.attrMatched)) {
        results.push({ product: p, variant: h.v, score: h.score + p.popularity / 200 + (hasProductMatch ? 2 : 0) + (h.v.id === p.recommendedVariantId ? 0.5 : 0) - (h.v.inventory === 'out_of_stock' ? 1 : 0) })
      }
    } else {
      const rec = recommendedVariant(p)
      const best = variantHits.find((h) => h.v.id === rec.id) ?? variantHits[0]
      results.push({ product: p, variant: best.v, score: best.score + p.popularity / 100 + 1 })
    }
  }
  return results.sort((a, b) => b.score - a.score || a.variant.price - b.variant.price)
}

function suggestions(query: string, all: Product[], limit = 6): string[] {
  const q = norm(query)
  if (!q) return []
  const out = new Set<string>()
  for (const p of all) {
    if (norm(p.name).includes(q) || p.aliases.some((a) => norm(a).startsWith(q))) out.add(p.name)
    for (const v of p.variants) {
      const labels = p.attributes.map((a) => a.options.find((o) => o.value === v.attributes[a.key])?.label).filter(Boolean)
      if (labels.length === 0) continue
      const phrase = `${labels.join(' ')} ${p.name}`
      if (norm(phrase).includes(q) || norm(labels.join(' ')).startsWith(q)) out.add(phrase)
    }
  }
  return [...out].slice(0, limit)
}
