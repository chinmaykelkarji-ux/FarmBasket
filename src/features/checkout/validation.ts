import { brand } from '@/config/brand'
import type { Address } from '@/types'

export type AddressDraft = Omit<Address, 'id'>
export type AddressErrors = Partial<Record<keyof AddressDraft, string>>

export const emptyAddress = (): AddressDraft => ({
  label: 'Home',
  name: '',
  phone: '',
  house: '',
  street: '',
  area: '',
  city: brand.launchCity,
  pincode: '',
  landmark: '',
})

export function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  return digits.length > 10 && digits.startsWith('91') ? digits.slice(-10) : digits.slice(0, 10)
}

export function validateAddress(a: AddressDraft): AddressErrors {
  const e: AddressErrors = {}
  if (a.name.trim().length < 2) e.name = 'Please enter your name'
  if (!/^[6-9]\d{9}$/.test(normalisePhone(a.phone))) e.phone = 'Enter a valid 10-digit mobile number'
  if (!a.house.trim()) e.house = 'House / flat number is required'
  if (a.street.trim().length < 2) e.street = 'Street or road is required'
  if (a.area.trim().length < 2) e.area = 'Area / locality is required'
  if (a.city.trim().toLowerCase() !== brand.launchCity.toLowerCase()) e.city = `We currently deliver only in ${brand.launchCity}`
  if (!/^\d{6}$/.test(a.pincode)) e.pincode = 'Enter a 6-digit pincode'
  else if (!(brand.serviceablePincodes as readonly string[]).includes(a.pincode)) e.pincode = `We don't deliver to ${a.pincode} yet`
  return e
}
