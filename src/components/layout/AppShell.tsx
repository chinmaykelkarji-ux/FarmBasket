import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { BottomNav } from './BottomNav'
import { Footer } from './Footer'
import { Header } from './Header'

/** Routes that provide their own sticky bottom action bar on mobile. */
const HIDE_BOTTOM_NAV = [/^\/product\//, /^\/checkout/]

export function AppShell() {
  const { pathname } = useLocation()
  const hideNav = HIDE_BOTTOM_NAV.some((r) => r.test(pathname))

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only z-50 rounded-lg bg-ink px-3 py-2 text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
        Skip to content
      </a>
      <Header />
      <main id="main" className={`flex-1 ${hideNav ? 'pb-28 md:pb-0' : 'pb-24 md:pb-0'}`}>
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      {!hideNav && <BottomNav />}
    </div>
  )
}
