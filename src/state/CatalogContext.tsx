import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { productService } from '@/services'
import type { Product } from '@/types'

interface CatalogState {
  products: Product[]
  byId: Record<string, Product>
  loading: boolean
}

const CatalogContext = createContext<CatalogState>({ products: [], byId: {}, loading: true })

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    productService.list().then((p) => {
      if (!alive) return
      setProducts(p)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [])

  const value = useMemo(
    () => ({ products, byId: Object.fromEntries(products.map((p) => [p.id, p])), loading }),
    [products, loading],
  )
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  return useContext(CatalogContext)
}
