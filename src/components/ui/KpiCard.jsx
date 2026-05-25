import { useEffect, useRef, useState } from 'react'

function useCountUp(target, duration = 700) {
  const [current, setCurrent] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (typeof target !== 'number') return
    const start = performance.now()
    const animate = (now) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setCurrent(Math.round(target * eased))
      if (t < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])

  return typeof target === 'number' ? current : target
}

const ICON_CLASSES = {
  'text-primary': 'bg-primary-light text-primary',
  'text-success': 'bg-success-light text-success',
  'text-danger':  'bg-danger-light  text-danger',
  'text-warning': 'bg-warning-light text-warning',
  'text-info':    'bg-info-light    text-info',
  'text-accent':  'bg-accent-light  text-accent',
  'text-muted':   'bg-surface-2     text-muted',
}

export function KpiCard({ label, value, icon: Icon, colorClass = 'text-primary', sub }) {
  const displayed = useCountUp(value)
  const iconCls = ICON_CLASSES[colorClass] ?? 'bg-surface-2 text-muted'

  return (
    <div className="bg-surface rounded-[10px] border border-edge px-6 py-5 flex flex-col gap-3
      shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.04)]
      hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.06)]
      hover:border-primary transition-all duration-200 cursor-default">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[11px] font-semibold text-muted uppercase tracking-[0.08em] leading-tight">
          {label}
        </span>
        {Icon && (
          <span className={`${iconCls} w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0`}>
            <Icon size={17} />
          </span>
        )}
      </div>
      <div>
        <div className="text-[32px] font-bold text-content leading-none tabular-nums">{displayed ?? '—'}</div>
        {sub && <div className="text-xs text-muted mt-1.5">{sub}</div>}
      </div>
    </div>
  )
}
