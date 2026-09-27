import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { preferenceService, track } from '@/services'
import type { CustomerPreference, Order, Product, ProductVariant } from '@/types'
import { findExactVariant } from '@/features/catalog/variants'

type PrefMap = Record<string, CustomerPreference>

interface PreferencesApi {
  prefs: PrefMap
  save: (pref: Omit<CustomerPreference, 'updatedAt' | 'source'>) => void
  remove: (productId: string) => void
  learnFromOrder: (order: Order) => void
  usualFor: (product: Product) => { pref: CustomerPreference; variant: ProductVariant } | undefined
}

const PreferencesContext = createContext<PreferencesApi | null>(null)

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<PrefMap>(() => preferenceService.all())

  const save = useCallback<PreferencesApi['save']>((pref) => {
    setPrefs({ ...preferenceService.save(pref) })
    track('preference_saved', { productId: pref.productId, attributes: pref.attributes, quantity: pref.quantity })
  }, [])

  const remove = useCallback((productId: string) => setPrefs({ ...preferenceService.remove(productId) }), [])

  const learnFromOrder = useCallback((order: Order) => setPrefs({ ...preferenceService.learnFromOrder(order) }), [])

  const usualFor = useCallback<PreferencesApi['usualFor']>(
    (product) => {
      const pref = prefs[product.id]
      if (!pref) return undefined
      const variant = product.attributes.length ? findExactVariant(product, pref.attributes) : product.variants[0]
      return variant ? { pref, variant } : undefined
    },
    [prefs],
  )

  const value = useMemo(() => ({ prefs, save, remove, learnFromOrder, usualFor }), [prefs, save, remove, learnFromOrder, usualFor])
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be used inside PreferencesProvider')
  return ctx
}
