import { useCallback, useEffect, useState } from 'react'
import { orderService } from '@/services'
import type { Order } from '@/types'

export function useOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const refresh = useCallback(() => {
    orderService.list().then(setOrders)
  }, [])
  useEffect(refresh, [refresh])
  return { orders, loading: orders === null, refresh }
}

export function useOrder(id: string | undefined) {
  const [order, setOrder] = useState<Order | null | undefined>(undefined)
  const refresh = useCallback(() => {
    if (!id) return setOrder(null)
    orderService.get(id).then((o) => setOrder(o ?? null))
  }, [id])
  useEffect(refresh, [refresh])
  return { order, loading: order === undefined, setOrder, refresh }
}

/** Re-render on an interval (for live order status). */
export function useNow(intervalMs = 1000, enabled = true) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!enabled) return
    const id = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs, enabled])
  return now
}
