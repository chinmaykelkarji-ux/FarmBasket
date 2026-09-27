import { NavLink } from 'react-router-dom'
import { Icon, type IconName } from '@/components/ui/Icon'
import { useCart } from '@/state/CartContext'
import { CartBadge } from './Header'

const items: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/vegetables', label: 'Explore', icon: 'explore' },
  { to: '/cart', label: 'Cart', icon: 'cart' },
  { to: '/orders', label: 'Orders', icon: 'orders' },
  { to: '/profile', label: 'Profile', icon: 'user' },
]

export function BottomNav() {
  const { totals } = useCart()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-safe backdrop-blur-md md:hidden" aria-label="Primary">
      <ul className="mx-auto grid h-16 max-w-md grid-cols-5">
        {items.map((it) => (
          <li key={it.to}>
            <NavLink
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                `relative flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors ${isActive ? 'text-forest' : 'text-muted'}`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`absolute top-0 h-0.5 w-8 rounded-full bg-forest transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                  <span className="relative">
                    <Icon name={it.icon} className="size-[22px]" strokeWidth={isActive ? 2.2 : 1.8} />
                    {it.to === '/cart' && <CartBadge count={totals.itemCount} />}
                  </span>
                  {it.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
