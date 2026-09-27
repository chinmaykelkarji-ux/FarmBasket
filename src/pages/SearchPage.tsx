import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ProductCard } from '@/components/product/ProductCard'
import { Icon } from '@/components/ui/Icon'
import { Chip } from '@/components/ui/misc'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ButtonLink } from '@/components/ui/Button'
import { customerService, productService, track } from '@/services'
import { useCatalog } from '@/state/CatalogContext'
import { t } from '@/i18n/strings'

const POPULAR_SEARCHES = ['Tomato', 'Red onion', 'Potato', 'Coriander', 'Green chilli', 'Small onion', 'Semi-ripe tomato', 'Capsicum']

export default function SearchPage() {
  const { products, loading } = useCatalog()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const initial = params.get('q') ?? ''
  const [q, setQ] = useState(initial)
  const [recent, setRecent] = useState(() => customerService.recentSearches())
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    input.current?.focus()
  }, [])

  // Keep URL in sync (debounced) so results are shareable and back works.
  useEffect(() => {
    const id = window.setTimeout(() => {
      setParams(q ? { q } : {}, { replace: true })
      if (q.trim().length >= 2) track('search_performed', { query: q.trim() })
    }, 350)
    return () => window.clearTimeout(id)
  }, [q, setParams])

  const results = useMemo(() => productService.search(q, products), [q, products])
  const suggestions = useMemo(() => productService.suggestions(q, products), [q, products])

  const commit = (term: string) => {
    setQ(term)
    setRecent(customerService.addRecentSearch(term))
  }

  const hasQuery = q.trim().length > 0

  return (
    <div className="mx-auto max-w-6xl px-4">
      <form
        role="search"
        className="sticky top-16 z-30 -mx-4 bg-cream/95 px-4 pt-3 pb-3 backdrop-blur md:top-[72px] md:pt-6"
        onSubmit={(e) => {
          e.preventDefault()
          commit(q)
          input.current?.blur()
        }}
      >
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => navigate(-1)} className="grid size-11 shrink-0 place-items-center rounded-full bg-white shadow-card hover:bg-sand md:hidden" aria-label="Back">
            <Icon name="chevronLeft" />
          </button>
          <label className="relative block flex-1">
            <span className="sr-only">Search vegetables</span>
            <Icon name="search" className="absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted" />
            <input
              ref={input}
              type="search"
              enterKeyHint="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="h-12 w-full rounded-2xl border border-line bg-white pr-10 pl-11 text-[15px] shadow-card outline-none focus:border-forest [&::-webkit-search-cancel-button]:hidden"
              aria-describedby="search-count"
            />
            {q && (
              <button type="button" onClick={() => setQ('')} className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-full hover:bg-sand" aria-label="Clear search">
                <Icon name="close" className="size-4" />
              </button>
            )}
          </label>
        </div>

        {hasQuery && suggestions.length > 0 && (
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto" aria-label="Suggestions">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => commit(s)}
                className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full bg-white px-3 text-sm font-medium text-ink-soft shadow-card hover:text-ink"
              >
                <Icon name="search" className="size-3.5 text-muted" />
                {s}
              </button>
            ))}
          </div>
        )}
      </form>

      {!hasQuery ? (
        <div className="space-y-8 pt-3">
          {recent.length > 0 && (
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-bold">Recent searches</h2>
                <button
                  type="button"
                  onClick={() => {
                    customerService.clearRecentSearches()
                    setRecent([])
                  }}
                  className="text-sm font-semibold text-muted hover:text-ink"
                >
                  Clear
                </button>
              </div>
              <ul className="flex flex-wrap gap-2">
                {recent.map((r) => (
                  <li key={r}>
                    <Chip onClick={() => commit(r)}>
                      <Icon name="clock" className="size-3.5 text-muted" />
                      {r}
                    </Chip>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section>
            <h2 className="mb-2 font-bold">Popular searches</h2>
            <ul className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((r) => (
                <li key={r}>
                  <Chip onClick={() => commit(r)}>{r}</Chip>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="mb-2 font-bold">Search by what you care about</h2>
            <p className="mb-3 text-sm text-muted">Try a characteristic — we'll show matching varieties.</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { q: 'red', l: 'Red', d: 'Ripe tomatoes, red onions' },
                { q: 'green', l: 'Green', d: 'Greens, green tomatoes' },
                { q: 'small', l: 'Small', d: 'Baby potatoes, small onions' },
                { q: 'semi-ripe', l: 'Semi-ripe', d: 'Lasts through the week' },
              ].map((x) => (
                <button key={x.q} type="button" onClick={() => commit(x.q)} className="rounded-2xl bg-white p-3 text-left shadow-card hover:shadow-float">
                  <span className="block font-bold">{x.l}</span>
                  <span className="text-xs text-muted">{x.d}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 gap-3 pt-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          art="onion"
          title={`No results for “${q}”`}
          body="Check the spelling or try a local name — e.g. “kanda”, “aloo”, “palak”."
          action={<ButtonLink to="/vegetables">Browse all vegetables</ButtonLink>}
        />
      ) : (
        <section className="pt-2" aria-labelledby="search-count">
          <p id="search-count" className="mb-3 text-sm text-muted" aria-live="polite">
            {results.length} {results.length === 1 ? 'result' : 'results'} for <span className="font-semibold text-ink">“{q}”</span>
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" onClick={() => setRecent(customerService.addRecentSearch(q))}>
            {results.map((r) => {
              const specific = r.product.variants.length > 1 && r.product.attributes.length > 0 && r.variant.id !== r.product.recommendedVariantId
              return (
                <ProductCard
                  key={r.variant.id}
                  product={r.product}
                  variant={specific || results.filter((x) => x.product.id === r.product.id).length > 1 ? r.variant : undefined}
                  source="search"
                />
              )
            })}
          </div>
          <p className="mt-6 text-center text-sm text-muted">
            Looking for something else?{' '}
            <Link to="/vegetables" className="font-semibold text-forest underline">
              Browse all
            </Link>
          </p>
        </section>
      )}
    </div>
  )
}
