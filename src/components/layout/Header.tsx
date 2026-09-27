import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { useCart } from '@/state/CartContext'
import { t } from '@/i18n/strings'
import { Logo } from './Logo'
import { LocationButton } from './LocationButton'

function CartBadge({ count }: { count: number }) {
  const [bump, setBump] = useState(false)
  const prev = useRef(count)
  useEffect(() => {
    if (count > prev.current) {
      setBump(true)
      const id = window.setTimeout(() => setBump(false), 400)
      prev.current = count
      return () => window.clearTimeout(id)
    }
    prev.current = count
  }, [count])
  if (count === 0) return null
  return (
    <span className={`absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-clay px-1 text-[11px] font-bold text-white ring-2 ring-cream ${bump ? 'animate-pop' : ''}`}>
      {count}
    </span>
  )
}

export { CartBadge }

const desktopLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/vegetables', label: 'Shop' },
  { to: '/basket', label: 'Build a basket' },
  { to: '/orders', label: 'Orders' },
]

export function Header() {
  const { totals } = useCart()
  const navigate = useNavigate()
  const [q, setQ] = useState('')

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 md:h-[72px] md:gap-6">
        <div className="md:hidden">
          <LocationButton compact />
        </div>
        <div className="hidden md:block">
          <Logo />
        </div>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {desktopLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${isActive ? 'bg-sand text-ink' : 'text-ink-soft hover:bg-sand/70'}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <form
          role="search"
          className="ml-auto hidden max-w-sm flex-1 md:block"
          onSubmit={(e) => {
            e.preventDefault()
            navigate(`/search?q=${encodeURIComponent(q)}`)
          }}
        >
          <label className="relative block">
            <span className="sr-only">Search vegetables</span>
            <Icon name="search" className="absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => navigate('/search')}
              placeholder={t('searchPlaceholder')}
              className="h-11 w-full rounded-2xl border border-line bg-white pr-3 pl-10 text-sm outline-none focus:border-forest"
            />
          </label>
        </form>
        <div className="hidden md:block">
          <LocationButton />
        </div>
        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
          <NavLink to="/search" className="grid size-10 place-items-center rounded-full hover:bg-sand md:hidden" aria-label="Search">
            <Icon name="search" />
          </NavLink>
          <NavLink to="/cart" className="relative grid size-10 place-items-center rounded-full hover:bg-sand" aria-label={`Basket, ${totals.itemCount} items`}>
            <Icon name="cart" />
            <CartBadge count={totals.itemCount} />
          </NavLink>
          <NavLink to="/profile" className="grid size-10 place-items-center rounded-full hover:bg-sand" aria-label="Profile">
            <Icon name="user" />
          </NavLink>
        </div>
      </div>
    </header>
  )
}
