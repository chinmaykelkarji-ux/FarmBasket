import type { Address, Customer } from '@/types'
import { uid } from '@/utils/format'
import { db, latency } from './db'

const TABLE = 'customer'
const SEARCH_TABLE = 'recent_searches'

function blankCustomer(): Customer {
  return { id: 'cust_local', name: '', phone: '', addresses: [], createdAt: new Date().toISOString() }
}

export const customerService = {
  async get(): Promise<Customer> {
    return db.read<Customer>(TABLE, blankCustomer())
  },

  getSync(): Customer {
    return db.read<Customer>(TABLE, blankCustomer())
  },

  async update(patch: Partial<Pick<Customer, 'name' | 'phone' | 'email'>>): Promise<Customer> {
    await latency(120)
    const next = { ...db.read<Customer>(TABLE, blankCustomer()), ...patch }
    db.write(TABLE, next)
    return next
  },

  async saveAddress(address: Omit<Address, 'id'> & { id?: string }, makeDefault = true): Promise<Customer> {
    await latency(120)
    const c = db.read<Customer>(TABLE, blankCustomer())
    const id = address.id ?? uid('addr_')
    const saved: Address = { ...address, id }
    const exists = c.addresses.some((a) => a.id === id)
    const addresses = exists ? c.addresses.map((a) => (a.id === id ? saved : a)) : [...c.addresses, saved]
    const next: Customer = {
      ...c,
      name: c.name || address.name,
      phone: c.phone || address.phone,
      addresses,
      defaultAddressId: makeDefault ? id : (c.defaultAddressId ?? id),
    }
    db.write(TABLE, next)
    return next
  },

  async removeAddress(id: string): Promise<Customer> {
    const c = db.read<Customer>(TABLE, blankCustomer())
    const addresses = c.addresses.filter((a) => a.id !== id)
    const next = { ...c, addresses, defaultAddressId: c.defaultAddressId === id ? addresses[0]?.id : c.defaultAddressId }
    db.write(TABLE, next)
    return next
  },

  recentSearches(): string[] {
    return db.read<string[]>(SEARCH_TABLE, [])
  },

  addRecentSearch(q: string): string[] {
    const term = q.trim()
    if (!term) return this.recentSearches()
    const next = [term, ...this.recentSearches().filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(0, 6)
    db.write(SEARCH_TABLE, next)
    return next
  },

  clearRecentSearches(): void {
    db.write(SEARCH_TABLE, [])
  },
}
