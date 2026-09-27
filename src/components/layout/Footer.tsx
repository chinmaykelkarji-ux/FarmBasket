import { Link } from 'react-router-dom'
import { brand } from '@/config/brand'
import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="mt-16 hidden border-t border-line bg-sand/50 md:block">
      <div className="mx-auto grid max-w-6xl grid-cols-4 gap-8 px-4 py-10 text-sm">
        <div className="col-span-2">
          <Logo />
          <p className="mt-3 max-w-xs text-muted">
            {brand.tagline} Selected from trusted local suppliers and farm partners, quality checked and packed fresh in {brand.launchCity}.
          </p>
        </div>
        <div>
          <h3 className="font-bold">Shop</h3>
          <ul className="mt-2 space-y-1.5 text-muted">
            <li><Link className="hover:text-ink" to="/vegetables">All vegetables</Link></li>
            <li><Link className="hover:text-ink" to="/vegetables?category=leafy-greens">Leafy greens</Link></li>
            <li><Link className="hover:text-ink" to="/basket">Build my basket</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold">Help</h3>
          <ul className="mt-2 space-y-1.5 text-muted">
            <li><Link className="hover:text-ink" to="/quality">Quality guarantee</Link></li>
            <li><Link className="hover:text-ink" to="/help">Help & support</Link></li>
            <li><Link className="hover:text-ink" to="/about">About us</Link></li>
          </ul>
        </div>
      </div>
      <p className="border-t border-line py-4 text-center text-xs text-muted">© {new Date().getFullYear()} {brand.name} · Prices shown are indicative for {brand.launchCity}.</p>
    </footer>
  )
}
