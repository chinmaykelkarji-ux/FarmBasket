import type { ReactNode } from 'react'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'

export function ProductRail({ children, loading, count = 5, label }: { children?: ReactNode; loading?: boolean; count?: number; label: string }) {
  return (
    <div
      className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 md:-mx-0 md:px-0"
      role="list"
      aria-label={label}
    >
      {loading
        ? Array.from({ length: count }, (_, i) => (
            <div key={i} className="w-[158px] shrink-0 sm:w-[176px]">
              <ProductCardSkeleton />
            </div>
          ))
        : children}
    </div>
  )
}
