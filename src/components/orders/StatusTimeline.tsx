import type { Order, OrderStatus } from '@/types'
import { Icon } from '@/components/ui/Icon'
import { ORDER_FLOW, statusReachedAt } from '@/services'
import { statusCopy } from '@/features/orders/statusCopy'
import { formatTime } from '@/utils/format'

export function StatusTimeline({ order, status, compact }: { order: Order; status: OrderStatus; compact?: boolean }) {
  const currentIdx = ORDER_FLOW.indexOf(status)
  return (
    <ol className="relative" aria-label="Order progress">
      {ORDER_FLOW.map((s, i) => {
        const done = i < currentIdx || (i === currentIdx && s === 'delivered')
        const current = i === currentIdx && s !== 'delivered'
        const copy = statusCopy[s]
        const at = statusReachedAt(order, s)
        const reached = i <= currentIdx
        return (
          <li key={s} className="relative flex gap-3.5 pb-5 last:pb-0" aria-current={current ? 'step' : undefined}>
            {i < ORDER_FLOW.length - 1 && (
              <span className="absolute top-8 bottom-0 left-[15px] w-0.5 overflow-hidden rounded-full bg-line" aria-hidden>
                <span className={`block w-full bg-forest transition-[height] duration-700 ease-out ${i < currentIdx ? 'h-full' : 'h-0'}`} />
              </span>
            )}
            <span
              className={`relative z-10 grid size-8 shrink-0 place-items-center rounded-full transition-colors duration-500 ${
                done ? 'bg-forest text-white' : current ? 'animate-pulse-ring bg-clay text-white' : 'border-2 border-line bg-white text-muted'
              }`}
            >
              <Icon name={done ? 'check' : copy.icon} className="size-4" strokeWidth={done ? 2.8 : 2} />
            </span>
            <div className={`min-w-0 flex-1 pt-1 ${reached ? '' : 'opacity-55'}`}>
              <p className="flex items-center justify-between gap-2">
                <span className={`font-bold ${current ? 'text-clay' : ''}`}>{copy.title}</span>
                {reached && at && <span className="text-xs text-muted tabular-nums">{formatTime(at)}</span>}
              </p>
              {!compact && (reached || i === currentIdx + 1) && <p className="text-sm text-muted">{copy.body}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
