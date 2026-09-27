import type { Product, ProductVariant } from '@/types'
import { ProduceArt } from '@/components/produce/ProduceArt'

/** Tinted illustration tile. Size choice visibly scales the produce. */
export function ProductTile({ product, variant, className = '', artClassName = 'size-[78%]', showSize = true }: { product: Product; variant?: ProductVariant; className?: string; artClassName?: string; showSize?: boolean }) {
  return (
    <div className={`relative grid place-items-center overflow-hidden ${className}`} style={{ backgroundColor: product.tint }}>
      <div className="pointer-events-none absolute -top-1/4 -left-1/4 size-3/4 rounded-full bg-white/35 blur-2xl" aria-hidden />
      <ProduceArt kind={product.art} tone={variant?.tone} size={showSize ? variant?.attributes.size : undefined} className={`relative ${artClassName}`} />
    </div>
  )
}
