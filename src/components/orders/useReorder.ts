import { useNavigate } from 'react-router-dom'
import type { Order } from '@/types'
import { track } from '@/services'
import { getVariant } from '@/features/catalog/variants'
import { useCart } from '@/state/CartContext'
import { useCatalog } from '@/state/CatalogContext'
import { useToast } from '@/state/ToastContext'

/** "Buy again" — re-adds each line with the same characteristics and quantity. */
export function useReorder() {
  const { byId } = useCatalog()
  const { addMany } = useCart()
  const toast = useToast()
  const navigate = useNavigate()

  return (order: Order) => {
    track('reorder_clicked', { orderId: order.id, items: order.items.length })
    const entries = order.items.flatMap((it) => {
      const product = byId[it.productId]
      const variant = product && getVariant(product, it.variantId)
      return product && variant ? [{ product, variant, quantity: it.quantity }] : []
    })
    const added = addMany(entries, 'reorder')
    const skipped = order.items.length - added
    toast.show(
      skipped > 0 ? `${added} items added · ${skipped} sold out today` : `${added} items added — same choices as last time`,
      { action: { label: 'View basket', onClick: () => navigate('/cart') } },
    )
    navigate('/cart')
  }
}
