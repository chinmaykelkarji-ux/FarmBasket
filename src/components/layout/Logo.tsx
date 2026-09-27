import { Link } from 'react-router-dom'
import { brand } from '@/config/brand'

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 rounded-lg ${className}`} aria-label={`${brand.name} home`}>
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
        <rect width="32" height="32" rx="10" fill="#26402F" />
        <path d="M16 9.5c4.7 0 8 3.4 8 7.8 0 4.3-3.3 6.9-8 6.9s-8-2.6-8-6.9c0-4.4 3.3-7.8 8-7.8z" fill="#D9573A" />
        <path d="M16 9.6c-.5-2.6 1-4.2 3.2-4.6-.5 2.1-1.6 3.6-3.2 4.6z" fill="#9BC35F" />
        <path d="M12 13.4c1-1.4 2.4-2 3.9-2" stroke="#fff" strokeOpacity=".55" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      </svg>
      <span className="font-display text-[21px] leading-none font-semibold tracking-tight text-forest">
        Farm<span className="text-clay">Basket</span>
      </span>
    </Link>
  )
}
