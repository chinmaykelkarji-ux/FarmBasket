import { Icon } from './Icon'

interface StepperProps {
  value: string
  onDecrement: () => void
  onIncrement: () => void
  canDecrement?: boolean
  canIncrement?: boolean
  label: string
  size?: 'sm' | 'md'
  tone?: 'solid' | 'soft'
}

export function Stepper({ value, onDecrement, onIncrement, canDecrement = true, canIncrement = true, label, size = 'md', tone = 'soft' }: StepperProps) {
  const h = size === 'sm' ? 'h-9' : 'h-11'
  const btn = size === 'sm' ? 'w-9' : 'w-11'
  const colors = tone === 'solid' ? 'bg-forest text-white' : 'bg-sand text-ink'
  return (
    <div className={`inline-flex items-center rounded-xl ${colors} ${h}`} role="group" aria-label={label}>
      <button type="button" onClick={onDecrement} disabled={!canDecrement} className={`grid h-full ${btn} place-items-center rounded-xl disabled:opacity-40`} aria-label={`Decrease ${label}`}>
        <Icon name="minus" className="size-4" strokeWidth={2.4} />
      </button>
      <span className={`min-w-12 text-center font-bold tabular-nums ${size === 'sm' ? 'text-sm' : ''}`} aria-live="polite">
        {value}
      </span>
      <button type="button" onClick={onIncrement} disabled={!canIncrement} className={`grid h-full ${btn} place-items-center rounded-xl disabled:opacity-40`} aria-label={`Increase ${label}`}>
        <Icon name="plus" className="size-4" strokeWidth={2.4} />
      </button>
    </div>
  )
}
