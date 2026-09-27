import type { AttributeKey, Product } from '@/types'
import { optionState, type Selection } from '@/features/catalog/variants'
import { Icon } from '@/components/ui/Icon'

interface VariantPickerProps {
  product: Product
  selection: Selection
  onChange: (key: AttributeKey, value: string) => void
  compact?: boolean
}

/** Attribute option groups (colour/ripeness, size, variety) with availability states. */
export function VariantPicker({ product, selection, onChange, compact }: VariantPickerProps) {
  return (
    <div className="space-y-5">
      {product.attributes.map((attr) => (
        <fieldset key={attr.key}>
          <legend className="mb-2 flex w-full items-baseline justify-between text-sm font-bold text-ink">
            {attr.label}
            <span className="text-xs font-medium text-muted">{attr.options.find((o) => o.value === selection[attr.key])?.hint}</span>
          </legend>
          <div role="radiogroup" aria-label={attr.label} className={`grid gap-2 ${attr.options.length >= 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {attr.options.map((opt) => {
              const selected = selection[attr.key] === opt.value
              const state = optionState(product, selection, attr.key, opt.value)
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onChange(attr.key, opt.value)}
                  className={`relative flex min-h-12 flex-col items-center justify-center rounded-2xl border-2 px-2 py-2 text-center transition-all duration-150 ${
                    selected ? 'border-forest bg-forest-50 shadow-[0_0_0_3px_rgba(38,64,47,0.08)]' : 'border-line bg-white hover:border-ink/25'
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-sm font-bold">
                    {opt.swatch && <span className="size-3.5 rounded-full ring-1 ring-black/10" style={{ backgroundColor: opt.swatch }} aria-hidden />}
                    {opt.label}
                  </span>
                  {!compact && state === 'sold_out' && <span className="mt-0.5 text-[11px] font-semibold text-clay">Sold out</span>}
                  {!compact && state === 'other_combo' && !selected && <span className="mt-0.5 text-[11px] font-medium text-muted">Other sizes</span>}
                  {!compact && state === 'available' && attr.key === 'size' && opt.hint && !selected && (
                    <span className="mt-0.5 line-clamp-1 text-[11px] text-muted">{opt.hint}</span>
                  )}
                  {selected && (
                    <span className="absolute -top-1.5 -right-1.5 grid size-5 animate-pop place-items-center rounded-full bg-forest text-white">
                      <Icon name="check" className="size-3" strokeWidth={3} />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </fieldset>
      ))}
    </div>
  )
}
