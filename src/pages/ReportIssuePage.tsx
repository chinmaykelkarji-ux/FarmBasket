import { useParams } from 'react-router-dom'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/misc'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { QualityFeedbackForm } from '@/components/orders/QualityFeedbackForm'
import { useOrder } from '@/hooks/useOrders'

export default function ReportIssuePage() {
  const { id } = useParams()
  const { order, loading } = useOrder(id)
  if (loading) return <PageSkeleton />
  if (!order) return <EmptyState title="Order not found" body="We couldn't find this order." action={<ButtonLink to="/orders">View my orders</ButtonLink>} />
  return (
    <div className="mx-auto max-w-2xl px-4">
      <PageHeader title="Report a problem" sub={`Order #${order.number}`} back={`/orders/${order.id}`} />
      <p className="mb-4 text-sm text-muted">
        If something isn't right, we'll replace it on your next delivery or refund it — no need to return produce.
      </p>
      <QualityFeedbackForm order={order} startWithReport />
    </div>
  )
}
