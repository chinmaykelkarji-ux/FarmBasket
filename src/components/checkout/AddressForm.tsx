import type { InputHTMLAttributes } from 'react'
import type { AddressDraft, AddressErrors } from '@/features/checkout/validation'
import { normalisePhone } from '@/features/checkout/validation'

interface Props {
  value: AddressDraft
  errors: AddressErrors
  onChange: (next: AddressDraft) => void
  showErrors: boolean
}

const LABELS: AddressDraft['label'][] = ['Home', 'Work', 'Other']

export function AddressForm({ value, errors, onChange, showErrors }: Props) {
  const set = <K extends keyof AddressDraft>(k: K, v: AddressDraft[K]) => onChange({ ...value, [k]: v })
  const field = (k: keyof AddressDraft, label: string, props: InputHTMLAttributes<HTMLInputElement> = {}, span2 = false) => {
    const err = showErrors ? errors[k] : undefined
    const id = `addr-${k}`
    return (
      <div className={span2 ? 'sm:col-span-2' : ''}>
        <label htmlFor={id} className="mb-1 block text-sm font-semibold">
          {label}
        </label>
        <input
          id={id}
          value={(value[k] as string) ?? ''}
          onChange={(e) => set(k, e.target.value as never)}
          aria-invalid={Boolean(err)}
          aria-describedby={err ? `${id}-err` : undefined}
          className={`h-12 w-full rounded-xl border bg-white px-3.5 outline-none transition-colors focus:border-forest ${err ? 'border-clay' : 'border-line'}`}
          {...props}
        />
        {err && (
          <p id={`${id}-err`} className="mt-1 text-xs font-semibold text-clay">
            {err}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="grid gap-3.5 sm:grid-cols-2">
      {field('name', 'Full name', { autoComplete: 'name', placeholder: 'e.g. Priya Kulkarni' })}
      {field('phone', 'Mobile number', {
        autoComplete: 'tel-national',
        inputMode: 'numeric',
        placeholder: '10-digit mobile',
        onChange: (e) => set('phone', normalisePhone(e.target.value)),
      })}
      {field('house', 'House / flat no.', { autoComplete: 'address-line1', placeholder: 'e.g. 12, 2nd floor' })}
      {field('street', 'Street / road', { autoComplete: 'address-line2', placeholder: 'e.g. Congress Road' })}
      {field('area', 'Area / locality', { placeholder: 'e.g. Tilakwadi' })}
      {field('landmark', 'Landmark (optional)', { placeholder: 'e.g. near Ganesh temple' })}
      {field('city', 'City', { autoComplete: 'address-level2' })}
      {field('pincode', 'Pincode', {
        autoComplete: 'postal-code',
        inputMode: 'numeric',
        maxLength: 6,
        placeholder: '590006',
        onChange: (e) => set('pincode', e.target.value.replace(/\D/g, '').slice(0, 6)),
      })}
      <fieldset className="sm:col-span-2">
        <legend className="mb-1.5 text-sm font-semibold">Save as</legend>
        <div className="flex gap-2">
          {LABELS.map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={value.label === l}
              onClick={() => set('label', l)}
              className={`h-9 rounded-full border px-4 text-sm font-semibold ${value.label === l ? 'border-forest bg-forest text-white' : 'border-line bg-white'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  )
}
