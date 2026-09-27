import type { IconName } from '@/components/ui/Icon'
import type { OrderStatus } from '@/types'

export const statusCopy: Record<OrderStatus, { title: string; body: string; icon: IconName; short: string }> = {
  confirmed: { title: 'Order confirmed', body: 'We have received your order.', icon: 'check', short: 'Confirmed' },
  picking: { title: 'Picking', body: 'Your vegetables are being selected.', icon: 'basket', short: 'Picking' },
  quality_checked: { title: 'Quality checked', body: 'Your produce has passed our quality check.', icon: 'shield', short: 'Quality checked' },
  packed: { title: 'Packed', body: 'Your order is ready.', icon: 'box', short: 'Packed' },
  out_for_delivery: { title: 'Out for delivery', body: 'Your order is on the way.', icon: 'truck', short: 'On the way' },
  delivered: { title: 'Delivered', body: 'Enjoy your fresh vegetables.', icon: 'leaf', short: 'Delivered' },
  cancelled: { title: 'Cancelled', body: 'This order was cancelled.', icon: 'close', short: 'Cancelled' },
}
