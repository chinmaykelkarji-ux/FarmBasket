import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { commerce } from '@/config/commerce'
import { CartLineRow } from '@/components/cart/CartLineRow'
import { EditLineSheet } from '@/components/cart/EditLineSheet'
import { TotalsCard } from '@/components/cart/TotalsCard'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductRail } from '@/components/product/ProductRail'
import { Button, ButtonLink } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Icon } from '@/components/ui/Icon'
import { PageHeader } from '@/components/ui/misc'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { track } from '@/services'
import { useCart, type CartLine } from '@/state/CartContext'
import { useCatalog } from '@/state/CatalogContext'
import { useToast } from '@/state/ToastContext'
import { formatPrice } from '@/utils/format'
import { t } from '@/i18n/strings'

const ADD_ONS = ['coriander', 'green-chilli', 'curry-leaves', 'lemon', 'ginger', 'garlic']

export default function CartPage() {
  const { lines, totals, setQuantity, remove, changeVariant, add } = useCart()
  const { byId, loading } = useCatalog()
  const navigate = useNavigate()
  const toast = useToast()
  const [editing, setEditing] = useState<CartLine | null>(null)

  if (loading) return <PageSkeleton />

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4">
        <EmptyState title={t('emptyCartTitle')} body={t('emptyCartSub')} action={<ButtonLink to="/vegetables" size="lg">Shop vegetables</ButtonLink>} />
      </div>
    )
  }

  const hasSoldOut = lines.some((l) => l.variant.inventory === 'out_of_stock')
  const addOns = ADD_ONS.map((id) => byId[id]).filter((p) => p && !lines.some((l) => l.productId === p.id))
  const progress = Math.min(100, (totals.subtotal / commerce.freeDeliveryThreshold) * 100)

  const onRemove = (line: CartLine) => {
    remove(line.id)
    toast.show(`${line.product.name} removed`, {
      action: { label: 'Undo', onClick: () => add(line.product, line.variant, line.quantity, 'undo') },
    })
  }

  const checkout = () => {
    track('checkout_started', { items: totals.itemCount, subtotal: totals.subtotal })
    navigate('/checkout')
  }

  return (
    <div className="mx-auto max-w-6xl px-4">
      <PageHeader title="Your basket" sub={`${totals.itemCount} ${totals.itemCount === 1 ? 'item' : 'items'} · hand-picked to your preferences`} />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-4">
          <div className="rounded-2xl bg-white p-4 shadow-card">
            {totals.freeDeliveryGap > 0 ? (
              <p className="text-sm">
                Add <span className="font-bold">{formatPrice(totals.freeDeliveryGap)}</span> more for <span className="font-bold text-leaf">free delivery</span>
              </p>
            ) : (
              <p className="flex items-center gap-1.5 text-sm font-semibold text-leaf">
                <Icon name="check" className="size-4" strokeWidth={2.6} /> You've unlocked free delivery
              </p>
            )}
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand" aria-hidden>
              <div className="h-full rounded-full bg-leaf transition-[width] duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <section className="rounded-3xl bg-white p-4 shadow-card sm:p-5" aria-label="Items">
            <ul className="divide-y divide-line">
              {lines.map((l) => (
                <CartLineRow key={l.id} line={l} onQuantity={(q) => setQuantity(l.id, q)} onEdit={() => setEditing(l)} onRemove={() => onRemove(l)} />
              ))}
            </ul>
          </section>

          {addOns.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-xl font-semibold">Don't forget</h2>
              <ProductRail label="Add-ons">
                {addOns.map((p) => (
                  <div role="listitem" key={p.id}>
                    <ProductCard product={p} layout="rail" source="cart_addons" />
                  </div>
                ))}
              </ProductRail>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <TotalsCard totals={totals}>
            <div className="mt-4 flex items-start gap-2 rounded-2xl bg-sand/60 p-3 text-sm">
              <Icon name="clock" className="mt-0.5 size-4 shrink-0 text-forest" />
              <p>
                <span className="font-semibold">Estimated delivery:</span> 30–45 min, or pick a convenient slot at checkout.
              </p>
            </div>
            {hasSoldOut && (
              <p className="mt-3 text-sm font-semibold text-clay" role="alert">
                One item is sold out — change or remove it to continue.
              </p>
            )}
            <Button size="lg" className="mt-4 hidden w-full lg:flex" onClick={checkout} disabled={hasSoldOut}>
              Proceed to checkout
              <Icon name="arrowRight" className="size-4" />
            </Button>
          </TotalsCard>
          <p className="flex items-start gap-2 px-1 text-xs text-muted">
            <Icon name="shield" className="size-4 shrink-0" />
            If anything isn't right when it arrives, report it from your order and we'll replace or refund it.
          </p>
        </aside>
      </div>

      {/* Mobile checkout bar */}
      <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] md:bottom-0 z-30 border-t border-line bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-muted">Total</p>
            <p className="text-lg leading-tight font-extrabold tabular-nums">{formatPrice(totals.total)}</p>
          </div>
          <Button size="lg" onClick={checkout} disabled={hasSoldOut}>
            Proceed to checkout
            <Icon name="arrowRight" className="size-4" />
          </Button>
        </div>
      </div>
      <div className="h-20 lg:hidden" aria-hidden />

      {editing && (
        <EditLineSheet
          line={editing}
          onClose={() => setEditing(null)}
          onSave={(variantId, quantity) => {
            changeVariant(editing.id, variantId, quantity)
            setEditing(null)
            toast.show('Basket updated')
          }}
        />
      )}
    </div>
  )
}
