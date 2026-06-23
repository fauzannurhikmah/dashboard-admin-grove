import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check, RefreshCw } from 'lucide-react'

export default function ActionMenu({
  label,
  items,
  className = '',
  disabled = false,
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const hasPendingItem = items.some((item) => item.isPending)

  return (
    <div ref={rootRef} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`
          relative inline-flex min-h-[38px] items-center justify-center gap-2 rounded-lg border px-4 py-2
          text-xs font-semibold whitespace-nowrap overflow-hidden transition-all duration-300
          ${disabled
            ? 'bg-zinc-900/50 border-zinc-800 text-zinc-500 cursor-not-allowed'
            : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-emerald-500/40 hover:bg-emerald-500/5 hover:text-emerald-400'
          }
        `}
      >
        {hasPendingItem && (
          <span className="absolute inset-0 -translate-x-full animate-[shimmer_1.2s_infinite] bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent" />
        )}
        <RefreshCw className={`h-3.5 w-3.5 ${hasPendingItem ? 'animate-spin text-emerald-500/40' : ''}`} />
        <span>{hasPendingItem ? 'Syncing...' : label}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && !disabled && (
        <div className="absolute right-0 top-full z-20 mt-2 w-64 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
          <div className="border-b border-zinc-900 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            {label}
          </div>
          <div className="p-1">
            {items.map((item) => {
              const itemDisabled = disabled || item.disabled || item.isPending

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    if (itemDisabled) return
                    setOpen(false)
                    item.onClick?.()
                  }}
                  disabled={itemDisabled}
                  className={`
                    flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs transition-colors
                    ${itemDisabled
                      ? 'cursor-not-allowed text-zinc-500'
                      : 'text-zinc-300 hover:bg-zinc-900 hover:text-emerald-400'
                    }
                  `}
                >
                  <span
                    className={`
                      flex h-8 w-8 items-center justify-center rounded-md border
                      ${itemDisabled
                        ? 'border-zinc-800 bg-zinc-900/60 text-zinc-600'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-300'
                      }
                    `}
                  >
                    {item.isPending
                      ? <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-500/60" />
                      : item.icon || <Check className="h-3.5 w-3.5" />
                    }
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{item.isPending ? item.pendingLabel || 'Syncing...' : item.label}</span>
                    {item.description && <span className="mt-0.5 block text-[11px] text-zinc-500">{item.description}</span>}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
