import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Customer } from '@/types'
import { brand } from '@/config/brand'
import { commerce } from '@/config/commerce'
import { Button } from '@/components/ui/Button'
import { Icon, type IconName } from '@/components/ui/Icon'
import { PageHeader } from '@/components/ui/misc'
import { Sheet } from '@/components/ui/Sheet'
import { customerService, getEventLog, resetPrototypeData } from '@/services'
import { normalisePhone } from '@/features/checkout/validation'
import { usePreferences } from '@/state/PreferencesContext'
import { useOrders } from '@/hooks/useOrders'
import { useToast } from '@/state/ToastContext'

export default function ProfilePage() {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [editing, setEditing] = useState(false)
  const { prefs } = usePreferences()
  const { orders } = useOrders()
  const toast = useToast()

  useEffect(() => {
    customerService.get().then(setCustomer)
  }, [])

  const initials = (customer?.name || 'You')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const menu: { to: string; icon: IconName; title: string; sub: string }[] = [
    { to: '/profile/preferences', icon: 'bookmark', title: 'Vegetable preferences', sub: `${Object.keys(prefs).length} saved · your usual size, colour & quantity` },
    { to: '/profile/addresses', icon: 'pin', title: 'Saved addresses', sub: customer?.addresses.length ? `${customer.addresses.length} saved` : 'Add a delivery address' },
    { to: '/orders', icon: 'orders', title: 'Orders', sub: orders ? `${orders.length} orders` : 'Your order history' },
    { to: '/quality', icon: 'shield', title: 'Quality guarantee', sub: 'Not right? We replace or refund' },
    { to: '/help', icon: 'help', title: 'Help & support', sub: 'FAQs, call or WhatsApp us' },
    { to: '/about', icon: 'info', title: `About ${brand.name}`, sub: 'How we choose your produce' },
  ]

  return (
    <div className="mx-auto max-w-2xl px-4">
      <PageHeader title="Profile" />
      <section className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-card">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-forest font-display text-xl font-semibold text-white">{initials}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold">{customer?.name || 'Welcome!'}</p>
          <p className="truncate text-sm text-muted">{customer?.phone ? `+91 ${customer.phone}` : 'Add your name and number for faster checkout'}</p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
          {customer?.name ? 'Edit' : 'Add'}
        </Button>
      </section>

      <nav className="mt-4 overflow-hidden rounded-3xl bg-white shadow-card" aria-label="Account">
        <ul className="divide-y divide-line">
          {menu.map((m) => (
            <li key={m.to}>
              <Link to={m.to} className="flex items-center gap-3.5 px-5 py-4 hover:bg-cream">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-forest-50 text-forest">
                  <Icon name={m.icon} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{m.title}</span>
                  <span className="block truncate text-sm text-muted">{m.sub}</span>
                </span>
                <Icon name="chevronRight" className="size-4 text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {commerce.prototypeControls && (
        <details className="mt-8 rounded-2xl border border-dashed border-line p-4 text-sm">
          <summary className="cursor-pointer font-semibold text-muted">Research session tools</summary>
          <p className="mt-2 text-muted">{getEventLog().length} interaction events recorded on this device.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const blob = new Blob([JSON.stringify(getEventLog(), null, 2)], { type: 'application/json' })
                const a = document.createElement('a')
                a.href = URL.createObjectURL(blob)
                a.download = `farmbasket-session-${Date.now()}.json`
                a.click()
              }}
            >
              Export event log
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (window.confirm('Reset all orders, basket, preferences and profile on this device?')) {
                  resetPrototypeData()
                  window.location.href = '/'
                }
              }}
            >
              Start a fresh session
            </Button>
          </div>
        </details>
      )}

      {customer && editing && (
        <PersonalInfoSheet
          customer={customer}
          onClose={() => setEditing(false)}
          onSaved={(c) => {
            setCustomer(c)
            setEditing(false)
            toast.show('Profile updated')
          }}
        />
      )}
    </div>
  )
}

function PersonalInfoSheet({ customer, onClose, onSaved }: { customer: Customer; onClose: () => void; onSaved: (c: Customer) => void }) {
  const [name, setName] = useState(customer.name)
  const [phone, setPhone] = useState(customer.phone)
  const [email, setEmail] = useState(customer.email ?? '')
  const [err, setErr] = useState<string | null>(null)
  const save = async () => {
    if (name.trim().length < 2) return setErr('Please enter your name')
    if (!/^[6-9]\d{9}$/.test(phone)) return setErr('Enter a valid 10-digit mobile number')
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr('Enter a valid email or leave it blank')
    onSaved(await customerService.update({ name: name.trim(), phone, email: email.trim() || undefined }))
  }
  const input = 'h-12 w-full rounded-xl border border-line bg-white px-3.5 outline-none focus:border-forest'
  return (
    <Sheet open onClose={onClose} title="Personal information" footer={<Button size="lg" className="w-full" onClick={save}>Save</Button>}>
      <div className="space-y-3.5">
        <div>
          <label htmlFor="pi-name" className="mb-1 block text-sm font-semibold">Full name</label>
          <input id="pi-name" className={input} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </div>
        <div>
          <label htmlFor="pi-phone" className="mb-1 block text-sm font-semibold">Mobile number</label>
          <input id="pi-phone" className={input} value={phone} inputMode="numeric" onChange={(e) => setPhone(normalisePhone(e.target.value))} autoComplete="tel-national" />
        </div>
        <div>
          <label htmlFor="pi-email" className="mb-1 block text-sm font-semibold">Email (optional)</label>
          <input id="pi-email" className={input} value={email} type="email" onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        {err && <p className="text-sm font-semibold text-clay" role="alert">{err}</p>}
      </div>
    </Sheet>
  )
}
