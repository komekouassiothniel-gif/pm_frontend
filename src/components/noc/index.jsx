import { useEffect, useId, useRef, useState } from 'react'

// ── Inline icons to replace NocIcon.Up / NocIcon.Down ────────────────────────
function IconUp() {
  return (
    <svg viewBox="0 0 10 10" width="10" height="10" fill="currentColor">
      <path d="M5 1.5L9.5 8.5H0.5Z" />
    </svg>
  )
}

function IconDown() {
  return (
    <svg viewBox="0 0 10 10" width="10" height="10" fill="currentColor">
      <path d="M5 8.5L0.5 1.5H9.5Z" />
    </svg>
  )
}

// ── Reveal (scroll-triggered fade-in) ────────────────────────────────────────
export function NocReveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShow(true); io.disconnect() }
    }, { threshold: 0.1 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className={`reveal ${show ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

// ── Count-up animation ────────────────────────────────────────────────────────
export function NocCount({ to, decimals = 0, duration = 1100, suffix = '', prefix = '' }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)
  useEffect(() => {
    if (!ref.current) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        const start = performance.now()
        const tick = (now) => {
          const t = Math.min(1, (now - start) / duration)
          const eased = 1 - Math.pow(1 - t, 3)
          setVal(to * eased)
          if (t < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.4 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [to, duration])
  const fmt = decimals
    ? val.toFixed(decimals).replace('.', ',')
    : Math.round(val).toLocaleString('fr-FR')
  return <span ref={ref}>{prefix}{fmt}{suffix}</span>
}

// ── Sparkline ─────────────────────────────────────────────────────────────────
export function Sparkline({ data, color = 'var(--cyan)', w = 56, h = 18, filled = true, className = '', labels }) {
  const [tooltip, setTooltip] = useState(null)

  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const step = w / (data.length - 1)
  const pts = data.map((v, i) => [i * step, h - ((v - min) / range) * (h - 3) - 1.5])
  const d = pts.map(([x, y], i) => (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1)).join(' ')
  const area = `${d} L ${w} ${h} L 0 ${h} Z`

  const handleMouseMove = (e) => {
    if (!labels) return
    const rect = e.currentTarget.getBoundingClientRect()
    const relX = e.clientX - rect.left
    const idx = Math.max(0, Math.min(data.length - 1, Math.round((relX / rect.width) * (data.length - 1))))
    setTooltip({ idx, value: data[idx], label: labels[idx], x: e.clientX, y: rect.top })
  }

  return (
    <div
      style={{ position: 'relative', display: 'inline-block', lineHeight: 0, cursor: labels ? 'crosshair' : 'default' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTooltip(null)}
    >
      <svg
        className={`kpi-spark ${className}`}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        style={{ color, display: 'block', pointerEvents: 'none' }}
      >
        {filled && <path d={area} fill={color} opacity="0.18" stroke="none" />}
        <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {tooltip && (
          <>
            <line
              x1={pts[tooltip.idx][0].toFixed(1)} y1={0}
              x2={pts[tooltip.idx][0].toFixed(1)} y2={h}
              stroke={color} strokeWidth="0.8" opacity="0.55" strokeDasharray="2 2"
            />
            <circle
              cx={pts[tooltip.idx][0].toFixed(1)} cy={pts[tooltip.idx][1].toFixed(1)}
              r="2" fill={color} stroke="var(--surface)" strokeWidth="1"
            />
          </>
        )}
      </svg>

      {tooltip && (
        <div style={{
          position: 'fixed',
          left: tooltip.x,
          top: tooltip.y - 8,
          transform: 'translate(-50%, -100%)',
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: 6,
          padding: '4px 8px',
          fontFamily: 'var(--font-mono)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 9999,
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          lineHeight: 1.5,
        }}>
          <div style={{ fontSize: 9, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {tooltip.label}
          </div>
          <div style={{ fontSize: 11, color, fontWeight: 700 }}>
            {typeof tooltip.value === 'number' ? tooltip.value.toLocaleString('fr-FR') : tooltip.value}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Live Clock ────────────────────────────────────────────────────────────────
export function LiveClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const f = (n) => String(n).padStart(2, '0')
  return (
    <div className="clock">
      <span className="clock-label">UTC+0</span>
      <span>{f(now.getUTCHours())}:{f(now.getUTCMinutes())}:{f(now.getUTCSeconds())}</span>
    </div>
  )
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
export function Kpi({ label, value, unit, foot, delta, deltaTone = 'up', tone = 'default', spark, sparkColor, sparkLabels }) {
  return (
    <div className={`kpi ${tone}`}>
      <div className="kpi-head">
        <div className="kpi-label">{label}</div>
        {spark && <Sparkline data={spark} color={sparkColor || 'var(--cyan)'} labels={sparkLabels} />}
      </div>
      <div className="kpi-value">
        {value}
        {unit && <span className="kpi-unit">{unit}</span>}
      </div>
      <div className="kpi-foot">
        {delta && (
          <span className={`delta ${deltaTone}`}>
            {deltaTone === 'down' ? <IconDown /> : deltaTone === 'flat' ? null : <IconUp />}
            {delta}
          </span>
        )}
        {foot && <span>{foot}</span>}
      </div>
    </div>
  )
}

// ── Site Map (design mock with hardcoded SITES) ───────────────────────────────
const COUNTRY_PATH = 'M150 80 L380 80 L420 100 L460 150 L470 230 L500 290 L520 340 L500 380 L460 410 L420 430 L380 440 L320 440 L260 430 L210 420 L160 410 L120 380 L100 340 L90 280 L100 220 L120 150 L150 80 Z'

const MOCK_SITES = [
  { id: 'BTS-AB001', city: 'Plateau',       x: 380, y: 380, status: 'ok',      pop: 'Abidjan' },
  { id: 'BTS-AB014', city: 'Cocody',        x: 410, y: 370, status: 'ok',      pop: 'Abidjan' },
  { id: 'BTS-AB022', city: 'Yopougon',      x: 350, y: 385, status: 'warn',    pop: 'Abidjan' },
  { id: 'BTS-BK008', city: 'Bouaké N',      x: 290, y: 240, status: 'ok',      pop: 'Bouaké' },
  { id: 'BTS-BK012', city: 'Bouaké Centre', x: 305, y: 255, status: 'critical', pop: 'Bouaké' },
  { id: 'BTS-YA002', city: 'Yamoussoukro',  x: 280, y: 320, status: 'ok',      pop: 'Yamoussoukro' },
  { id: 'BTS-KR017', city: 'Korhogo',       x: 240, y: 130, status: 'warn',    pop: 'Korhogo' },
  { id: 'BTS-MN009', city: 'Man',           x: 170, y: 260, status: 'ok',      pop: 'Man' },
]

const STATUS_COLORS = {
  ok:       'var(--green)',
  warn:     'var(--amber)',
  critical: 'var(--red)',
  maint:    'var(--cyan)',
}

export function SiteMap({ selectedId, onSelect }) {
  return (
    <div className="map-stage">
      <svg className="map-svg" viewBox="0 0 600 480" preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="dotgrid-mock" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="var(--ink-faint)" opacity="0.18" />
          </pattern>
        </defs>
        <rect width="600" height="480" fill="url(#dotgrid-mock)" />
        <path className="map-country" d={COUNTRY_PATH} />
        {MOCK_SITES.map((s) => {
          const isSelected = selectedId === s.id
          const color = STATUS_COLORS[s.status]
          const live = s.status === 'critical' || s.status === 'warn'
          return (
            <g key={s.id} className={`pin ${live ? 'live' : ''}`} style={{ color }} transform={`translate(${s.x},${s.y})`} onClick={() => onSelect && onSelect(s.id)}>
              <circle className="pin-halo" r="14" />
              <circle className="pin-ring" r="7" />
              <circle className="pin-core" r="3.5" />
              {isSelected && (
                <g transform="translate(10, -16)">
                  <rect className="pin-label-bg" x="0" y="0" width={s.id.length * 6.6 + 12} height="20" rx="4" />
                  <text className="pin-label" x="6" y="13">{s.id}</text>
                </g>
              )}
            </g>
          )
        })}
        <g transform="translate(40, 50)" opacity="0.6">
          <circle r="14" fill="none" stroke="var(--ink-faint)" strokeWidth="0.7" />
          <path d="M0 -10 L4 8 L0 4 L-4 8 Z" fill="var(--cyan)" />
          <text x="0" y="-18" textAnchor="middle" className="pin-label" style={{ fontSize: 9, fill: 'var(--ink-mute)' }}>N</text>
        </g>
      </svg>
      <div className="map-legend">
        <span className="leg"><span className="leg-dot" style={{ background: 'var(--green)' }} />Opérationnel</span>
        <span className="leg"><span className="leg-dot" style={{ background: 'var(--amber)' }} />Warning</span>
        <span className="leg"><span className="leg-dot" style={{ background: 'var(--red)' }} />Critique</span>
      </div>
    </div>
  )
}

// ── Alert Item ────────────────────────────────────────────────────────────────
export function AlertItem({ severity, title, site, region, type, time, icon }) {
  return (
    <div className="alert-item">
      <div className={`alert-icon ${severity}`}>{icon}</div>
      <div className="alert-body">
        <div className="alert-title">{title}</div>
        <div className="alert-meta">
          {site && <span>{site}</span>}
          {region && <><span className="sep">·</span><span>{region}</span></>}
          {type && <><span className="sep">·</span><span>{type}</span></>}
        </div>
      </div>
      <div className="alert-time">
        <div>{time}</div>
        <span className={`severity ${severity}`}>
          {severity === 'critical' ? 'P1' : severity === 'warn' ? 'P2' : severity === 'info' ? 'INFO' : 'OK'}
        </span>
      </div>
    </div>
  )
}

// ── Area Chart ────────────────────────────────────────────────────────────────
export function AreaChart({ series, color = 'var(--cyan)', height = 220, yLabel = '%', yMax, xLabels, colors }) {
  const uid = useId().replace(/:/g, '')
  const W = 720
  const H = height
  const padX = 40, padT = 14, padB = 28
  const all = series.flat()
  const max = yMax || Math.max(...all, 1) * 1.1
  const min = 0
  const xLbls = xLabels || ['00h', '04h', '08h', '12h', '16h', '20h', 'Maintenant']
  const seriesColors = colors || series.map(() => color)

  const xs = (i, n) => padX + ((W - padX * 2) * i) / (n - 1)
  const ys = (v) => padT + (H - padT - padB) * (1 - (v - min) / (max - min))
  const pathD = (data) => data.map((v, i) => (i ? 'L' : 'M') + xs(i, data.length).toFixed(1) + ' ' + ys(v).toFixed(1)).join(' ')
  const areaD = (data) => `${pathD(data)} L ${xs(data.length - 1, data.length)} ${H - padB} L ${padX} ${H - padB} Z`
  const ticks = 4

  return (
    <div className="chart-area">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          {seriesColors.map((c, i) => (
            <linearGradient key={i} id={`nocFill-${uid}-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c} stopOpacity="0.4" />
              <stop offset="100%" stopColor={c} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        <g className="chart-grid">
          {Array.from({ length: ticks + 1 }).map((_, i) => {
            const y = padT + ((H - padT - padB) / ticks) * i
            const v = max - (max / ticks) * i
            return (
              <g key={i}>
                <line x1={padX} x2={W - padX / 2} y1={y} y2={y} />
                <text className="chart-axis-text" x={padX - 6} y={y + 3} textAnchor="end">{v.toFixed(0)}{yLabel}</text>
              </g>
            )
          })}
        </g>
        {xLbls.map((lbl, i) => (
          <text key={i} className="chart-axis-text" x={xs(i, xLbls.length)} y={H - 8} textAnchor="middle">{lbl}</text>
        ))}
        {series.map((s, i) => (
          <g key={i}>
            <path className="chart-fill" d={areaD(s)} fill={`url(#nocFill-${uid}-${i})`} />
            <path className="chart-line" d={pathD(s)} stroke={seriesColors[i]} style={{ animationDelay: `${i * 200}ms` }} />
          </g>
        ))}
      </svg>
    </div>
  )
}

