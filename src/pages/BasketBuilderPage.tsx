import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ProductVariant } from '@/types'
import { ProduceArt } from '@/components/produce/ProduceArt'
import { ProductTile } from '@/components/product/ProductTile'
import { EditLineSheet } from '@/components/cart/EditLineSheet'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { PageHeader } from '@/components/ui/misc'
import { Stepper } from '@/components/ui/Stepper'
import { Skeleton } from '@/components/ui/Skeleton'
import { track } from '@/services'
import { buildBasket, familySizes, type FamilySize } from '@/features/basket/basketRules'
import { linePrice, stepQuantity } from '@/features/cart/pricing'
import { getVariant, isCustomizable, recommendedVariant, variantLabel } from '@/features/catalog/variants'
import { useCatalog } from '@/state/CatalogContext'
import { useCart, type CartLine } from '@/state/CartContext'
import { usePreferences } from '@/state/PreferencesContext'
import { useToast } from '@/state/ToastContext'
import { formatPrice, formatQuantity, formatQuantityShort } from '@/utils/format'

interface Row {
  productId: string
  variantId: string
  quantity: number
}

export default function BasketBuilderPage() {
  const { byId, loading } = useCatalog()
  const { usualFor } = usePreferences()
  const { addMany } = useCart()
  const toast = useToast()
  const navigate = useNavigate()
  const [size, setSize] = useState<FamilySize | null>(null)
  const [greens, setGreens] = useState(true)
  const [fruits, setFruits] = useState(false)
  const [rows, setRows] = useState<Row[]>([])
  const [editing, setEditing] = useState<number | null>(null)

  const generate = (s: FamilySize, g = greens, f = fruits) => {
    setSize(s)
    const suggestions = buildBasket(byId, s, { greens: g, fruits: f })
    setRows(
      suggestions.map((sg) => {
        const p = byId[sg.productId]
        const usual = usualFor(p)
        const v = usual && usual.variant.inventory !== 'out_of_stock' ? usual.variant : recommendedVariant(p)
        return { productId: p.id, variantId: v.id, quantity: sg.quantity }
      }),
    )
  }

  const resolved = useMemo(
    () =>
      rows.flatMap((r) => {
        const product = byId[r.productId]
        const variant = product && getVariant(product, r.variantId)
        return product && variant ? [{ ...r, product, variant: variant as ProductVariant }] : []
      }),
    [rows, byId],
  )
  const total = resolved.reduce((s, r) => s + linePrice(r.product.unit, r.variant, r.quantity), 0)
  const family = familySizes.find((f) => f.id === size)

  const addAll = () => {
    const added = addMany(resolved.map((r) => ({ product: r.product, variant: r.variant, quantity: r.quantity })), 'smart_basket')
    track('basket_built', { size, greens, fruits, items: added, total })
    toast.show(`${added} items added to your basket`)
    navigate('/cart')
  }

  const update = (i: number, patch: Partial<Row>) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)))

  const editingRow = editing !== null ? resolved[editing] : undefined
  const pseudoLine: CartLine | undefined = editingRow && { id: 'basket', addedAt: '', ...editingRow }

  return (
    <div className="mx-auto max-w-3xl px-4">
      <PageHeader title="Build my basket" sub="A sensible weekly starting point — change anything." back="/" />

      <section className="rounded-3xl bg-white p-5 shadow-card" aria-labelledby="fam-h">
        <h2 id="fam-h" className="flex items-center gap-2 font-bold">
          <Icon name="family" className="size-5 text-forest" /> How many people are you cooking for?
        </h2>
        <div className="mt-4 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Family size">
          {familySizes.map((f) => (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={size === f.id}
              onClick={() => generate(f.id)}
              className={`rounded-2xl border-2 p-3 text-center transition-colors ${size === f.id ? 'border-forest bg-forest-50' : 'border-line hover:border-ink/25'}`}
            >
              <span className="block font-bold">{f.label}</span>
              <span className="text-xs text-muted">{f.people}</span>
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { label: 'Include leafy greens', value: greens, set: (v: boolean) => { setGreens(v); if (size) generate(size, v, fruits) } },
            { label: 'Include fruits', value: fruits, set: (v: boolean) => { setFruits(v); if (size) generate(size, greens, v) } },
          ].map((o) => (
            <button
              key={o.label}
              type="button"
              aria-pressed={o.value}
              onClick={() => o.set(!o.value)}
              className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold ${o.value ? 'border-forest bg-forest text-white' : 'border-line bg-white text-ink-soft'}`}
            >
              {o.value && <Icon name="check" className="size-3.5" strokeWidth={2.8} />}
              {o.label}
            </button>
          ))}
        </div>
      </section>

      {!size ? (
        <div className="flex flex-col items-center py-12 text-center">
          <ProduceArt kind="basket" className="size-36" />
          <p className="mt-3 max-w-xs text-sm text-muted">Pick a family size and we'll suggest a weekly basket using your usual preferences where we have them.</p>
        </div>
      ) : loading ? (
        <Skeleton className="mt-5 h-80 w-full rounded-3xl" />
      ) : (
        <section className="mt-5 animate-fade-up rounded-3xl bg-white p-5 shadow-card" aria-labelledby="basket-h">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="basket-h" className="font-display text-2xl font-semibold">
                Weekly {family?.label} Basket
              </h2>
              <p className="text-sm text-muted">
                {resolved.length} items · for {family?.people}
              </p>
            </div>
            <p className="text-2xl font-extrabold tabular-nums">{formatPrice(total)}</p>
          </div>
          <ul className="mt-4 divide-y divide-line">
            {resolved.map((r, i) => (
              <li key={r.productId} className="flex items-center gap-3 py-3">
                <ProductTile product={r.product} variant={r.variant} className="size-14 shrink-0 rounded-2xl" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{r.product.name}</p>
                  <button type="button" onClick={() => setEditing(i)} className="inline-flex max-w-full items-center gap-1 truncate text-sm text-forest hover:underline">
                    {isCustomizable(r.product) ? variantLabel(r.product, r.variant) : formatQuantity(r.product.unit, r.quantity)}
                    <Icon name="edit" className="size-3.5 shrink-0" />
                  </button>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Stepper
                    size="sm"
                    label={`${r.product.name} quantity`}
                    value={formatQuantityShort(r.product.unit, r.quantity)}
                    onDecrement={() =>
                      r.quantity <= r.product.unit.min ? setRows((rs) => rs.filter((_, j) => j !== i)) : update(i, { quantity: stepQuantity(r.product.unit, r.quantity, -1) })
                    }
                    onIncrement={() => update(i, { quantity: stepQuantity(r.product.unit, r.quantity, 1) })}
                  />
                  <span className="text-xs font-semibold text-muted tabular-nums">{formatPrice(linePrice(r.product.unit, r.variant, r.quantity))}</span>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 rounded-2xl bg-sand/60 p-3 text-xs text-muted">
            Suggested quantities are a simple guide based on typical weekly home cooking — not a nutritional recommendation. Adjust to how your family eats.
          </p>
          <Button size="lg" className="mt-4 w-full" onClick={addAll} disabled={resolved.length === 0}>
            <Icon name="cart" className="size-5" /> Add {resolved.length} items to basket · {formatPrice(total)}
          </Button>
        </section>
      )}

      {pseudoLine && editing !== null && (
        <EditLineSheet
          line={pseudoLine}
          onClose={() => setEditing(null)}
          saveLabel="Update"
          onSave={(variantId, quantity) => {
            update(editing, { variantId, quantity })
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}
