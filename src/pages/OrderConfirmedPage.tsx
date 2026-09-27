import { Link, useParams } from 'react-router-dom'
import { ButtonLink } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { StatusTimeline } from '@/components/orders/StatusTimeline'
import { currentStatus } from '@/services'
import { useNow, useOrder } from '@/hooks/useOrders'
import { formatPrice } from '@/utils/format'

export default function OrderConfirmedPage() {
  const { id } = useParams()
  const { order, loading } = useOrder(id)
  const now = useNow(2000)

  if (loading) return <PageSkeleton />
  if (!order) return <EmptyState title="Order not found" body="We couldn't find this order." action={<ButtonLink to="/orders">View my orders</ButtonLink>} />

  const eta = order.slot.kind === 'asap' ? `${order.slot.window.replace('min', 'minutes')}` : `${order.slot.day}, ${order.slot.window}`

  return (
    <div className="mx-auto max-w-xl px-4 pt-8 md:pt-12">
      <div className="text-center">
        <div className="relative mx-auto grid size-24 place-items-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-leaf/25 [animation-iteration-count:2]" />
          <span className="relative grid size-24 animate-pop place-items-center rounded-full bg-forest text-white shadow-float">
            <Icon name="check" className="size-11" strokeWidth={2.6} />
          </span>
        </div>
        <p className="mt-6 text-sm font-bold tracking-wide text-muted uppercase">Order #{order.number}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold md:text-4xl">Your vegetables are being prepared.</h1>
        <p className="mt-2 text-ink-soft">
          {order.slot.kind === 'asap' ? 'Estimated arrival: ' : 'Scheduled for '}
          <span className="font-bold">{eta}</span>
        </p>
      </div>

      <section className="mt-8 rounded-3xl bg-white p-5 shadow-card">
        <StatusTimeline order={order} status={currentStatus(order, now)} compact />
      </section>

      <div className="mt-4 flex items-start gap-3 rounded-2xl bg-turmeric-50 p-4 text-sm">
        <Icon name="bookmark" className="mt-0.5 size-5 shrink-0 text-turmeric" />
        <p>
          We've remembered your choices — next time you'll see <span className="font-semibold">“Your usual”</span> on these vegetables.{' '}
          <Link to="/profile/preferences" className="font-semibold text-forest underline">
            View preferences
          </Link>
        </p>
      </div>

      <div className="mt-4 rounded-2xl bg-white p-4 text-sm shadow-card">
        <p className="flex justify-between">
          <span className="text-muted">{order.items.length} items · {order.payment === 'cod' ? 'Cash on delivery' : 'UPI on delivery'}</span>
          <span className="font-bold">{formatPrice(order.total)}</span>
        </p>
        <p className="mt-1 truncate text-muted">
          To: {order.address.house}, {order.address.street}, {order.address.area}
        </p>
      </div>

      <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
        <ButtonLink to={`/orders/${order.id}`} size="lg">
          Track order
          <Icon name="arrowRight" className="size-4" />
        </ButtonLink>
        <ButtonLink to="/" size="lg" variant="outline">
          Continue shopping
        </ButtonLink>
      </div>
    </div>
  )
}
