import { lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { CatalogProvider } from '@/state/CatalogContext'
import { CartProvider } from '@/state/CartContext'
import { PreferencesProvider } from '@/state/PreferencesContext'
import { ToastProvider } from '@/state/ToastContext'
import { HomePage } from '@/pages/HomePage'

const CatalogPage = lazy(() => import('@/pages/CatalogPage'))
const SearchPage = lazy(() => import('@/pages/SearchPage'))
const ProductPage = lazy(() => import('@/pages/ProductPage'))
const CartPage = lazy(() => import('@/pages/CartPage'))
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'))
const OrderConfirmedPage = lazy(() => import('@/pages/OrderConfirmedPage'))
const OrderTrackingPage = lazy(() => import('@/pages/OrderTrackingPage'))
const ReportIssuePage = lazy(() => import('@/pages/ReportIssuePage'))
const OrdersPage = lazy(() => import('@/pages/OrdersPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const PreferencesPage = lazy(() => import('@/pages/PreferencesPage'))
const AddressesPage = lazy(() => import('@/pages/AddressesPage'))
const BasketBuilderPage = lazy(() => import('@/pages/BasketBuilderPage'))
const InfoPage = lazy(() => import('@/pages/InfoPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/vegetables', element: <CatalogPage /> },
      { path: '/explore', element: <CatalogPage /> },
      { path: '/search', element: <SearchPage /> },
      { path: '/product/:slug', element: <ProductPage /> },
      { path: '/cart', element: <CartPage /> },
      { path: '/checkout', element: <CheckoutPage /> },
      { path: '/orders', element: <OrdersPage /> },
      { path: '/orders/:id', element: <OrderTrackingPage /> },
      { path: '/orders/:id/confirmed', element: <OrderConfirmedPage /> },
      { path: '/orders/:id/report', element: <ReportIssuePage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/profile/preferences', element: <PreferencesPage /> },
      { path: '/profile/addresses', element: <AddressesPage /> },
      { path: '/basket', element: <BasketBuilderPage /> },
      { path: '/help', element: <InfoPage page="help" /> },
      { path: '/quality', element: <InfoPage page="quality" /> },
      { path: '/about', element: <InfoPage page="about" /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export function App() {
  return (
    <ToastProvider>
      <CatalogProvider>
        <PreferencesProvider>
          <CartProvider>
            <RouterProvider router={router} />
          </CartProvider>
        </PreferencesProvider>
      </CatalogProvider>
    </ToastProvider>
  )
}
