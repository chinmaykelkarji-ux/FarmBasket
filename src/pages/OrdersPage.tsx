import { Link } from 'react-router-dom'
import { ButtonLink, Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Icon } from '@/components/ui/Icon'
import { PageHeader } from '@/components/ui/misc'
import { Skeleton } from '@/components/ui/Skeleton'
import { ProductTile } from '@/components/product/ProductTile'
import { useReorder } from '@/components/orders/useReorder'
import { currentStatus } from '@/services'
import { statusCopy } from '@/features/orders/statusCopy'
import { getVariant } from '@/features/catalog/variants'
import { useNow, useOrders } from '@/hooks/useOrders'
import { useCatalog } from '@/state/CatalogContext'
import { formatDate, formatPrice } from '@/utils/format'
import { t } from '@/i18n/strings'

export default function OrdersPage() {
  const { orders, loading } = useOrders()
  const { byId } = useCatalog()
  const reorder = useReorder()
  const now = useNow(3000)

  return (
    <div className="mx-auto max-w-3xl px-4">
      <PageHeader title="Your orders" />
      {loading ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-44 w-full rounded-3xl" />
          ))}
        </div>
      ) : orders!.length === 0 ? (
        <EmptyState art="basket" title={t('emptyOrdersTitle')} body={t('emptyOrdersSub')} action={<ButtonLink to="/vegetables" size="lg">Start shopping</ButtonLink>} />
      ) : (
        <ul className="space-y-3">
          {orders!.map((o) => {
            const s = currentStatus(o, now)
            const delivered = s === 'delivered'
            return (
              <li key={o.id} className="animate-fade-up rounded-3xl bg-white p-4 shadow-card sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">Order #{o.number}</p>
                    <p className="text-sm text-muted">
                      {formatDate(o.placedAt)} · {o.items.length} items · {formatPrice(o.total)}
                    </p>
                  </div>
                  <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${delivered ? 'bg-forest-50 text-forest' : 'bg-clay-50 text-clay'}`}>
                    <Icon name={statusCopy[s].icon} className="size-3.5" />
                    {statusCopy[s].short}
                  </span>
                </div>
                <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
                  {o.items.map((it) => {
                    const p = byId[it.productId]
                    return (
                      <div key={it.variantId} className="w-[74px] shrink-0 text-center">
                        {p && <ProductTile product={p} variant={getVariant(p, it.variantId)} className="size-[74px] rounded-2xl" />}
                        <p className="mt-1 truncate text-[11px] font-semibold">{it.productName}</p>
                        <p className="truncate text-[10px] text-muted">{it.variantLabel !== 'Regular' ? it.variantLabel : it.quantityLabel}</p>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 flex gap-2">
                  <Link to={`/orders/${o.id}`} className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-line text-sm font-semibold hover:border-ink/30">
                    {delivered ? 'View order' : 'Track order'}
                  </Link>
                  <Button size="sm" className="h-10 flex-1" onClick={() => reorder(o)}>
                    <Icon name="repeat" className="size-4" /> Buy again
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
