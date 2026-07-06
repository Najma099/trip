import { createContext, useCallback, useContext, useState } from 'react'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((message, type = 'info', duration = 4500) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, type }])
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration)
    }
    return id
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0"
        aria-live="polite"
        aria-relevant="additions"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${
              t.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-800'
                : t.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : 'border-[color:var(--sp-border)] bg-white text-[color:var(--sp-text)]'
            }`}
          >
            {t.type === 'error' && <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />}
            {t.type === 'success' && <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden="true" />}
            <span className="flex-1">{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="sp-focus-ring shrink-0 rounded p-0.5 opacity-60 hover:opacity-100"
              aria-label="Dismiss notification"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
