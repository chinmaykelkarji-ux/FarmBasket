import { useMemo, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { CategoryId } from '@/types'
import { categories, categoryById } from '@/data/categories'
import { ProductCard } from '@/components/product/ProductCard'
import { Chip } from '@/components/ui/misc'
import { Icon } from '@/components/ui/Icon'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { productService } from '@/services'
import { useCatalog } from '@/state/CatalogContext'
import {
  activeFilterCount,
  applyFilters,
  colourFilterOptions,
  defaultFilters,
  priceFilterOptions,
  sizeFilterOptions,
  sortOptions,
  type CatalogFilters,
} from '@/features/catalog/filters'

function readFilters(params: URLSearchParams): CatalogFilters {
  return {
    category: (params.get('category') as CategoryId) ?? 'all',
    type: params.get('type') ?? 'all',
    size: params.get('size') ?? 'all',
    colour: params.get('colour') ?? 'all',
    price: (params.get('price') as CatalogFilters['price']) ?? 'all',
    sort: (params.get('sort') as CatalogFilters['sort']) ?? 'popular',
  }
}

export default function CatalogPage() {
  const { products, loading } = useCatalog()
  const [params, setParams] = useSearchParams()
  const filters = readFilters(params)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [text, setText] = useState('')

  const setFilter = <K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K]) => {
    setParams(
      (p) => {
        if (value === defaultFilters[key]) p.delete(key)
        else p.set(key, String(value))
        if (key === 'category') p.delete('type')
        return p
      },
      { replace: true, preventScrollReset: true },
    )
  }

  const clearAll = () => setParams(filters.category !== 'all' ? { category: filters.category } : {}, { replace: true })

  const entries = useMemo(() => {
    let list = applyFilters(products, filters)
    if (text.trim()) {
      const hits = productService.search(text, products)
      const ids = new Set(hits.map((h) => h.product.id))
      list = list.filter((e) => ids.has(e.product.id))
    }
    return list
  }, [products, params, text])

  const types = productService.types().filter((ty) => filters.category === 'all' || products.some((p) => p.type === ty && (p.category === filters.category || p.collections.includes(filters.category as CategoryId))))
  const cat = filters.category !== 'all' ? categoryById[filters.category] : undefined
  const count = activeFilterCount(filters)

  const filterPanel = (
    <div className="space-y-6">
      <FilterGroup label="Size">
        {sizeFilterOptions.map((o) => (
          <Chip key={o.value} active={filters.size === o.value} onClick={() => setFilter('size', filters.size === o.value ? 'all' : o.value)}>
            {o.label}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup label="Colour">
        {colourFilterOptions.map((o) => (
          <Chip key={o.value} active={filters.colour === o.value} onClick={() => setFilter('colour', filters.colour === o.value ? 'all' : o.value)}>
            <span className="size-3 rounded-full ring-1 ring-black/10" style={{ backgroundColor: o.swatch }} aria-hidden />
            {o.label}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup label="Price">
        {priceFilterOptions.map((o) => (
          <Chip key={o.value} active={filters.price === o.value} onClick={() => setFilter('price', filters.price === o.value ? 'all' : o.value)}>
            {o.label}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup label="Sort by">
        {sortOptions.map((o) => (
          <Chip key={o.value} active={filters.sort === o.value} onClick={() => setFilter('sort', o.value)}>
            {o.label}
          </Chip>
        ))}
      </FilterGroup>
    </div>
  )

  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="pt-4 md:pt-8">
        <h1 className="font-display text-[28px] font-semibold md:text-4xl">{cat ? cat.name : 'Shop vegetables'}</h1>
        <p className="text-sm text-muted">{cat ? cat.blurb : 'Pick the size, colour and ripeness you like.'}</p>
      </div>

      <label className="relative mt-4 block md:max-w-md">
        <span className="sr-only">Filter this list</span>
        <Icon name="search" className="absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted" />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Filter, e.g. onion, green, small"
          className="h-11 w-full rounded-2xl border border-line bg-white pr-10 pl-10 text-sm outline-none focus:border-forest"
        />
        {text && (
          <button type="button" onClick={() => setText('')} className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-full hover:bg-sand" aria-label="Clear filter text">
            <Icon name="close" className="size-4" />
          </button>
        )}
      </label>

      {/* Category chips */}
      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0" role="group" aria-label="Categories">
        <Chip active={filters.category === 'all'} onClick={() => setFilter('category', 'all')}>
          All
        </Chip>
        {categories.map((c) => (
          <Chip key={c.id} active={filters.category === c.id} onClick={() => setFilter('category', c.id)}>
            {c.name}
          </Chip>
        ))}
      </div>

      <div className="mt-6 gap-8 md:grid md:grid-cols-[220px_1fr]">
        <aside className="hidden md:block" aria-label="Filters">
          <div className="sticky top-24 rounded-3xl bg-white p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold">Filters</h2>
              {count > 0 && (
                <button type="button" onClick={clearAll} className="text-sm font-semibold text-clay hover:underline">
                  Clear
                </button>
              )}
            </div>
            {filterPanel}
          </div>
        </aside>

        <div>
          {/* Type chips + filter button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="relative inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-ink bg-ink px-3.5 text-sm font-semibold text-white md:hidden"
            >
              <Icon name="filter" className="size-4" /> Filters
              {count > 0 && <span className="grid size-5 place-items-center rounded-full bg-clay text-[11px]">{count}</span>}
            </button>
            <div className="no-scrollbar -mr-4 flex gap-2 overflow-x-auto pr-4 md:mr-0 md:flex-wrap md:pr-0" role="group" aria-label="Type">
              <Chip active={filters.type === 'all'} onClick={() => setFilter('type', 'all')}>
                All types
              </Chip>
              {types.map((ty) => (
                <Chip key={ty} active={filters.type === ty} onClick={() => setFilter('type', filters.type === ty ? 'all' : ty)}>
                  {ty}
                </Chip>
              ))}
            </div>
          </div>

          <p className="mt-4 mb-3 text-sm text-muted" aria-live="polite">
            {loading ? 'Loading today’s produce…' : `${entries.length} ${entries.length === 1 ? 'item' : 'items'}`}
            {count > 0 && !loading && (
              <button type="button" onClick={clearAll} className="ml-2 font-semibold text-clay hover:underline md:hidden">
                Clear filters
              </button>
            )}
          </p>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <EmptyState
              art="cabbage"
              title="Nothing matches those filters"
              body="Try a different size or colour — or clear the filters to see everything available today."
              action={<Button onClick={() => { clearAll(); setText('') }}>Clear filters</Button>}
            />
          ) : (
            <div key={params.toString()} className="grid animate-fade-up grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {entries.map((e) => (
                <ProductCard key={e.product.id + (e.variant?.id ?? '')} product={e.product} variant={e.variant} source="catalog" />
              ))}
            </div>
          )}
        </div>
      </div>

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filter & sort"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={clearAll}>
              Clear
            </Button>
            <Button className="flex-[2]" onClick={() => setSheetOpen(false)}>
              Show {entries.length} {entries.length === 1 ? 'item' : 'items'}
            </Button>
          </div>
        }
      >
        {filterPanel}
      </Sheet>
    </div>
  )
}

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-bold">{label}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  )
}
