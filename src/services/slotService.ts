import type { DeliverySlot } from '@/types'

/**
 * MOCK delivery availability. Real availability would come from the delivery
 * capacity service; here slots are generated from the current time.
 */
export const slotService = {
  getSlots(now = new Date()): DeliverySlot[] {
    const hour = now.getHours()
    const tomorrow = new Date(now)
    tomorrow.setDate(now.getDate() + 1)
    const tomorrowLabel = `Tomorrow, ${tomorrow.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
    const withinHours = hour >= 7 && hour < 21

    const laterToday = [
      { from: 17, label: '5 – 7 PM' },
      { from: 19, label: '7 – 9 PM' },
    ].filter((s) => s.from - hour >= 2)

    const slots: DeliverySlot[] = [
      {
        id: 'asap',
        kind: 'asap',
        label: 'As soon as possible',
        window: '30–45 min',
        day: 'Today',
        available: withinHours,
        fee: 0,
      },
      ...laterToday.map((s, i) => ({
        id: `today-${s.from}`,
        kind: 'later_today' as const,
        label: 'Later today',
        window: s.label,
        day: 'Today',
        available: i !== 1 || hour < 15, // mock: evening slot fills up after 3 PM
        fee: 0,
      })),
      { id: 'tmrw-7', kind: 'scheduled', label: 'Morning', window: '7 – 9 AM', day: tomorrowLabel, available: true, fee: 0 },
      { id: 'tmrw-9', kind: 'scheduled', label: 'Late morning', window: '9 – 11 AM', day: tomorrowLabel, available: false, fee: 0 },
      { id: 'tmrw-17', kind: 'scheduled', label: 'Evening', window: '5 – 7 PM', day: tomorrowLabel, available: true, fee: 0 },
    ]
    return slots
  },
}
