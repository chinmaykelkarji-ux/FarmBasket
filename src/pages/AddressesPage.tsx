import { useEffect, useState } from 'react'
import type { Customer } from '@/types'
import { AddressForm } from '@/components/checkout/AddressForm'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Icon } from '@/components/ui/Icon'
import { PageHeader } from '@/components/ui/misc'
import { Sheet } from '@/components/ui/Sheet'
import { customerService } from '@/services'
import { emptyAddress, validateAddress, type AddressDraft } from '@/features/checkout/validation'
import { useToast } from '@/state/ToastContext'

export default function AddressesPage() {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [draft, setDraft] = useState<(AddressDraft & { id?: string }) | null>(null)
  const [showErrors, setShowErrors] = useState(false)
  const toast = useToast()

  useEffect(() => {
    customerService.get().then(setCustomer)
  }, [])

  const save = async () => {
    if (!draft) return
    if (Object.keys(validateAddress(draft)).length) return setShowErrors(true)
    setCustomer(await customerService.saveAddress(draft))
    setDraft(null)
    toast.show('Address saved')
  }

  return (
    <div className="mx-auto max-w-2xl px-4">
      <PageHeader title="Saved addresses" back="/profile" />
      {customer && customer.addresses.length === 0 ? (
        <EmptyState art="basket" title="No saved addresses" body="Add your home address for faster checkout." action={<Button onClick={() => setDraft({ ...emptyAddress(), name: customer.name, phone: customer.phone })}>Add address</Button>} />
      ) : (
        <>
          <ul className="space-y-2.5">
            {customer?.addresses.map((a) => (
              <li key={a.id} className="flex items-start gap-3 rounded-3xl bg-white p-4 shadow-card">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-forest-50 text-forest">
                  <Icon name={a.label === 'Home' ? 'home' : 'pin'} />
                </span>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="flex items-center gap-2 font-bold">
                    {a.label}
                    {customer.defaultAddressId === a.id && <span className="rounded-full bg-sand px-2 py-0.5 text-[10px] font-bold text-muted">Default</span>}
                  </p>
                  <p className="text-ink-soft">{a.name} · {a.phone}</p>
                  <p className="text-muted">{a.house}, {a.street}, {a.area}, {a.city} {a.pincode}</p>
                  <div className="mt-1.5 flex gap-3 font-semibold">
                    <button type="button" className="text-forest hover:underline" onClick={() => { setShowErrors(false); setDraft({ ...a }) }}>Edit</button>
                    <button type="button" className="text-clay hover:underline" onClick={async () => setCustomer(await customerService.removeAddress(a.id))}>Remove</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Button variant="outline" className="mt-4 w-full" onClick={() => { setShowErrors(false); setDraft({ ...emptyAddress(), name: customer?.name ?? '', phone: customer?.phone ?? '' }) }}>
            <Icon name="plus" className="size-4" /> Add a new address
          </Button>
        </>
      )}
      <Sheet open={Boolean(draft)} onClose={() => setDraft(null)} title={draft?.id ? 'Edit address' : 'New address'} footer={<Button size="lg" className="w-full" onClick={save}>Save address</Button>}>
        {draft && <AddressForm value={draft} errors={validateAddress(draft)} onChange={(d) => setDraft({ ...d, id: draft.id })} showErrors={showErrors} />}
      </Sheet>
    </div>
  )
}
