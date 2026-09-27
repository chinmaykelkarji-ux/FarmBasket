import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from './Icon'

export function Stars({ value, size = 'sm', count }: { value: number; size?: 'sm' | 'md'; count?: number }) {
  const s = size === 'sm' ? 'size-3.5' : 'size-4.5'
  return (
    <span className="inline-flex items-center gap-1" aria-label={`Rated ${value.toFixed(1)} out of 5${count ? ` from ${count} ratings` : ''}`}>
      <span className="inline-flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <Icon key={i} name="star" filled className={`${s} ${i <= Math.round(value) ? 'text-turmeric' : 'text-line'}`} strokeWidth={1} />
        ))}
      </span>
      <span className="text-xs font-semibold text-ink-soft">{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-xs text-muted">({count.toLocaleString('en-IN')})</span>}
    </span>
  )
}

export function SectionHeader({ title, sub, to, cta = 'See all' }: { title: string; sub?: string; to?: string; cta?: string }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-[22px] leading-tight font-semibold md:text-2xl">{title}</h2>
        {sub && <p className="mt-0.5 text-sm text-muted">{sub}</p>}
      </div>
      {to && (
        <Link to={to} className="inline-flex shrink-0 items-center gap-0.5 rounded-lg text-sm font-semibold text-forest hover:underline">
          {cta}
          <Icon name="chevronRight" className="size-4" />
        </Link>
      )}
    </div>
  )
}

export function Chip({ active, onClick, children, className = '' }: { active?: boolean; onClick?: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition-colors ${
        active ? 'border-forest bg-forest text-white' : 'border-line bg-white text-ink-soft hover:border-ink/25'
      } ${className}`}
    >
      {children}
    </button>
  )
}

export function FreshnessDot({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-leaf">
      <span className="relative flex size-1.5">
        <span className="absolute inset-0 rounded-full bg-leaf opacity-40 animate-ping [animation-duration:2.4s]" />
        <span className="relative size-1.5 rounded-full bg-leaf" />
      </span>
      {label}
    </span>
  )
}

export function PageHeader({ title, sub, back, right }: { title: string; sub?: string; back?: string | (() => void); right?: ReactNode }) {
  return (
    <div className="flex items-center gap-3 pt-4 pb-3 md:pt-8">
      {back &&
        (typeof back === 'string' ? (
          <Link to={back} aria-label="Back" className="grid size-10 shrink-0 place-items-center rounded-full bg-white shadow-card hover:bg-sand">
            <Icon name="chevronLeft" />
          </Link>
        ) : (
          <button type="button" onClick={back} aria-label="Back" className="grid size-10 shrink-0 place-items-center rounded-full bg-white shadow-card hover:bg-sand">
            <Icon name="chevronLeft" />
          </button>
        ))}
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-2xl font-semibold md:text-3xl">{title}</h1>
        {sub && <p className="text-sm text-muted">{sub}</p>}
      </div>
      {right}
    </div>
  )
}
