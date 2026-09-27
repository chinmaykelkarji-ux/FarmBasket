import { Link, useNavigate } from 'react-router-dom'
import { categories } from '@/data/categories'
import { ProduceArt } from '@/components/produce/ProduceArt'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductRail } from '@/components/product/ProductRail'
import { ButtonLink } from '@/components/ui/Button'
import { Icon, type IconName } from '@/components/ui/Icon'
import { SectionHeader } from '@/components/ui/misc'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import { productService, currentStatus, isActive } from '@/services'
import { useCatalog } from '@/state/CatalogContext'
import { usePreferences } from '@/state/PreferencesContext'
import { useOrders, useNow } from '@/hooks/useOrders'
import { statusCopy } from '@/features/orders/statusCopy'
import { t } from '@/i18n/strings'

const promise: { icon: IconName; title: string; body: string }[] = [
  { icon: 'leaf', title: 'Carefully sourced', body: 'Selected from trusted local suppliers and farm partners.' },
  { icon: 'shield', title: 'Quality checked', body: 'Every item is sorted by size, colour and ripeness — bruised pieces are set aside.' },
  { icon: 'box', title: 'Packed fresh', body: 'Packed close to dispatch in breathable bags, leafy greens bundled the same morning.' },
  { icon: 'truck', title: 'Delivered to you', body: 'Brought to your door in Belagavi at a time that suits you.' },
]

