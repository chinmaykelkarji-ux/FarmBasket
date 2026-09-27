import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { AttributeKey, Product, ProductVariant } from '@/types'
import { ProductTile } from '@/components/product/ProductTile'
import { VariantPicker } from '@/components/product/VariantPicker'
import { QuantityPicker } from '@/components/product/QuantityPicker'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductRail } from '@/components/product/ProductRail'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { FreshnessDot, Stars } from '@/components/ui/misc'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { productService, track } from '@/services'
import { alternativesFor, getVariant, isCustomizable, recommendedVariant, resolveSelection, variantLabel, type Selection } from '@/features/catalog/variants'
import { clampQuantity, linePrice } from '@/features/cart/pricing'
import { formatPrice, formatQuantity, formatUnitSuffix } from '@/utils/format'
import { useCatalog } from '@/state/CatalogContext'
import { useCart } from '@/state/CartContext'
import { usePreferences } from '@/state/PreferencesContext'
import { useToast } from '@/state/ToastContext'
import { t } from '@/i18n/strings'

export default function ProductPage() {
  const { slug = '' } = useParams()
  const [product, setProduct] = useState<Product | null | undefined>(undefined)

  useEffect(() => {
    let alive = true
    setProduct(undefined)
    productService.getBySlug(slug).then((p) => alive && setProduct(p ?? null))
    return () => {
      alive = false
    }
  }, [slug])

  if (product === undefined) return <ProductSkeleton />
  if (product === null)
    return (
      <EmptyState
        title="We couldn't find that item"
        body="It may have been renamed or is not stocked in Belagavi yet."
        action={<ButtonLink to="/vegetables">Browse vegetables</ButtonLink>}
      />
    )
  return <ProductDetail key={product.id} product={product} />
}

