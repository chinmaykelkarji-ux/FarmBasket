import type { Category } from '@/types'

export const categories: Category[] = [
  { id: 'vegetables', name: 'Vegetables', blurb: 'Everyday sabzi, chosen your way', art: 'tomato', tint: '#FBE7DF' },
  { id: 'leafy-greens', name: 'Leafy Greens', blurb: 'Tender bunches, bundled today', art: 'spinach', tint: '#E4EEDD' },
  { id: 'herbs', name: 'Herbs', blurb: 'Coriander, mint, curry leaves', art: 'coriander', tint: '#E8F0DF' },
  { id: 'fruits', name: 'Fruits', blurb: 'A small, careful selection', art: 'banana', tint: '#FBF0D5' },
  { id: 'essentials', name: 'Everyday Essentials', blurb: 'Onion, potato, ginger, garlic', art: 'onion', tint: '#F3E4EA' },
]

export const categoryById = Object.fromEntries(categories.map((c) => [c.id, c])) as Record<Category['id'], Category>
