import { useState } from 'react'
import type { AttributeKey, ProductVariant } from '@/types'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { VariantPicker } from '@/components/product/VariantPicker'
import { QuantityPicker } from '@/components/product/QuantityPicker'
import { ProductTile } from '@/components/product/ProductTile'
import { linePrice } from '@/features/cart/pricing'
import { resolveSelection, variantLabel } from '@/features/catalog/variants'
import { formatPrice, formatQuantity } from '@/utils/format'
import { track } from '@/services'
import type { CartLine } from '@/state/CartContext'

interface Props {
  line: CartLine
  onClose: () => void
  onSave: (variantId: string, quantity: number) => void
  saveLabel?: string
}

/** "Change preference" from the cart — edit characteristics and quantity in place. */
export function EditLineSheet({ line, onClose, onSave, saveLabel = 'Update basket' }: Props) {
  const { product } = line
  const [variant, setVariant] = useState<ProductVariant>(line.variant)
  const [quantity, setQuantity] = useState(line.quantity)
  const soldOut = variant.inventory === 'out_of_stock'

  const onChange = (key: AttributeKey, value: string) => {
    const r = resolveSelection(product, variant.attributes, key, value)
    setVariant(r.variant)
    track('variant_selected', { productId: product.id, variantId: r.variant.id, source: 'cart_edit' })
  }

  return (
    <Sheet
      open
      onClose={onClose}
      title={`Change ${product.name.toLowerCase()}`}
      footer={
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted">
              {variantLabel(product, variant)} • {formatQuantity(product.unit, quantity)}
            </p>
            <p className="text-lg font-extrabold tabular-nums">{formatPrice(linePrice(product.unit, variant, quantity))}</p>
          </div>
          <Button size="lg" disabled={soldOut} onClick={() => onSave(variant.id, quantity)}>
            {soldOut ? 'Sold out' : saveLabel}
          </Button>
        </div>
      }
    >
      <div className="flex items-center gap-3 pb-4">
        <ProductTile product={product} variant={variant} className="size-16 shrink-0 rounded-2xl" />
        <p className="text-sm text-muted">{variant.note}</p>
      </div>
      {product.attributes.length > 0 && <VariantPicker product={product} selection={variant.attributes} onChange={onChange} />}
      {soldOut && <p className="mt-3 text-sm font-semibold text-clay">This variety is sold out today — pick another option.</p>}
      <h3 className="mt-5 mb-2 text-sm font-bold">Quantity</h3>
      <QuantityPicker unit={product.unit} value={quantity} onChange={setQuantity} />
    </Sheet>
  )
}