export function HomePage() {
  const { products, loading } = useCatalog()
  const { prefs, usualFor } = usePreferences()
  const navigate = useNavigate()
  const { orders } = useOrders()
  const now = useNow(5000)
  const active = orders?.find((o) => isActive(o, now))

  const usuals = products
    .filter((p) => prefs[p.id])
    .sort((a, b) => (prefs[b.id].updatedAt > prefs[a.id].updatedAt ? 1 : -1))
    .map((p) => ({ product: p, usual: usualFor(p) }))
    .filter((x) => x.usual)

  const tomato = products.find((p) => p.id === 'tomato')

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Mobile search */}
      <button
        type="button"
        onClick={() => navigate('/search')}
        className="mt-3 flex h-12 w-full items-center gap-2.5 rounded-2xl border border-line bg-white px-4 text-left text-sm text-muted shadow-card md:hidden"
      >
        <Icon name="search" className="size-4.5" />
        {t('searchPlaceholder')}
      </button>

      {active && (
        <Link
          to={`/orders/${active.id}`}
          className="mt-4 flex animate-fade-up items-center gap-3 rounded-2xl bg-forest px-4 py-3 text-white shadow-float md:mt-6"
        >
          <span className="grid size-10 shrink-0 animate-pulse-ring place-items-center rounded-full bg-white/15">
            <Icon name={statusCopy[currentStatus(active, now)].icon} className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs text-white/70">Order #{active.number}</span>
            <span className="block truncate font-semibold">{statusCopy[currentStatus(active, now)].body}</span>
          </span>
          <span className="text-sm font-bold">Track</span>
          <Icon name="chevronRight" className="size-4" />
        </Link>
      )}

      {/* Hero */}
      <section className="relative mt-4 overflow-hidden rounded-[28px] bg-[#EFE6D6] md:mt-6 md:rounded-[36px]">
        <div className="pointer-events-none absolute -right-20 -bottom-24 size-80 rounded-full bg-[#E7D8BF] md:size-[28rem]" aria-hidden />
        <div className="relative grid items-center gap-2 px-5 pt-7 pb-6 md:grid-cols-[1.1fr_1fr] md:px-12 md:py-14">
          <div className="animate-fade-up">
            <p className="hidden items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-forest md:inline-flex">
              <Icon name="pin" className="size-3.5" /> {t('delivering')}
            </p>
            <h1 className="font-display md:mt-4 text-[32px] leading-[1.05] font-semibold text-ink sm:text-[42px] md:text-[56px]">
              Fresh vegetables, <span className="text-clay italic">the way you want them.</span>
            </h1>
            <p className="mt-3 max-w-md text-[15px] text-ink-soft md:mt-4 md:text-lg">{t('heroSub')}</p>
            <div className="mt-5 flex flex-wrap gap-2 md:mt-6 md:gap-2.5">
              <ButtonLink to="/vegetables" size="lg" className="max-sm:h-12 max-sm:px-4 max-sm:text-[15px]">
                {t('heroCta')}
                <Icon name="arrowRight" className="size-4" />
              </ButtonLink>
              <ButtonLink to="/basket" size="lg" variant="outline" className="max-sm:h-12 max-sm:px-4 max-sm:text-[15px]">
                <Icon name="basket" className="size-4.5" />
                {t('heroCta2')}
              </ButtonLink>
            </div>
          </div>

          {/* Visual: produce + a selection card that explains the idea */}
          <div className="relative mx-auto mt-5 h-48 w-full max-w-md sm:h-56 md:mt-0 md:h-80">
            <ProduceArt kind="cabbage" className="absolute top-0 left-[28%] size-24 sm:size-28 md:top-0 md:right-4 md:left-auto md:size-36" />
            <ProduceArt kind="tomato" tone="red" className="absolute bottom-2 left-0 size-32 sm:size-36 md:top-2 md:bottom-auto md:left-6 md:size-44" />
            <ProduceArt kind="carrot" className="absolute top-2 right-0 size-24 md:top-auto md:right-0 md:bottom-4 md:size-36" />
            <div className="absolute right-0 bottom-2 w-[11.5rem] rounded-2xl bg-white/95 p-3 shadow-float backdrop-blur md:right-auto md:bottom-4 md:left-0 md:w-52">
              <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Your selection</p>
              <p className="mt-0.5 font-bold">Tomato</p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {['Red', 'Medium', '1 kg'].map((c) => (
                  <span key={c} className="rounded-full bg-forest-50 px-2 py-0.5 text-xs font-semibold text-forest">
                    {c}
                  </span>
                ))}
              </div>
              <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-leaf">
                <Icon name="check" className="size-3.5" strokeWidth={2.6} /> We'll pick the good ones
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mt-9" aria-labelledby="cat-h">
        <SectionHeader title="Shop by category" to="/vegetables" />
        <h2 id="cat-h" className="sr-only">
          Categories
        </h2>
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-5 md:px-0">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/vegetables?category=${c.id}`}
              className="group flex w-[112px] shrink-0 flex-col items-center rounded-3xl p-3 text-center transition-transform hover:-translate-y-0.5 md:w-auto"
              style={{ backgroundColor: c.tint }}
            >
              <ProduceArt kind={c.art} tone={c.art === 'tomato' ? 'red' : undefined} className="size-16 transition-transform group-hover:scale-105 md:size-20" />
              <span className="mt-1.5 text-[13px] leading-tight font-bold">{c.name}</span>
              <span className="mt-0.5 hidden text-xs text-muted md:block">{c.blurb}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Your usuals */}
      <section className="mt-10">
        <SectionHeader title={t('yourUsuals')} sub={usuals.length ? t('yourUsualsSub') : undefined} to={usuals.length ? '/profile/preferences' : undefined} cta="Edit" />
        {usuals.length ? (
          <ProductRail label="Your usuals">
            {usuals.map(({ product, usual }) => (
              <div role="listitem" key={product.id}>
                <ProductCard product={product} variant={usual!.variant} quantity={usual!.pref.quantity} layout="rail" badge="Buy again" source="home_usuals" />
              </div>
            ))}
          </ProductRail>
        ) : (
          <div className="flex items-center gap-4 rounded-3xl border border-dashed border-line bg-white/60 p-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-turmeric-50 text-turmeric">
              <Icon name="bookmark" />
            </span>
            <p className="text-sm text-ink-soft">{t('yourUsualsEmpty')}</p>
          </div>
        )}
      </section>

      {/* Fresh today */}
      <section className="mt-10">
        <SectionHeader title={t('freshToday')} sub={t('freshTodaySub')} to="/vegetables" />
        <ProductRail loading={loading} label="Fresh today">
          {productService.freshToday(products).map((p) => (
            <div role="listitem" key={p.id}>
              <ProductCard product={p} layout="rail" source="home_fresh" />
            </div>
          ))}
        </ProductRail>
      </section>

      {/* Choice explainer — the differentiator */}
      {tomato && (
        <section className="mt-10 grid gap-5 rounded-[28px] bg-white p-5 shadow-card md:grid-cols-[1fr_1.4fr] md:items-center md:p-8">
          <div>
            <p className="text-xs font-bold tracking-wider text-clay uppercase">Like your local sabziwala</p>
            <h2 className="mt-1 font-display text-2xl font-semibold md:text-3xl">Tell us how you like it.</h2>
            <p className="mt-2 text-sm text-muted md:text-base">
              Ripe for tonight's curry or semi-ripe to last the week? Small onions for sambar? Choose once — we'll remember it as your usual.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {tomato.variants
              .filter((v) => v.attributes.size === 'medium')
              .map((v) => {
                const opt = tomato.attributes[0].options.find((o) => o.value === v.attributes.colour)!
                return (
                  <Link
                    key={v.id}
                    to={`/product/tomato?variant=${v.id}`}
                    className="group flex flex-col items-center rounded-2xl p-3 text-center transition-transform hover:-translate-y-0.5"
                    style={{ backgroundColor: tomato.tint }}
                  >
                    <ProduceArt kind="tomato" tone={v.tone} className="size-20 transition-transform group-hover:scale-105 md:size-24" />
                    <span className="mt-1 text-sm font-bold">{opt.label}</span>
                    <span className="text-[11px] text-muted">{opt.hint}</span>
                  </Link>
                )
              })}
          </div>
        </section>
      )}

      {/* Popular */}
      <section className="mt-10">
        <SectionHeader title={t('popular')} sub={t('popularSub')} to="/vegetables?sort=popular" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }, (_, i) => <ProductCardSkeleton key={i} />)
            : productService
                .popular(products, 8)
                .map((p) => <ProductCard key={p.id} product={p} source="home_popular" />)}
        </div>
      </section>

      {/* Smart basket promo */}
      <section className="mt-10 overflow-hidden rounded-[28px] bg-forest text-white">
        <div className="grid items-center gap-4 p-6 md:grid-cols-[1.4fr_1fr] md:p-10">
          <div>
            <p className="text-xs font-bold tracking-wider text-turmeric uppercase">Build my basket</p>
            <h2 className="mt-1 font-display text-2xl font-semibold md:text-3xl">A week of vegetables in one tap.</h2>
            <p className="mt-2 text-sm text-white/75 md:text-base">
              Tell us your family size and we'll suggest a sensible weekly basket. Change anything before adding.
            </p>
            <ButtonLink to="/basket" variant="accent" className="mt-5">
              Build my basket
              <Icon name="arrowRight" className="size-4" />
            </ButtonLink>
          </div>
          <ProduceArt kind="basket" className="mx-auto hidden size-48 md:block" />
        </div>
      </section>

      {/* Freshness promise */}
      <section className="mt-10" aria-labelledby="promise-h">
        <h2 id="promise-h" className="font-display text-[22px] font-semibold md:text-2xl">
          {t('promiseTitle')}
        </h2>
        <p className="mt-0.5 text-sm text-muted">{t('promiseSub')}</p>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {promise.map((p, i) => (
            <li key={p.title} className="relative rounded-3xl bg-white p-5 shadow-card">
              <span className="absolute top-5 right-5 font-display text-3xl font-semibold text-line">{i + 1}</span>
              <span className="grid size-11 place-items-center rounded-2xl bg-forest-50 text-forest">
                <Icon name={p.icon} />
              </span>
              <h3 className="mt-3 font-bold">{p.title}</h3>
              <p className="mt-1 text-sm text-muted">{p.body}</p>
            </li>
          ))}
        </ol>
        <Link to="/quality" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-forest hover:underline">
          Read our quality guarantee <Icon name="chevronRight" className="size-4" />
        </Link>
      </section>
    </div>
  )
}
