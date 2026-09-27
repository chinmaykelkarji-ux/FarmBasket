import { useEffect, useMemo, useRef, useState, type ReactNode, type Ref } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Address, Customer, DeliverySlot, PaymentMethod } from '@/types'
import { AddressForm } from '@/components/checkout/AddressForm'
import { TotalsCard } from '@/components/cart/TotalsCard'
import { ProductTile } from '@/components/product/ProductTile'
import { Button, ButtonLink } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Icon, type IconName } from '@/components/ui/Icon'
import { PageHeader } from '@/components/ui/misc'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { useCatalog } from '@/state/CatalogContext'
import { customerService, orderService, slotService, track } from '@/services'
import { computeTotals } from '@/features/cart/pricing'
import { attributeLabels } from '@/features/catalog/variants'
import { emptyAddress, validateAddress, type AddressDraft } from '@/features/checkout/validation'
import { useCart } from '@/state/CartContext'
import { usePreferences } from '@/state/PreferencesContext'
import { useToast } from '@/state/ToastContext'
import { formatPrice, formatQuantity } from '@/utils/format'

const PAYMENTS: { id: PaymentMethod; label: string; desc: string; icon: IconName; available: boolean }[] = [
  { id: 'upi', label: 'UPI on delivery', desc: 'Scan & pay with any UPI app when your order arrives', icon: 'upi', available: true },
  { id: 'cod', label: 'Cash on delivery', desc: 'Pay the delivery partner in cash', icon: 'cash', available: true },
  { id: 'card', label: 'Credit / debit card', desc: 'Online card payments coming soon', icon: 'card', available: false },
]

