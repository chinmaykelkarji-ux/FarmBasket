import { useState } from 'react'
import { brand } from '@/config/brand'
import { Icon } from '@/components/ui/Icon'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'

const AREAS = ['Tilakwadi', 'Camp', 'Shahapur', 'Sadashiv Nagar', 'Hindwadi', 'Angol', 'Vadgaon', 'Khasbag', 'Mahantesh Nagar', 'Ramteerth Nagar', 'Hanuman Nagar', 'Bhagya Nagar']

/** Future-ready location selector. MVP serves a single city. */
export function LocationButton({ compact }: { compact?: boolean }) {
  const [open, setOpen] = useState(false)
  const [pin, setPin] = useState('')
  const [result, setResult] = useState<null | boolean>(null)

  const check = () => {
    const valid = /^\d{6}$/.test(pin)
    setResult(valid ? (brand.serviceablePincodes as readonly string[]).includes(pin) : false)
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="flex min-w-0 items-center gap-1.5 rounded-xl py-1 text-left">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-clay-50 text-clay">
          <Icon name="pin" className="size-4" />
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block text-[11px] font-semibold tracking-wide text-muted uppercase">Delivering in</span>
          <span className="flex items-center gap-0.5 truncate text-sm font-bold">
            {brand.launchCity}
            {!compact && <span className="font-medium text-muted">, {brand.launchState}</span>}
            <Icon name="chevronDown" className="size-3.5" />
          </span>
        </span>
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Your delivery location">
        <p className="text-sm text-muted">
          We currently deliver across {brand.launchCity}. More cities will follow once we get {brand.launchCity} just right.
        </p>
        <label htmlFor="pin-check" className="mt-5 block text-sm font-bold">
          Check your pincode
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="pin-check"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, ''))
              setResult(null)
            }}
            placeholder="e.g. 590006"
            className="h-11 flex-1 rounded-xl border border-line bg-white px-3 outline-none focus:border-forest"
          />
          <Button onClick={check} disabled={pin.length !== 6}>
            Check
          </Button>
        </div>
        {result !== null && (
          <p className={`mt-2 text-sm font-semibold ${result ? 'text-leaf' : 'text-clay'}`} role="status">
            {result ? `Great — we deliver to ${pin}.` : `We don't deliver to ${pin} yet. We're expanding across ${brand.launchCity} soon.`}
          </p>
        )}
        <h3 className="mt-6 text-sm font-bold">Areas we serve</h3>
        <ul className="mt-2 flex flex-wrap gap-2">
          {AREAS.map((a) => (
            <li key={a} className="rounded-full bg-sand px-3 py-1 text-sm text-ink-soft">
              {a}
            </li>
          ))}
        </ul>
      </Sheet>
    </>
  )
}
