import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { Icon } from '@/components/ui/Icon'

interface Toast {
  id: number
  message: string
  action?: { label: string; onClick: () => void }
  tone?: 'default' | 'success' | 'error'
}

interface ToastApi {
  show: (message: string, opts?: Omit<Toast, 'id' | 'message'>) => void
}

const ToastContext = createContext<ToastApi>({ show: () => {} })

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const seq = useRef(0)

  const show = useCallback<ToastApi['show']>((message, opts) => {
    const id = ++seq.current
    setToasts((t) => [...t.slice(-1), { id, message, ...opts }])
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800)
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-[72px] z-[60] flex flex-col items-center gap-2 px-4 md:top-auto md:bottom-8"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex w-full max-w-sm animate-fade-up items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-white shadow-float"
          >
            <span
              className={`grid size-6 shrink-0 place-items-center rounded-full ${t.tone === 'error' ? 'bg-clay' : 'bg-white/15'}`}
            >
              <Icon name={t.tone === 'error' ? 'alert' : 'check'} className="size-3.5" />
            </span>
            <span className="flex-1">{t.message}</span>
            {t.action && (
              <button
                type="button"
                onClick={t.action.onClick}
                className="rounded-lg px-2 py-1 font-semibold text-turmeric-50 underline-offset-2 hover:underline"
              >
                {t.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