export default function CheckoutPage() {
  const { lines, clear, isFirstOrder } = useCart()
  const { loading: catalogLoading } = useCatalog()
  const { learnFromOrder } = usePreferences()
  const navigate = useNavigate()
  const toast = useToast()

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [addressId, setAddressId] = useState<string | 'new'>('new')
  const [draft, setDraft] = useState<AddressDraft>(emptyAddress)
  const [showErrors, setShowErrors] = useState(false)
  const slots = useMemo(() => slotService.getSlots(), [])
  const [slotId, setSlotId] = useState(() => slots.find((s) => s.available)?.id ?? '')
  const [payment, setPayment] = useState<PaymentMethod>('upi')
  const [note, setNote] = useState('')
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const addressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    customerService.get().then((c) => {
      setCustomer(c)
      if (c.addresses.length) setAddressId(c.defaultAddressId ?? c.addresses[0].id)
      else setDraft((d) => ({ ...d, name: c.name, phone: c.phone }))
    })
  }, [])

  const slot = slots.find((s) => s.id === slotId)
  const totals = computeTotals(lines, { isFirstOrder, slotFee: slot?.fee })
  const errors = validateAddress(draft)
  const usingNew = addressId === 'new'
  const addressValid = !usingNew || Object.keys(errors).length === 0

  if (catalogLoading) return <PageSkeleton />

  if (lines.length === 0 && !placing) {
    return (
      <div className="mx-auto max-w-6xl px-4">
        <EmptyState title="Your basket is empty" body="Add a few vegetables before checking out." action={<ButtonLink to="/vegetables">Shop vegetables</ButtonLink>} />
      </div>
    )
  }

  const placeOrder = async () => {
    setError(null)
    if (!addressValid) {
      setShowErrors(true)
      addressRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    if (!slot) return setError('Please choose a delivery time.')
    setPlacing(true)
    try {
      let address: Address
      if (usingNew) {
        const saved = await customerService.saveAddress(draft)
        address = saved.addresses.find((a) => a.id === saved.defaultAddressId)!
      } else {
        address = customer!.addresses.find((a) => a.id === addressId)!
      }
      const order = await orderService.place({
        lines: lines.map((l) => ({ product: l.product, variantId: l.variantId, quantity: l.quantity })),
        address,
        slot,
        payment,
        note,
      })
      learnFromOrder(order)
      track('order_placed', { orderId: order.id, number: order.number, total: order.total, items: order.items.length, slot: slot.kind, payment })
      navigate(`/orders/${order.id}/confirmed`, { replace: true })
      clear()
    } catch (e) {
      setPlacing(false)
      const msg = e instanceof Error ? e.message : 'Something went wrong. Please try again.'
      setError(msg)
      toast.show(msg, { tone: 'error' })
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4">
      <PageHeader title="Checkout" back="/cart" />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-5">
          {/* Address */}
          <Step n={1} title="Delivery address" refEl={addressRef}>
            {customer && customer.addresses.length > 0 && (
              <div className="mb-4 space-y-2" role="radiogroup" aria-label="Saved addresses">
                {customer.addresses.map((a) => (
                  <OptionCard key={a.id} selected={addressId === a.id} onSelect={() => setAddressId(a.id)} icon="home" title={`${a.label} · ${a.name}`} desc={`${a.house}, ${a.street}, ${a.area}, ${a.city} ${a.pincode}`} />
                ))}
                <OptionCard selected={usingNew} onSelect={() => setAddressId('new')} icon="plus" title="Add a new address" desc="Deliver somewhere else in Belagavi" />
              </div>
            )}
            {usingNew && <AddressForm value={draft} errors={errors} onChange={setDraft} showErrors={showErrors} />}
          </Step>

          {/* Slot */}
          <Step n={2} title="Delivery time">
            <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Delivery time">
              {slots.map((s) => (
                <SlotCard key={s.id} slot={s} selected={slotId === s.id} onSelect={() => setSlotId(s.id)} />
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">Times are estimates. We'll message you if anything changes.</p>
          </Step>

          {/* Payment */}
          <Step n={3} title="Payment">
            <div className="space-y-2" role="radiogroup" aria-label="Payment method">
              {PAYMENTS.map((p) => (
                <OptionCard
                  key={p.id}
                  selected={payment === p.id}
                  disabled={!p.available}
                  onSelect={() => p.available && setPayment(p.id)}
                  icon={p.icon}
                  title={p.label}
                  desc={p.desc}
                  tag={p.available ? undefined : 'Coming soon'}
                />
              ))}
            </div>
          </Step>

          <Step n={4} title="Note for your picker" optional>
            <label htmlFor="picker-note" className="sr-only">
              Note for your picker
            </label>
            <textarea
              id="picker-note"
              value={note}
              maxLength={300}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="e.g. Tomatoes slightly firm please — using them on Friday."
              className="w-full resize-none rounded-xl border border-line bg-white px-3.5 py-3 text-sm outline-none focus:border-forest"
            />
          </Step>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-3xl bg-white p-5 shadow-card" aria-label="Order summary">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Order summary</h2>
              <Link to="/cart" className="text-sm font-semibold text-forest hover:underline">
                Edit
              </Link>
            </div>
            <ul className="mt-3 space-y-3">
              {lines.map((l) => (
                <li key={l.id} className="flex items-center gap-3">
                  <ProductTile product={l.product} variant={l.variant} className="size-12 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{l.product.name}</p>
                    <p className="truncate text-xs text-muted">{[...attributeLabels(l.product, l.variant.attributes), formatQuantity(l.product.unit, l.quantity)].join(' • ')}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
          <TotalsCard totals={totals} title="Bill details">
            {slot && (
              <p className="mt-4 flex items-center gap-2 rounded-2xl bg-sand/60 p-3 text-sm">
                <Icon name="clock" className="size-4 shrink-0 text-forest" />
                <span>
                  <span className="font-semibold">{slot.kind === 'asap' ? 'Arriving in' : slot.day}</span> {slot.window}
                </span>
              </p>
            )}
            {error && (
              <p className="mt-3 text-sm font-semibold text-clay" role="alert">
                {error}
              </p>
            )}
            {showErrors && !addressValid && (
              <p className="mt-3 text-sm font-semibold text-clay" role="alert">
                Please complete your delivery address.
              </p>
            )}
            <Button size="lg" className="mt-4 hidden w-full lg:flex" onClick={placeOrder} loading={placing}>
              Place order · {formatPrice(totals.total)}
            </Button>
          </TotalsCard>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
        <Button size="lg" className="mx-auto flex w-full max-w-3xl" onClick={placeOrder} loading={placing}>
          Place order · {formatPrice(totals.total)}
        </Button>
      </div>
    </div>
  )
}

function Step({ n, title, children, optional, refEl }: { n: number; title: string; children: ReactNode; optional?: boolean; refEl?: Ref<HTMLDivElement> }) {
  return (
    <section ref={refEl} className="scroll-mt-24 rounded-3xl bg-white p-5 shadow-card" aria-labelledby={`step-${n}`}>
      <h2 id={`step-${n}`} className="mb-4 flex items-center gap-2.5 font-bold">
        <span className="grid size-7 place-items-center rounded-full bg-forest text-sm text-white">{n}</span>
        {title}
        {optional && <span className="text-sm font-medium text-muted">(optional)</span>}
      </h2>
      {children}
    </section>
  )
}

function OptionCard({ selected, onSelect, icon, title, desc, disabled, tag }: { selected: boolean; onSelect: () => void; icon: IconName; title: string; desc: string; disabled?: boolean; tag?: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-disabled={disabled}
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition-colors ${
        selected ? 'border-forest bg-forest-50' : 'border-line bg-white hover:border-ink/25'
      } ${disabled ? 'cursor-not-allowed opacity-55' : ''}`}
    >
      <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${selected ? 'bg-forest text-white' : 'bg-sand text-ink'}`}>
        <Icon name={icon} className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 font-semibold">
          {title}
          {tag && <span className="rounded-full bg-sand px-2 py-0.5 text-[11px] font-bold text-muted">{tag}</span>}
        </span>
        <span className="block text-sm text-muted">{desc}</span>
      </span>
      <span className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${selected ? 'border-forest bg-forest' : 'border-line'}`} aria-hidden>
        {selected && <span className="size-2 rounded-full bg-white" />}
      </span>
    </button>
  )
}

function SlotCard({ slot, selected, onSelect }: { slot: DeliverySlot; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-disabled={!slot.available}
      onClick={() => slot.available && onSelect()}
      className={`rounded-2xl border-2 p-3.5 text-left transition-colors ${
        selected ? 'border-forest bg-forest-50' : 'border-line bg-white hover:border-ink/25'
      } ${slot.available ? '' : 'cursor-not-allowed opacity-50'}`}
    >
      <span className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted">{slot.day}</span>
        {!slot.available && <span className="text-[11px] font-bold text-clay">Full</span>}
        {slot.kind === 'asap' && slot.available && <span className="text-[11px] font-bold text-leaf">Fastest</span>}
      </span>
      <span className="mt-0.5 block font-bold">{slot.kind === 'asap' ? 'ASAP' : slot.label}</span>
      <span className="text-sm text-ink-soft">{slot.window}</span>
    </button>
  )
}
