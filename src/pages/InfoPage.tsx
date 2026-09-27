import { Link } from 'react-router-dom'
import { brand } from '@/config/brand'
import { ButtonLink } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { PageHeader } from '@/components/ui/misc'

type Page = 'help' | 'quality' | 'about'

const FAQ = [
  { q: 'How do you choose my vegetables?', a: 'Our pickers sort produce by size, colour and ripeness and pick to the preference you chose. If your exact choice is not available, we show it as sold out rather than substituting silently.' },
  { q: 'What if something is not fresh or not what I asked for?', a: 'Open the order and tap “Report a problem”. Pick what went wrong — not fresh, wrong size, wrong variety — and we will replace or refund it.' },
  { q: 'Where do you deliver?', a: `Across ${brand.launchCity} for now. Check your pincode from the location selector at the top of the app.` },
  { q: 'When will my order arrive?', a: 'Choose ASAP (usually 30–45 minutes during the day), later today, or a slot tomorrow morning or evening. Times are estimates.' },
  { q: 'How do I pay?', a: 'UPI or cash when your order arrives. Online card payments are coming soon.' },
  { q: 'Can weights vary slightly?', a: 'Yes — produce is natural, so weights may vary by a few grams. Bunches and pieces show an approximate weight on the product page.' },
]

export default function InfoPage({ page }: { page: Page }) {
  if (page === 'quality')
    return (
      <div className="mx-auto max-w-2xl px-4">
        <PageHeader title="Quality guarantee" back="/profile" />
        <div className="rounded-[28px] bg-forest p-6 text-white">
          <Icon name="shield" className="size-9 text-turmeric" />
          <h2 className="mt-3 font-display text-2xl font-semibold">If it's not right, we make it right.</h2>
          <p className="mt-2 text-white/80">Report any problem within 24 hours of delivery and we'll replace the item on your next order or refund it — no need to return produce.</p>
        </div>
        <ol className="mt-5 space-y-3">
          {[
            ['Choose exactly how you like it', 'Size, colour, ripeness and variety — your choice is printed on the pick list.'],
            ['Graded before packing', 'Pickers set aside bruised, over-ripe or undersized pieces and check every item against your selection.'],
            ['Packed fresh', 'Leafy greens and herbs are bundled the same morning; everything travels in breathable bags.'],
            ['Tell us how it was', 'Rate every order. Low ratings go straight to our quality team, who call you back.'],
          ].map(([t, b], i) => (
            <li key={t} className="flex gap-3 rounded-3xl bg-white p-4 shadow-card">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-forest-50 font-bold text-forest">{i + 1}</span>
              <div>
                <p className="font-bold">{t}</p>
                <p className="text-sm text-muted">{b}</p>
              </div>
            </li>
          ))}
        </ol>
        <ButtonLink to="/orders" variant="outline" className="mt-5 w-full">
          Report a problem with an order
        </ButtonLink>
      </div>
    )

  if (page === 'about')
    return (
      <div className="mx-auto max-w-2xl px-4">
        <PageHeader title={`About ${brand.name}`} back="/profile" />
        <div className="space-y-4 rounded-3xl bg-white p-6 leading-relaxed text-ink-soft shadow-card">
          <p className="font-display text-2xl leading-snug font-semibold text-ink">A smart digital version of a really good local vegetable shop.</p>
          <p>
            A good shopkeeper knows what size you like, what colour you want, what's fresh today and what you usually buy. {brand.name} tries to do the same — online.
          </p>
          <p>
            We select produce from trusted local suppliers and farm partners, grade it by size, colour and ripeness, and pack it to your preferences. We're starting in {brand.launchCity}, {brand.launchState}, and taking it slowly so we get quality right first.
          </p>
          <p className="text-sm text-muted">Prices in the app are indicative and may change daily with market rates.</p>
        </div>
        <Link to="/vegetables" className="mt-5 inline-flex items-center gap-1 font-semibold text-forest hover:underline">
          Start shopping <Icon name="chevronRight" className="size-4" />
        </Link>
      </div>
    )

  return (
    <div className="mx-auto max-w-2xl px-4">
      <PageHeader title="Help & support" back="/profile" />
      <div className="grid grid-cols-2 gap-2.5">
        <a href={`tel:${brand.supportPhone.replace(/\s/g, '')}`} className="flex items-center gap-2.5 rounded-2xl bg-white p-4 font-semibold shadow-card hover:shadow-float">
          <Icon name="phone" className="text-forest" /> Call us
        </a>
        <a href={`mailto:${brand.supportEmail}`} className="flex items-center gap-2.5 rounded-2xl bg-white p-4 font-semibold shadow-card hover:shadow-float">
          <Icon name="help" className="text-forest" /> Email us
        </a>
      </div>
      <h2 className="mt-6 mb-2 font-bold">Frequently asked</h2>
      <div className="space-y-2">
        {FAQ.map((f) => (
          <details key={f.q} className="group rounded-2xl bg-white p-4 shadow-card">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold [&::-webkit-details-marker]:hidden">
              {f.q}
              <Icon name="chevronDown" className="size-4 shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-2 text-sm text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}
