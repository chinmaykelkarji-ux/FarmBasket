import { Link } from 'react-router-dom'
import { ProductTile } from '@/components/product/ProductTile'
import { Stepper } from '@/components/ui/Stepper'
import { Icon } from '@/components/ui/Icon'
import { linePrice, stepQuantity } from '@/features/cart/pricing'
import { attributeLabels, isCustomizable } from '@/features/catalog/variants'
import { formatPrice, formatQuantity, formatQuantityShort, formatUnitSuffix } from '@/utils/format'
import type { CartLine } from '@/state/CartContext'

interface Props {
  line: CartLine
  onQuantity: (q: number) => void
  onEdit: () => void
  onRemove: () => void
}

export function CartLineRow({ line, onQuantity, onEdit, onRemove }: Props) {
  const { product, variant, quantity } = line
  const unit = product.unit
  const labels = attributeLabels(product, variant.attributes)
  const soldOut = variant.inventory === 'out_of_stock'

  return (
    <li className="flex gap-3 py-4 first:pt-0 last:pb-0">
      <Link to={`/product/${product.slug}?variant=${variant.id}`} className="shrink-0 rounded-2xl">
        <ProductTile product={product} variant={variant} className="size-20 rounded-2xl sm:size-24" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link to={`/product/${product.slug}?variant=${variant.id}`} className="font-bold hover:underline">
              {product.name}
            </Link>
            <div className="mt-1 flex flex-wrap gap-1">
              {labels.map((l) => (
                <span key={l} className="rounded-full bg-forest-50 px-2 py-0.5 text-xs font-semibold text-forest">
                  {l}
                </span>
              ))}
              <span className="rounded-full bg-sand px-2 py-0.5 text-xs font-semibold text-ink-soft">{formatQuantity(unit, quantity)}</span>
            </div>
          </div>
          <p className="shrink-0 text-right leading-tight">
            <span className="block font-extrabold tabular-nums">{formatPrice(linePrice(unit, variant, quantity))}</span>
            <span className="text-[11px] text-muted">
              {formatPrice(variant.price)} {formatUnitSuffix(unit)}
            </span>
          </p>
        </div>
        {soldOut && <p className="mt-1 text-xs font-semibold text-clay">Sold out today — change the preference or remove.</p>}
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
          <Stepper
            size="sm"
            label={`${product.name} quantity`}
            value={formatQuantityShort(unit, quantity)}
            onDecrement={() => onQuantity(quantity <= unit.min ? 0 : stepQuantity(unit, quantity, -1))}
            onIncrement={() => onQuantity(stepQuantity(unit, quantity, 1))}
            canIncrement={quantity < unit.max}
          />
          <div className="flex items-center gap-1">
            <button type="button" onClick={onEdit} className="inline-flex h-9 items-center gap-1 rounded-xl px-2.5 text-sm font-semibold text-forest hover:bg-forest-50">
              <Icon name="edit" className="size-4" />
              {isCustomizable(product) ? 'Change preference' : 'Edit'}
            </button>
            <button type="button" onClick={onRemove} className="grid size-9 place-items-center rounded-xl text-muted hover:bg-clay-50 hover:text-clay" aria-label={`Remove ${product.name}`}>
              <Icon name="trash" className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </li>
  )
}
