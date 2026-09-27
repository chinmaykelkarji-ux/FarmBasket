import type { ReactNode } from 'react'
import type { ArtKind } from '@/types'
import { ProduceArt } from '@/components/produce/ProduceArt'

export function EmptyState({ art = 'basket', title, body, action }: { art?: ArtKind; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-6 py-14 text-center animate-fade-up">
      <div className="grid size-36 place-items-center rounded-full bg-sand">
        <ProduceArt kind={art} className="size-28" />
      </div>
      <h2 className="mt-6 font-display text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-muted">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
