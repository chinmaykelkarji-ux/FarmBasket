import type { SellingUnit } from '@/types'
import { quantityPresets, stepQuantity } from '@/features/cart/pricing'
import { formatQuantity } from '@/utils/format'
import { Stepper } from '@/components/ui/Stepper'

export function QuantityPicker({ unit, value, onChange }: { unit: SellingUnit; value: number; onChange: (q: number) => void }) {
  const presets = quantityPresets(unit)
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Stepper
        label="quantity"
        value={formatQuantity(unit, value)}
        onDecrement={() => onChange(stepQuantity(unit, value, -1))}
        onIncrement={() => onChange(stepQuantity(unit, value, 1))}
        canDecrement={value > unit.min}
        canIncrement={value < unit.max}
      />
      <div className="flex gap-1.5" role="group" aria-label="Quick quantities">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-pressed={value === p}
            className={`h-9 rounded-full border px-3 text-sm font-semibold transition-colors ${
              value === p ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink-soft hover:border-ink/30'
            }`}
          >
            {formatQuantity(unit, p)}
          </button>
        ))}
      </div>
      {unit.kind === 'count' && unit.approx && <p className="w-full text-xs text-muted">Each {unit.label}: {unit.approx}</p>}
    </div>
  )
}
