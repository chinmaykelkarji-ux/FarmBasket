import type { ReactNode } from 'react'
import type { CartTotals } from '@/types'
import { formatPrice } from '@/utils/format'

export function TotalsCard({ totals, children, title = 'Bill summary' }: { totals: CartTotals; children?: ReactNode; title?: string }) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-card" aria-label={title}>
      <h2 className="font-bold">{title}</h2>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd className="font-semibold tabular-nums">{formatPrice(totals.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Delivery fee</dt>
          <dd className="font-semibold tabular-nums">{totals.deliveryFee === 0 ? <span className="text-leaf">Free</span> : formatPrice(totals.deliveryFee)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Discount{totals.discountLabel ? ` · ${totals.discountLabel}` : ''}</dt>
          <dd className={`font-semibold tabular-nums ${totals.discount ? 'text-leaf' : ''}`}>{totals.discount ? `− ${formatPrice(totals.discount)}` : formatPrice(0)}</dd>
        </div>
        <div className="flex justify-between border-t border-dashed border-line pt-3 text-base">
          <dt className="font-bold">Total</dt>
          <dd className="font-extrabold tabular-nums">{formatPrice(totals.total)}</dd>
        </div>
      </dl>
      {children}
    </section>
  )
}
