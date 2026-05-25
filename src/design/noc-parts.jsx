/* global React, NocIcon */
const { useEffect, useRef, useState, useMemo } = React;

// ---------- Reveal ----------
function NocReveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShow(true); io.disconnect(); }
    }, { threshold: 0.1 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${show ? "in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

// ---------- CountUp ----------
function NocCount({ to, decimals = 0, duration = 1100, suffix = "", prefix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          setVal(to * eased);
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.4 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [to, duration]);
  const fmt = decimals
    ? val.toFixed(decimals).replace(".", ",")
    : Math.round(val).toLocaleString("fr-FR");
  return <span ref={ref}>{prefix}{fmt}{suffix}</span>;
}

// ---------- Sparkline ----------
function Sparkline({ data, color = "var(--cyan)", w = 56, h = 18, filled = true, className = "" }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => [i * step, h - ((v - min) / range) * (h - 3) - 1.5]);
  const d = pts.map(([x, y], i) => (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1)).join(" ");
  const area = `${d} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg className={`kpi-spark ${className}`} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ color }}>
      {filled && <path d={area} fill={color} opacity="0.18" stroke="none"/>}
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ---------- Live Clock ----------
function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const f = (n) => String(n).padStart(2, "0");
  return (
    <div className="clock">
      <span className="clock-label">UTC+0</span>
      <span>{f(now.getUTCHours())}:{f(now.getUTCMinutes())}:{f(now.getUTCSeconds())}</span>
    </div>
  );
}

// ---------- KPI ----------
function Kpi({ label, value, unit, foot, delta, deltaTone = "up", tone = "default", spark, sparkColor }) {
  return (
    <div className={`kpi ${tone}`}>
      <div className="kpi-head">
        <div className="kpi-label">{label}</div>
        {spark && <Sparkline data={spark} color={sparkColor || "var(--cyan)"}/>}
      </div>
      <div className="kpi-value">{value}{unit && <span className="kpi-unit">{unit}</span>}</div>
      <div className="kpi-foot">
        {delta && (
          <span className={`delta ${deltaTone}`}>
            {deltaTone === "down" ? <NocIcon.Down/> : deltaTone === "flat" ? null : <NocIcon.Up/>}
            {delta}
          </span>
        )}
        {foot && <span>{foot}</span>}
      </div>
    </div>
  );
}

// ---------- Site Map ----------
// Stylized country-shape map of Côte d'Ivoire with abstract site pins.
const COUNTRY_PATH = "M150 80 L380 80 L420 100 L460 150 L470 230 L500 290 L520 340 L500 380 L460 410 L420 430 L380 440 L320 440 L260 430 L210 420 L160 410 L120 380 L100 340 L90 280 L100 220 L120 150 L150 80 Z";
const SITES = [
  { id: "BTS-AB001", city: "Plateau",       x: 380, y: 380, status: "ok",      pop: "Abidjan" },
  { id: "BTS-AB014", city: "Cocody",        x: 410, y: 370, status: "ok",      pop: "Abidjan" },
  { id: "BTS-AB022", city: "Yopougon",      x: 350, y: 385, status: "warn",    pop: "Abidjan" },
  { id: "BTS-AB031", city: "Treichville",   x: 392, y: 395, status: "ok",      pop: "Abidjan" },
  { id: "BTS-AB044", city: "Marcory",       x: 405, y: 405, status: "maint",   pop: "Abidjan" },
  { id: "BTS-BK008", city: "Bouaké N",      x: 290, y: 240, status: "ok",      pop: "Bouaké" },
  { id: "BTS-BK012", city: "Bouaké Centre", x: 305, y: 255, status: "critical",pop: "Bouaké" },
  { id: "BTS-YA002", city: "Yamoussoukro",  x: 280, y: 320, status: "ok",      pop: "Yamoussoukro" },
  { id: "BTS-KR017", city: "Korhogo",       x: 240, y: 130, status: "warn",    pop: "Korhogo" },
  { id: "BTS-SP004", city: "San-Pédro",     x: 240, y: 420, status: "ok",      pop: "San-Pédro" },
  { id: "BTS-MN009", city: "Man",           x: 170, y: 260, status: "ok",      pop: "Man" },
  { id: "BTS-DV011", city: "Daloa",         x: 240, y: 300, status: "maint",   pop: "Daloa" },
  { id: "BTS-OD006", city: "Odienné",       x: 150, y: 160, status: "ok",      pop: "Odienné" },
  { id: "BTS-AB088", city: "Abobo",         x: 388, y: 360, status: "ok",      pop: "Abidjan" },
];
const STATUS_COLORS = {
  ok: "var(--green)",
  warn: "var(--amber)",
  critical: "var(--red)",
  maint: "var(--cyan)",
};

function SiteMap({ selectedId, onSelect }) {
  const links = [
    [0, 1], [0, 2], [0, 3], [3, 4], [4, 13],
    [7, 0], [7, 5], [7, 11], [11, 10], [10, 12],
    [5, 6], [6, 8], [11, 9],
  ];
  return (
    <div className="map-stage">
      <svg className="map-svg" viewBox="0 0 600 480" preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="dotgrid" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="var(--ink-faint)" opacity="0.18"/>
          </pattern>
        </defs>
        <rect width="600" height="480" fill="url(#dotgrid)"/>
        <path className="map-country" d={COUNTRY_PATH}/>

        {/* Network links */}
        {links.map(([a, b], i) => {
          const sa = SITES[a], sb = SITES[b];
          if (!sa || !sb) return null;
          const live = i % 3 === 0;
          return (
            <line
              key={i}
              className={`map-link ${live ? "live" : ""}`}
              x1={sa.x} y1={sa.y} x2={sb.x} y2={sb.y}
            />
          );
        })}

        {/* Pins */}
        {SITES.map((s) => {
          const isSelected = selectedId === s.id;
          const color = STATUS_COLORS[s.status];
          const live = s.status === "critical" || s.status === "warn";
          return (
            <g key={s.id} className={`pin ${live ? "live" : ""}`} style={{ color }} transform={`translate(${s.x},${s.y})`} onClick={() => onSelect && onSelect(s.id)}>
              <circle className="pin-halo" r="14"/>
              <circle className="pin-ring" r="7"/>
              <circle className="pin-core" r="3.5"/>
              {isSelected && (
                <g transform="translate(10, -16)">
                  <rect className="pin-label-bg" x="0" y="0" width={s.id.length * 6.6 + 12} height="20" rx="4"/>
                  <text className="pin-label" x="6" y="13">{s.id}</text>
                </g>
              )}
            </g>
          );
        })}

        {/* North compass */}
        <g transform="translate(40, 50)" opacity="0.6">
          <circle r="14" fill="none" stroke="var(--ink-faint)" strokeWidth="0.7"/>
          <path d="M0 -10 L4 8 L0 4 L-4 8 Z" fill="var(--cyan)"/>
          <text x="0" y="-18" textAnchor="middle" className="pin-label" style={{fontSize:9, fill:'var(--ink-mute)'}}>N</text>
        </g>

        {/* Scale */}
        <g transform="translate(40, 440)" opacity="0.7">
          <line x1="0" y1="0" x2="60" y2="0" stroke="var(--ink-mute)" strokeWidth="1"/>
          <line x1="0" y1="-3" x2="0" y2="3" stroke="var(--ink-mute)" strokeWidth="1"/>
          <line x1="30" y1="-3" x2="30" y2="3" stroke="var(--ink-mute)" strokeWidth="1"/>
          <line x1="60" y1="-3" x2="60" y2="3" stroke="var(--ink-mute)" strokeWidth="1"/>
          <text x="0" y="-8" className="pin-label" style={{fontSize:9, fill:'var(--ink-mute)'}}>0</text>
          <text x="60" y="-8" className="pin-label" style={{fontSize:9, fill:'var(--ink-mute)'}}>100 km</text>
        </g>
      </svg>

      <div className="map-stats">
        <div>
          <div className="map-stat-key">Sites OK</div>
          <div className="map-stat-val ok"><NocCount to={1184} duration={1300}/></div>
        </div>
        <div>
          <div className="map-stat-key">Warning</div>
          <div className="map-stat-val warn"><NocCount to={28} duration={1300}/></div>
        </div>
        <div>
          <div className="map-stat-key">Critique</div>
          <div className="map-stat-val critical"><NocCount to={12} duration={1300}/></div>
        </div>
        <div>
          <div className="map-stat-key">Maintenance</div>
          <div className="map-stat-val" style={{color:'var(--cyan)'}}><NocCount to={47} duration={1300}/></div>
        </div>
      </div>

      <div className="map-legend">
        <span className="leg"><span className="leg-dot" style={{background:"var(--green)"}}/>Opérationnel</span>
        <span className="leg"><span className="leg-dot" style={{background:"var(--amber)"}}/>Warning</span>
        <span className="leg"><span className="leg-dot" style={{background:"var(--red)"}}/>Critique</span>
        <span className="leg"><span className="leg-dot" style={{background:"var(--cyan)"}}/>Maintenance</span>
      </div>
    </div>
  );
}

// ---------- Alert item ----------
function AlertItem({ severity, title, site, region, type, time, icon }) {
  return (
    <div className="alert-item">
      <div className={`alert-icon ${severity}`}>{icon}</div>
      <div className="alert-body">
        <div className="alert-title">{title}</div>
        <div className="alert-meta">
          <span>{site}</span>
          <span className="sep">·</span>
          <span>{region}</span>
          <span className="sep">·</span>
          <span>{type}</span>
        </div>
      </div>
      <div className="alert-time">
        <div>{time}</div>
        <span className={`severity ${severity}`}>{severity === "critical" ? "P1" : severity === "warn" ? "P2" : severity === "info" ? "INFO" : "OK"}</span>
      </div>
    </div>
  );
}

// ---------- Area Chart ----------
function AreaChart({ series, color = "var(--cyan)", height = 220, yLabel = "%", yMax }) {
  const W = 720;
  const H = height;
  const padX = 40, padT = 14, padB = 28;
  const all = series.flat();
  const max = yMax || Math.max(...all) * 1.1;
  const min = 0;
  const xs = (i, n) => padX + ((W - padX * 2) * i) / (n - 1);
  const ys = (v) => padT + (H - padT - padB) * (1 - (v - min) / (max - min));

  const path = (data) => data.map((v, i) => (i ? "L" : "M") + xs(i, data.length).toFixed(1) + " " + ys(v).toFixed(1)).join(" ");
  const area = (data) => `${path(data)} L ${xs(data.length - 1, data.length)} ${H - padB} L ${padX} ${H - padB} Z`;

  const ticks = 4;
  const hours = ["00h", "04h", "08h", "12h", "16h", "20h", "Maintenant"];

  return (
    <div className="chart-area">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <g className="chart-grid">
          {Array.from({ length: ticks + 1 }).map((_, i) => {
            const y = padT + ((H - padT - padB) / ticks) * i;
            const v = max - (max / ticks) * i;
            return (
              <g key={i}>
                <line x1={padX} x2={W - padX / 2} y1={y} y2={y}/>
                <text className="chart-axis-text" x={padX - 6} y={y + 3} textAnchor="end">{v.toFixed(0)}{yLabel}</text>
              </g>
            );
          })}
        </g>
        {hours.map((h, i) => (
          <text key={i} className="chart-axis-text" x={xs(i, hours.length)} y={H - 8} textAnchor="middle">{h}</text>
        ))}
        {series.map((s, i) => (
          <g key={i}>
            <path className="chart-fill" d={area(s)} fill="url(#areaFill)"/>
            <path className="chart-line" d={path(s)} stroke={color} style={{ animationDelay: `${i * 200}ms` }}/>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ---------- Site row (table) ----------
function SiteRow({ id, location, status, uptime, power, temp, lastCheck, spark, sparkColor }) {
  return (
    <tr className="row-hover">
      <td>
        <div className="site-cell-id">{id}</div>
        <div className="site-cell-sub">{location}</div>
      </td>
      <td><span className={`status-pill ${status}`}><span className="dot"/>{status === "ok" ? "Opérationnel" : status === "warn" ? "Anomalie" : status === "critical" ? "Critique" : "Maintenance"}</span></td>
      <td>
        <div className="progress-cell">
          <div className="lbl"><span>Uptime</span><b>{uptime}%</b></div>
          <div className="progress-bar"><div style={{ width: `${uptime}%`, background: uptime > 99 ? "var(--green)" : uptime > 97 ? "var(--amber)" : "var(--red)" }}/></div>
        </div>
      </td>
      <td className="mono" style={{ color: "var(--ink-soft)" }}>{power} kW</td>
      <td className="mono" style={{ color: "var(--ink-soft)" }}>{temp}°C</td>
      <td>
        <Sparkline data={spark} color={sparkColor || "var(--cyan)"} w={80} h={22} className="mini-spark"/>
      </td>
      <td className="mono" style={{ color: "var(--ink-mute)", fontSize: 11 }}>{lastCheck}</td>
    </tr>
  );
}

Object.assign(window, {
  NocReveal, NocCount, Sparkline, LiveClock, Kpi, SiteMap, AlertItem, AreaChart, SiteRow,
});
