import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '@/types'
import { EditLineSheet } from '@/components/cart/EditLineSheet'
import { ProductTile } from '@/components/product/ProductTile'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Icon } from '@/components/ui/Icon'
import { PageHeader } from '@/components/ui/misc'
import { Sheet } from '@/components/ui/Sheet'
import { findExactVariant, recommendedVariant, variantLabel } from '@/features/catalog/variants'
import { useCatalog } from '@/state/CatalogContext'
import { useCart } from '@/state/CartContext'
import { usePreferences } from '@/state/PreferencesContext'
import { useToast } from '@/state/ToastContext'
import { formatQuantity } from '@/utils/format'

export default function PreferencesPage() {
  const { products, byId } = useCatalog()
  const { prefs, save, remove } = usePreferences()
  const { add } = useCart()
  const toast = useToast()
  const [editing, setEditing] = useState<Product | null>(null)
  const [picking, setPicking] = useState(false)

  const entries = Object.values(prefs)
    .map((pref) => {
      const product = byId[pref.productId]
      if (!product) return null
      const variant = (product.attributes.length ? findExactVariant(product, pref.attributes) : product.variants[0]) ?? recommendedVariant(product)
      return { pref, product, variant }
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x))
    .sort((a, b) => a.product.name.localeCompare(b.product.name))

  const available = products.filter((p) => !prefs[p.id])
  const editingEntry = editing && entries.find((e) => e.product.id === editing.id)
  const editVariant = editing ? (editingEntry?.variant ?? recommendedVariant(editing)) : undefined

  return (
    <div className="mx-auto max-w-2xl px-4">
      <PageHeader
        title="My vegetable preferences"
        sub="How you like each vegetable — we'll show it as “Your usual”."
        back="/profile"
      />
      {entries.length === 0 ? (
        <EmptyState
          art="tomato"
          title="No preferences yet"
          body="Save your usual size, colour and quantity for the vegetables you buy often — or they'll be learned from your first order."
          action={<Button onClick={() => setPicking(true)}>Add a preference</Button>}
        />
      ) : (
        <>
          <ul className="space-y-2.5">
            {entries.map(({ pref, product, variant }) => (
              <li key={product.id} className="flex items-center gap-3 rounded-3xl bg-white p-3.5 shadow-card">
                <Link to={`/product/${product.slug}?variant=${variant.id}`} className="shrink-0 rounded-2xl">
                  <ProductTile product={product} variant={variant} className="size-16 rounded-2xl" />
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-bold">
                    {product.name}
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${pref.source === 'saved' ? 'bg-clay-50 text-clay' : 'bg-sand text-muted'}`}>
                      {pref.source === 'saved' ? 'Saved' : 'From last order'}
                    </span>
                  </p>
                  <p className="truncate text-sm text-ink-soft">
                    {product.attributes.length ? `${variantLabel(product, variant)} • ` : ''}
                    {formatQuantity(product.unit, pref.quantity)}
                  </p>
                  <div className="mt-1 flex gap-3 text-sm font-semibold">
                    <button type="button" className="text-forest hover:underline" onClick={() => setEditing(product)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-forest hover:underline disabled:text-muted"
                      disabled={variant.inventory === 'out_of_stock'}
                      onClick={() => {
                        add(product, variant, pref.quantity, 'preferences')
                        toast.show(`Your usual ${product.name.toLowerCase()} added`)
                      }}
                    >
                      {variant.inventory === 'out_of_stock' ? 'Sold out today' : `Add ${formatQuantity(product.unit, pref.quantity)}`}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    remove(product.id)
                    toast.show(`${product.name} preference removed`)
                  }}
                  className="grid size-9 shrink-0 place-items-center rounded-xl text-muted hover:bg-clay-50 hover:text-clay"
                  aria-label={`Remove ${product.name} preference`}
                >
                  <Icon name="trash" className="size-4" />
                </button>
              </li>
            ))}
          </ul>
          <Button variant="outline" className="mt-4 w-full" onClick={() => setPicking(true)}>
            <Icon name="plus" className="size-4" /> Add a preference
          </Button>
        </>
      )}

      <Sheet open={picking} onClose={() => setPicking(false)} title="Choose a vegetable">
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {available.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => {
                  setPicking(false)
                  setEditing(p)
                }}
                className="w-full rounded-2xl p-1.5 text-center hover:bg-sand"
              >
                <ProductTile product={p} variant={recommendedVariant(p)} className="aspect-square w-full rounded-2xl" />
                <span className="mt-1 block truncate text-xs font-semibold">{p.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </Sheet>

      {editing && editVariant && (
        <EditLineSheet
          line={{
            id: 'pref',
            productId: editing.id,
            variantId: editVariant.id,
            quantity: editingEntry?.pref.quantity ?? editing.defaultQty,
            addedAt: '',
            product: editing,
            variant: editVariant,
          }}
          onClose={() => setEditing(null)}
          saveLabel="Save as my usual"
          onSave={(variantId, quantity) => {
            const v = editing.variants.find((x) => x.id === variantId)!
            save({ productId: editing.id, attributes: v.attributes, quantity })
            toast.show(`Saved as your usual ${editing.name.toLowerCase()}`)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}