// ── Site Row (table row, uses <tr>) ──────────────────────────────────────────
export function SiteRow({ id, location, status, uptime, power, temp, lastCheck, spark, sparkColor }) {
  return (
    <tr className="row-hover">
      <td>
        <div className="site-cell-id">{id}</div>
        <div className="site-cell-sub">{location}</div>
      </td>
      <td>
        <span className={`status-pill ${status}`}>
          <span className="dot" />
          {status === 'ok' ? 'Opérationnel' : status === 'warn' ? 'Anomalie' : status === 'critical' ? 'Critique' : 'Maintenance'}
        </span>
      </td>
      <td>
        <div className="progress-cell">
          <div className="lbl"><span>Uptime</span><b>{uptime}%</b></div>
          <div className="progress-bar">
            <div style={{ width: `${uptime}%`, background: uptime > 99 ? 'var(--green)' : uptime > 97 ? 'var(--amber)' : 'var(--red)' }} />
          </div>
        </div>
      </td>
      <td className="mono" style={{ color: 'var(--ink-soft)' }}>{power} kW</td>
      <td className="mono" style={{ color: 'var(--ink-soft)' }}>{temp}°C</td>
      <td>
        <Sparkline data={spark} color={sparkColor || 'var(--cyan)'} w={80} h={22} className="mini-spark" />
      </td>
      <td className="mono" style={{ color: 'var(--ink-mute)', fontSize: 11 }}>{lastCheck}</td>
    </tr>
  )
}