function ProductDetail({ product }: { product: Product }) {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { add, quantityOf } = useCart()
  const { usualFor, save, prefs } = usePreferences()
  const { products } = useCatalog()
  const toast = useToast()
  const usual = usualFor(product)
  const rec = recommendedVariant(product)

  const initialVariant = getVariant(product, params.get('variant') ?? undefined) ?? usual?.variant ?? rec
  const [variant, setVariant] = useState<ProductVariant>(initialVariant)
  const [quantity, setQuantity] = useState(() =>
    clampQuantity(product.unit, usual && usual.variant.id === initialVariant.id ? usual.pref.quantity : product.defaultQty),
  )
  const [adjusted, setAdjusted] = useState<AttributeKey[]>([])
  const [justAdded, setJustAdded] = useState(false)
  const customizedTracked = useRef(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  const selection: Selection = variant.attributes
  const soldOut = variant.inventory === 'out_of_stock'
  const total = linePrice(product.unit, variant, quantity)
  const label = variantLabel(product, variant)
  const customizable = isCustomizable(product)
  const inCart = quantityOf(variant.id)
  const savedPref = prefs[product.id]
  const isSavedUsual =
    savedPref?.source === 'saved' && usual?.variant.id === variant.id && savedPref.quantity === quantity

  useEffect(() => {
    track('product_viewed', { productId: product.id, variantId: initialVariant.id, hasUsual: Boolean(usual) })
  }, [product.id])

  const selectVariant = (v: ProductVariant, adj: AttributeKey[] = []) => {
    setVariant(v)
    setAdjusted(adj)
    setJustAdded(false)
    setParams((p) => {
      p.set('variant', v.id)
      return p
    }, { replace: true, preventScrollReset: true })
    track('variant_selected', { productId: product.id, variantId: v.id, attributes: v.attributes })
    if (!customizedTracked.current && v.id !== rec.id) {
      customizedTracked.current = true
      track('product_customized', { productId: product.id, variantId: v.id })
    }
  }

  const onAttrChange = (key: AttributeKey, value: string) => {
    const r = resolveSelection(product, selection, key, value)
    selectVariant(r.variant, r.adjusted)
  }

  const onAdd = () => {
    add(product, variant, quantity, 'product_page')
    setJustAdded(true)
    toast.show(`${product.name} · ${label} · ${formatQuantity(product.unit, quantity)} added`, {
      tone: 'success',
      action: { label: 'View basket', onClick: () => navigate('/cart') },
    })
  }

  const onSaveUsual = () => {
    save({ productId: product.id, attributes: variant.attributes, quantity })
    toast.show(`Saved as your usual ${product.name.toLowerCase()}`)
  }

  const alternatives = soldOut ? alternativesFor(product, variant) : []
  const similar = useMemo(
    () => products.filter((p) => p.id !== product.id && (p.type === product.type || p.category === product.category)).slice(0, 8),
    [products, product],
  )


  return (
    <div className="mx-auto max-w-6xl px-4">
      <nav className="flex items-center gap-2 pt-4 pb-3 text-sm text-muted md:pt-6" aria-label="Breadcrumb">
        <button type="button" onClick={() => navigate(-1)} className="grid size-10 place-items-center rounded-full bg-white shadow-card hover:bg-sand md:hidden" aria-label="Back">
          <Icon name="chevronLeft" />
        </button>
        <Link to="/vegetables" className="hidden hover:text-ink md:inline">
          Shop
        </Link>
        <span className="hidden md:inline">/</span>
        <Link to={`/vegetables?category=${product.category}`} className="hidden capitalize hover:text-ink md:inline">
          {product.category.replace('-', ' ')}
        </Link>
        <span className="hidden md:inline">/</span>
        <span className="font-semibold text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-6 md:grid-cols-2 md:gap-10 [&>*]:min-w-0">
        {/* Visual */}
        <div className="md:sticky md:top-24 md:self-start">
          <div className="relative">
            <ProductTile product={product} variant={variant} className="aspect-[4/3] rounded-[28px] md:aspect-square" artClassName="size-[70%]" />
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              {variant.id === rec.id && customizable && (
                <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-forest shadow-sm">Recommended</span>
              )}
              {usual?.variant.id === variant.id && (
                <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-clay shadow-sm">{t('yourUsual')}</span>
              )}
            </div>
            {customizable && (
              <p className="absolute right-3 bottom-3 rounded-full bg-white/85 px-2.5 py-1 text-xs font-semibold text-ink-soft shadow-sm backdrop-blur">
                Showing: {label}
              </p>
            )}
          </div>
          <ul className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <li className="rounded-2xl bg-white p-2.5 shadow-card">
              <Icon name="leaf" className="mx-auto size-4.5 text-leaf" />
              <span className="mt-1 block font-semibold">{product.freshness.arrival}</span>
            </li>
            <li className="rounded-2xl bg-white p-2.5 shadow-card">
              <Icon name="clock" className="mx-auto size-4.5 text-turmeric" />
              <span className="mt-1 block font-semibold">Keeps ~{product.freshness.shelfLifeDays} days</span>
            </li>
            <li className="rounded-2xl bg-white p-2.5 shadow-card">
              <Icon name="shield" className="mx-auto size-4.5 text-forest" />
              <span className="mt-1 block font-semibold">Quality checked</span>
            </li>
          </ul>
        </div>

        {/* Details */}
        <div className="pb-4">
          {soldOut ? (
            <p className="text-[11px] font-semibold text-clay">This variety is sold out today</p>
          ) : (
            <FreshnessDot label="Available today" />
          )}
          <h1 className="mt-1 font-display text-[32px] leading-tight font-semibold md:text-[40px]">{product.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <Stars value={product.rating} count={product.ratingCount} />
            <span className="text-sm text-muted">{product.type === product.name ? 'Regular variety' : product.type}</span>
          </div>
          <p className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold">{formatPrice(variant.price)}</span>
            <span className="text-muted">{formatUnitSuffix(product.unit)}</span>
          </p>

          {/* Your usual */}
          {usual && usual.variant.id !== variant.id && (
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-clay/25 bg-clay-50 p-3.5">
              <Icon name="bookmark" className="size-5 shrink-0 text-clay" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold tracking-wide text-clay uppercase">{t('yourUsual')}</p>
                <p className="truncate font-semibold">
                  {variantLabel(product, usual.variant)} · {formatQuantity(product.unit, usual.pref.quantity)}
                </p>
              </div>
              <Button
                size="sm"
                variant="accent"
                disabled={usual.variant.inventory === 'out_of_stock'}
                onClick={() => {
                  add(product, usual.variant, usual.pref.quantity, 'product_usual')
                  toast.show(`Your usual ${product.name.toLowerCase()} added`, { action: { label: 'View basket', onClick: () => navigate('/cart') } })
                }}
              >
                Add {formatQuantity(product.unit, usual.pref.quantity)}
              </Button>
            </div>
          )}

          {/* Recommended */}
          {customizable && (
            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-card">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-forest-50 text-forest">
                <Icon name="sparkle" className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-muted">{t('recommended')}</p>
                <p className="font-bold">{variantLabel(product, rec)}</p>
              </div>
              {variant.id === rec.id ? (
                <button
                  type="button"
                  onClick={() => pickerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="rounded-xl px-3 py-2 text-sm font-bold text-forest hover:bg-forest-50"
                >
                  Customize
                </button>
              ) : (
                <button type="button" onClick={() => selectVariant(rec)} className="rounded-xl px-3 py-2 text-sm font-bold text-forest hover:bg-forest-50">
                  Use this
                </button>
              )}
            </div>
          )}

          {/* Picker */}
          <div ref={pickerRef} className="scroll-mt-24">
            {customizable && (
              <section className="mt-6" aria-labelledby="pref-h">
                <h2 id="pref-h" className="mb-3 font-display text-xl font-semibold">
                  Choose your preference
                </h2>
                <VariantPicker product={product} selection={selection} onChange={onAttrChange} />
                {adjusted.length > 0 && !soldOut && (
                  <p className="mt-3 flex items-start gap-1.5 rounded-xl bg-turmeric-50 px-3 py-2 text-sm text-ink-soft" role="status">
                    <Icon name="info" className="mt-0.5 size-4 shrink-0 text-turmeric" />
                    {label} is the closest available — we adjusted {adjusted.map((k) => product.attributes.find((a) => a.key === k)?.label.toLowerCase()).join(' and ')} for you.
                  </p>
                )}
              </section>
            )}
          </div>

          {soldOut && (
            <div className="mt-5 rounded-2xl border border-clay/30 bg-clay-50 p-4" role="alert">
              <p className="flex items-center gap-2 font-bold text-clay">
                <Icon name="alert" className="size-5" /> {t('soldOutTitle')}
              </p>
              <p className="mt-1 text-sm text-ink-soft">Today's {label.toLowerCase().replace(' • ', ', ')} {product.name.toLowerCase()} didn't meet our grade or ran out early. Try one of these:</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {alternatives.map((a) => (
                  <Button key={a.id} size="sm" variant="outline" onClick={() => selectVariant(a)}>
                    Try {variantLabel(product, a).replace(' • ', ' ')} {product.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <section className="mt-6" aria-labelledby="qty-h">
            <h2 id="qty-h" className="mb-3 text-sm font-bold">
              Quantity
            </h2>
            <QuantityPicker unit={product.unit} value={quantity} onChange={(q) => { setQuantity(q); setJustAdded(false) }} />
          </section>

          {/* Selection summary (desktop inline; mobile uses sticky bar) */}
          <section className="mt-6 rounded-3xl bg-white p-4 shadow-card" aria-labelledby="sel-h">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="sel-h" className="text-xs font-bold tracking-wide text-muted uppercase">
                  Your selection
                </h2>
                <p className="mt-1 font-bold">
                  {customizable ? label : product.name} • {formatQuantity(product.unit, quantity)}
                </p>
                <p className="mt-0.5 text-sm text-muted">{variant.note}</p>
              </div>
              <p className="text-xl font-extrabold tabular-nums">{formatPrice(total)}</p>
            </div>
            <div className="mt-4 hidden gap-2 md:flex">
              <Button size="lg" className="flex-1" onClick={onAdd} disabled={soldOut}>
                {justAdded ? <Icon name="check" className="size-5" strokeWidth={2.6} /> : <Icon name="cart" className="size-5" />}
                {justAdded ? 'Added — add more?' : 'Add to cart'}
              </Button>
              {justAdded && (
                <ButtonLink to="/cart" size="lg" variant="outline">
                  View basket
                </ButtonLink>
              )}
            </div>
            <button
              type="button"
              onClick={onSaveUsual}
              disabled={soldOut || isSavedUsual}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold text-forest disabled:text-muted"
            >
              <Icon name={isSavedUsual ? 'check' : 'bookmark'} className="size-4" />
              {isSavedUsual ? 'Saved as your usual' : `Save as my usual ${product.name.toLowerCase()}`}
            </button>
            {inCart > 0 && <p className="mt-2 text-xs text-muted">{formatQuantity(product.unit, inCart)} of this already in your basket.</p>}
          </section>

          <section className="mt-6 space-y-4 text-sm leading-relaxed text-ink-soft">
            <div>
              <h2 className="mb-1 text-base font-bold text-ink">About</h2>
              <p>{product.description}</p>
            </div>
            <div className="rounded-2xl bg-sand/60 p-4">
              <h3 className="font-bold text-ink">Sourcing</h3>
              <p className="mt-0.5">{product.freshness.sourcing}</p>
              <h3 className="mt-3 font-bold text-ink">Storage tip</h3>
              <p className="mt-0.5">{product.freshness.storageTip}</p>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <Icon name="shield" className="size-4" /> Not right? Report it after delivery and we'll make it good.{' '}
              <Link to="/quality" className="font-semibold text-forest underline">
                Quality guarantee
              </Link>
            </p>
          </section>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 font-display text-[22px] font-semibold">You may also need</h2>
          <ProductRail label="Similar products">
            {similar.map((p) => (
              <div role="listitem" key={p.id}>
                <ProductCard product={p} layout="rail" source="pdp_similar" />
              </div>
            ))}
          </ProductRail>
        </section>
      )}

      {/* Mobile sticky add bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted">
              {customizable ? `${label} • ` : ''}
              {formatQuantity(product.unit, quantity)}
            </p>
            <p className="text-lg leading-tight font-extrabold tabular-nums">{formatPrice(total)}</p>
          </div>
          {justAdded ? (
            <ButtonLink to="/cart" size="lg" variant="accent" className="px-5">
              View basket
              <Icon name="arrowRight" className="size-4" />
            </ButtonLink>
          ) : (
            <Button size="lg" onClick={onAdd} disabled={soldOut} className="px-6">
              <Icon name="cart" className="size-5" />
              {soldOut ? 'Sold out' : 'Add to cart'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function ProductSkeleton() {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 pt-16 md:grid-cols-2 md:gap-10" aria-busy="true" aria-label="Loading product">
      <Skeleton className="aspect-[4/3] w-full rounded-[28px] md:aspect-square" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="mt-6 h-20 w-full rounded-2xl" />
        <div className="grid grid-cols-3 gap-2 pt-4">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-12 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
