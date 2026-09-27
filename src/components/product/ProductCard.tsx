import { Link } from 'react-router-dom'
import type { Product, ProductVariant } from '@/types'
import { Icon } from '@/components/ui/Icon'
import { Stepper } from '@/components/ui/Stepper'
import { FreshnessDot } from '@/components/ui/misc'
import { isCustomizable, recommendedVariant, variantLabel } from '@/features/catalog/variants'
import { stepQuantity } from '@/features/cart/pricing'
import { formatPrice, formatQuantity, formatQuantityShort, formatUnitSuffix } from '@/utils/format'
import { useCart } from '@/state/CartContext'
import { usePreferences } from '@/state/PreferencesContext'
import { useToast } from '@/state/ToastContext'
import { ProductTile } from './ProductTile'

interface ProductCardProps {
  product: Product
  /** When set, the card represents this exact variant (search results, usuals). */
  variant?: ProductVariant
  quantity?: number
  layout?: 'grid' | 'rail'
  badge?: string
  source?: string
}

export function ProductCard({ product, variant: fixedVariant, quantity, layout = 'grid', badge, source = 'card' }: ProductCardProps) {
  const { add, lines, setQuantity } = useCart()
  const { usualFor } = usePreferences()
  const toast = useToast()
  const usual = usualFor(product)
  const variant = fixedVariant ?? usual?.variant ?? recommendedVariant(product)
  const qty = quantity ?? (fixedVariant ? undefined : usual?.pref.quantity) ?? product.defaultQty
  const customizable = isCustomizable(product)
  const directAdd = !customizable || Boolean(fixedVariant)
  const line = lines.find((l) => l.variantId === variant.id)
  const soldOut = variant.inventory === 'out_of_stock'
  const href = `/product/${product.slug}?variant=${encodeURIComponent(variant.id)}`
  const label = variantLabel(product, variant)
  const subline = product.attributes.length ? label : variant.note.split(/ — |\. | for /)[0].replace(/\.$/, '')
  const tag = badge ?? (usual && !fixedVariant ? 'Your usual' : undefined)

  const onAdd = () => {
    add(product, variant, qty, source)
    toast.show(`${product.name} (${formatQuantity(product.unit, qty)}) added`)
  }

  return (
    <article
      className={`group relative flex flex-col rounded-[var(--radius-card)] bg-white p-2.5 shadow-card transition-shadow hover:shadow-float ${
        layout === 'rail' ? 'w-[158px] shrink-0 snap-start sm:w-[176px]' : ''
      }`}
    >
      <Link to={href} className="block rounded-2xl" aria-label={`${product.name}, ${label}`}>
        <ProductTile product={product} variant={variant} className="aspect-square rounded-2xl" />
      </Link>
      {tag && (
        <span className="absolute top-4 left-4 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold text-clay shadow-sm backdrop-blur">
          {tag}
        </span>
      )}
      <div className="flex flex-1 flex-col px-1 pt-2.5">
        <FreshnessDot label={soldOut ? 'Sold out today' : product.freshness.arrival} />
        <Link to={href} className="mt-1 line-clamp-1 font-bold text-ink hover:underline">
          {product.name}
        </Link>
        <p className="line-clamp-1 text-[13px] text-muted">{subline}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <p className="leading-tight">
            <span className="block font-bold">{formatPrice(variant.price)}</span>
            <span className="text-xs text-muted">{formatUnitSuffix(product.unit)}</span>
          </p>
          {soldOut ? (
            <Link to={href} className="rounded-xl border border-line px-3 py-2 text-sm font-semibold text-muted">
              View
            </Link>
          ) : line && directAdd ? (
            <Stepper
              size="sm"
              tone="solid"
              label={`${product.name} quantity`}
              value={formatQuantityShort(product.unit, line.quantity)}
              onDecrement={() => setQuantity(line.id, line.quantity <= product.unit.min ? 0 : stepQuantity(product.unit, line.quantity, -1))}
              onIncrement={() => setQuantity(line.id, stepQuantity(product.unit, line.quantity, 1))}
              canIncrement={line.quantity < product.unit.max}
            />
          ) : directAdd ? (
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex h-9 items-center gap-1 rounded-xl border border-forest/15 bg-forest-50 px-3 text-sm font-bold text-forest transition-colors hover:bg-forest hover:text-white"
              aria-label={`Add ${formatQuantity(product.unit, qty)} ${product.name} ${label} to basket`}
            >
              <Icon name="plus" className="size-4" strokeWidth={2.4} />
              Add
            </button>
          ) : (
            <Link
              to={href}
              className="inline-flex h-9 items-center gap-0.5 rounded-xl border border-forest/15 bg-forest-50 px-3 text-sm font-bold text-forest transition-colors hover:bg-forest hover:text-white"
              aria-label={`Choose ${product.name} size and type`}
            >
              Choose
              <Icon name="chevronRight" className="size-3.5" strokeWidth={2.4} />
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
