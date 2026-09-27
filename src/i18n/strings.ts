/**
 * Centralised customer-facing copy. English only for the MVP; add `kn` / `hi`
 * dictionaries with the same keys and switch `locale` to localise.
 */
import { brand } from '@/config/brand'

const en = {
  heroTitle: 'Fresh vegetables, the way you want them.',
  heroSub: "Choose your size, variety and ripeness. We'll pick the good ones.",
  heroCta: 'Shop vegetables',
  heroCta2: 'Build my basket',
  delivering: `Delivering in ${brand.launchCity}`,
  searchPlaceholder: 'Search tomato, onion, “red medium”…',
  freshToday: 'Fresh today',
  freshTodaySub: 'Received and sorted this morning',
  yourUsuals: 'Your usuals',
  yourUsualsSub: 'Buy again, exactly how you like it',
  yourUsualsEmpty: 'Your preferences will appear here after your first order.',
  popular: 'Popular choices',
  popularSub: 'What Belagavi is cooking with this week',
  promiseTitle: 'How we pick your produce',
  promiseSub: 'Selected from trusted local suppliers and farm partners.',
  emptyCartTitle: 'Your basket is waiting.',
  emptyCartSub: 'Add some fresh vegetables.',
  emptyOrdersTitle: 'No orders yet.',
  emptyOrdersSub: 'Your first fresh basket is one tap away.',
  soldOutTitle: 'Looks like this variety sold out.',
  recommended: 'Recommended for most customers',
  yourUsual: 'Your usual',
} as const

export type StringKey = keyof typeof en

const dictionaries = { en } as const
const locale: keyof typeof dictionaries = 'en'

export function t(key: StringKey): string {
  return dictionaries[locale][key]
}
