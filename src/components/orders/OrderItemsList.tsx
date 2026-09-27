import type { Order } from '@/types'
import { ProductTile } from '@/components/product/ProductTile'
import { useCatalog } from '@/state/CatalogContext'
import { getVariant } from '@/features/catalog/variants'
import { formatPrice } from '@/utils/format'

export function OrderItemsList({ order }: { order: Order }) {
  const { byId } = useCatalog()
  return (
    <ul className="divide-y divide-line">
      {order.items.map((it) => {
        const product = byId[it.productId]
        const variant = product && getVariant(product, it.variantId)
        return (
          <li key={it.variantId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            {product && <ProductTile product={product} variant={variant} className="size-12 shrink-0 rounded-xl" />}
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{it.productName}</p>
              <p className="truncate text-sm text-muted">
                {it.variantLabel} • {it.quantityLabel}
              </p>
            </div>
            <p className="font-semibold tabular-nums">{formatPrice(it.lineTotal)}</p>
          </li>
        )
      })}
    </ul>
  )
}
