import { useParams } from 'react-router-dom'
import { commerce } from '@/config/commerce'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/misc'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { StatusTimeline } from '@/components/orders/StatusTimeline'
import { OrderItemsList } from '@/components/orders/OrderItemsList'
import { QualityFeedbackForm } from '@/components/orders/QualityFeedbackForm'
import { useReorder } from '@/components/orders/useReorder'
import { currentStatus, orderService } from '@/services'
import { statusCopy } from '@/features/orders/statusCopy'
import { useNow, useOrder } from '@/hooks/useOrders'
import { formatDateTime, formatPrice } from '@/utils/format'

export default function OrderTrackingPage() {
  const { id } = useParams()
  const { order, loading, setOrder } = useOrder(id)
  const reorder = useReorder()
  const now = useNow(1000, Boolean(order))

  if (loading) return <PageSkeleton />
  if (!order) return <EmptyState title="Order not found" body="We couldn't find this order." action={<ButtonLink to="/orders">View my orders</ButtonLink>} />

  const status = currentStatus(order, now)
  const copy = statusCopy[status]
  const delivered = status === 'delivered'
  const scheduledWaiting = order.slot.kind !== 'asap' && status === 'confirmed'

  const simulate = (fn: 'advance' | 'complete') => {
    const next = fn === 'advance' ? orderService.advance(order.id) : orderService.completeDelivery(order.id)
    if (next) setOrder({ ...next })
  }

  return (
    <div className="mx-auto max-w-5xl px-4">
      <PageHeader title={`Order #${order.number}`} sub={`Placed ${formatDateTime(order.placedAt)}`} back="/orders" />

      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-5">
          {/* Status hero */}
          <section className={`overflow-hidden rounded-[28px] p-5 text-white shadow-float transition-colors duration-700 md:p-6 ${delivered ? 'bg-leaf' : 'bg-forest'}`} aria-live="polite">
            <div className="flex items-center gap-4">
              <span key={status} className="grid size-14 shrink-0 animate-pop place-items-center rounded-2xl bg-white/15">
                <Icon name={copy.icon} className="size-7" />
              </span>
              <div className="min-w-0">
                <p className="text-sm text-white/70">{delivered ? 'Delivered' : scheduledWaiting ? 'Scheduled' : 'Live status'}</p>
                <h2 key={`t-${status}`} className="animate-fade-up font-display text-2xl font-semibold">
                  {scheduledWaiting ? 'Scheduled for delivery' : copy.title}
                </h2>
                <p className="text-white/85">
                  {scheduledWaiting ? `We'll start picking before your slot: ${order.slot.day}, ${order.slot.window}.` : copy.body}
                </p>
              </div>
            </div>
            {!delivered && (
              <p className="mt-4 flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-sm">
                <Icon name="clock" className="size-4" />
                {order.slot.kind === 'asap' ? `Estimated arrival: ${order.slot.window}` : `${order.slot.day}, ${order.slot.window}`}
              </p>
            )}
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-card">
            <StatusTimeline order={order} status={status} />
          </section>

          {delivered && <QualityFeedbackForm order={order} />}

          {commerce.prototypeControls && !delivered && (
            <div className="rounded-2xl border border-dashed border-line p-3">
              <p className="text-[11px] font-bold tracking-wider text-muted uppercase">Delivery simulation</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => simulate('advance')}>
                  Next step
                </Button>
                <Button size="sm" variant="secondary" onClick={() => simulate('complete')}>
                  Complete delivery
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <section className="rounded-3xl bg-white p-5 shadow-card">
            <h2 className="mb-3 font-bold">Items</h2>
            <OrderItemsList order={order} />
            <dl className="mt-4 space-y-1.5 border-t border-dashed border-line pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="tabular-nums">{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Delivery</dt>
                <dd className="tabular-nums">{order.deliveryFee ? formatPrice(order.deliveryFee) : 'Free'}</dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-leaf">
                  <dt>Discount</dt>
                  <dd className="tabular-nums">− {formatPrice(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between pt-1 text-base font-bold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatPrice(order.total)}</dd>
              </div>
            </dl>
            <Button variant="outline" className="mt-4 w-full" onClick={() => reorder(order)}>
              <Icon name="repeat" className="size-4" /> Buy again
            </Button>
          </section>

          <section className="rounded-3xl bg-white p-5 text-sm shadow-card">
            <h2 className="mb-2 font-bold">Delivering to</h2>
            <p className="font-semibold">
              {order.address.label} · {order.address.name}
            </p>
            <p className="text-muted">
              {order.address.house}, {order.address.street}, {order.address.area}, {order.address.city} {order.address.pincode}
            </p>
            <p className="mt-1 text-muted">{order.address.phone}</p>
            <p className="mt-3 font-semibold">Payment</p>
            <p className="text-muted">{order.payment === 'cod' ? 'Cash on delivery' : 'UPI on delivery'}</p>
            {order.note && (
              <>
                <p className="mt-3 font-semibold">Note for picker</p>
                <p className="text-muted">“{order.note}”</p>
              </>
            )}
          </section>

          {delivered ? (
            <ButtonLink to={`/orders/${order.id}/report`} variant="ghost" className="w-full text-clay">
              <Icon name="alert" className="size-4" /> Report a problem with this order
            </ButtonLink>
          ) : (
            <a href="tel:+918000000000" className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-forest hover:bg-sand">
              <Icon name="phone" className="size-4" /> Need help? Call us
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
