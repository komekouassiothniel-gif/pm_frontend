import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { AlertCircle, X } from 'lucide-react'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { getPlanningStats } from '../api/planning'
import { Kpi, AreaChart } from '../components/noc'
import { formatMois } from '../utils/formatters'

// ── Helpers ───────────────────────────────────────────────────────────────────

function num(val) {
  return (val ?? 0).toLocaleString('fr-FR')
}

const spring = { type: 'spring', damping: 22, stiffness: 110 }

// ── Custom Recharts tooltip ───────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      backgroundColor: 'rgba(9,10,15,0.95)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: 12,
      color: '#F5F7FB',
    }}>
      {label && (
        <div style={{ color: 'var(--text-secondary)', marginBottom: 4, fontWeight: 600 }}>{label}</div>
      )}
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color, fontWeight: 500 }}>
          {p.name} : {typeof p.value === 'number' ? p.value.toLocaleString('fr-FR') : p.value}
        </div>
      ))}
    </div>
  )
}

// ── Alert Banners ─────────────────────────────────────────────────────────────

function useDismissed() {
  const [dismissed, setDismissed] = useState(() => {
    try { return new Set(JSON.parse(sessionStorage.getItem('pm_dash_banners') || '[]')) }
    catch { return new Set() }
  })
  const dismiss = (key) => {
    const next = new Set([...dismissed, key])
    setDismissed(next)
    sessionStorage.setItem('pm_dash_banners', JSON.stringify([...next]))
  }
  return { dismissed, dismiss }
}

function AlertBanners({ stats }) {
  const { dismissed, dismiss } = useDismissed()
  const today = new Date()
  const banners = []

  if (stats.en_retard > 100 && !dismissed.has('retard')) {
    banners.push({ key: 'retard', variant: 'red', text: `${num(stats.en_retard)} passages en retard — intervention requise.` })
  }
  if (stats.taux_realisation < 0.5 && today.getDate() > 15 && !dismissed.has('taux')) {
    banners.push({ key: 'taux', variant: 'yellow', text: `Taux de réalisation critique (${(stats.taux_realisation * 100).toFixed(1)} %) à mi-parcours du mois.` })
  }

  if (!banners.length) return null

  return (
    <motion.div layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-2">
      <AnimatePresence>
        {banners.map(({ key, variant, text }) => (
          <motion.div
            key={key} layout
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium"
            style={variant === 'red' ? {
              background: 'linear-gradient(90deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))',
              border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: 'var(--danger)',
            } : {
              background: 'linear-gradient(90deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
              border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, color: 'var(--warning)',
            }}
          >
            <AlertCircle size={15} className="shrink-0" />
            <span className="flex-1">{text}</span>
            <button onClick={() => dismiss(key)} className="shrink-0 hover:opacity-60 p-0.5 rounded transition-opacity" aria-label="Ignorer">
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Donut Chart ───────────────────────────────────────────────────────────────

function DonutLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.06) return null
  const RAD = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RAD)
  const y = cy + r * Math.sin(-midAngle * RAD)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

const GLASS_CARD = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16,
}

function StatusDonut({ stats }) {
  const faits   = stats.faits ?? 0
  const retard  = stats.en_retard ?? 0
  const restant = Math.max(0, (stats.total ?? 0) - faits - retard)

  const data = [
    { name: 'Faits',     value: faits,   color: '#FFCC00' },
    { name: 'En retard', value: retard,  color: '#EF4444' },
    { name: 'Restant',   value: restant, color: '#334155' },
  ].filter((d) => d.value > 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.3 }}
      className="p-5 flex flex-col gap-3" style={{ ...GLASS_CARD, flex: '2', minWidth: 260 }}
    >
      <h3 className="text-sm font-semibold text-content">Répartition des statuts</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={58} outerRadius={88} paddingAngle={3} dataKey="value" labelLine={false} label={DonutLabel}>
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
          <Legend formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{v}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

// ── SBC Table ─────────────────────────────────────────────────────────────────

function tausBadge(taux) {
  if (taux >= 0.85) return 'bg-success-light text-success'
  if (taux >= 0.70) return 'bg-warning-light text-warning'
  return 'bg-danger-light text-danger'
}

function SBCTable({ sbcPerf }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.45 }}
      className="p-5" style={GLASS_CARD}
    >
      <h3 className="text-sm font-semibold text-content mb-4">Performance par SBC</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-edge">
              {['SBC', 'Planifié', 'Faits', 'En retard', 'Taux'].map((h) => (
                <th key={h} className="text-left text-[11px] font-semibold text-muted uppercase tracking-wider py-2.5 px-3 first:pl-0">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sbcPerf.map((row, i) => (
              <motion.tr
                key={row.sbc}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.45 + i * 0.07 }}
                className="border-b border-edge/50 last:border-0 hover:bg-surface-2 transition-colors duration-150"
              >
                <td className="py-3 pl-0 pr-3 font-semibold text-content">{row.sbc}</td>
                <td className="py-3 px-3 text-secondary tabular-nums">{num(row.total_planifie)}</td>
                <td className="py-3 px-3 text-secondary tabular-nums">{num(row.faits)}</td>
                <td className="py-3 px-3 text-danger font-medium tabular-nums">{num(row.en_retard)}</td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${tausBadge(row.taux ?? 0)}`}>
                    {row.taux != null ? `${(row.taux * 100).toFixed(1)} %` : '—'}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['planningStats', {}],
    queryFn: () => getPlanningStats({ annee: 2026 }).then((r) => r.data),
    staleTime: 60_000,
  })

  const moisEntries = stats
    ? Object.entries(stats.par_mois).sort(([a], [b]) => Number(a) - Number(b))
    : []

  const moisLabels  = moisEntries.map(([m]) => formatMois(Number(m)).slice(0, 3))
  const totalSeries = moisEntries.map(([, c]) => c.total || 0)
  const faitsSeries = moisEntries.map(([, c]) => c.faits  || 0)

  const last7 = moisEntries.slice(-7)

  const spark_total  = totalSeries.slice(-7)
  const spark_faits  = faitsSeries.slice(-7)
  const spark_retard = last7.map(([, c]) => Math.max(0, (c.total || 0) - (c.faits || 0)))
  const spark_taux   = last7.map(([, c]) => c.total > 0 ? Math.round((c.faits / c.total) * 100) : 0)
  const sparkLabels  = last7.map(([m]) => formatMois(Number(m)).slice(0, 3))

  const sbcPerf = stats?.par_sbc_perf ?? []

  if (isLoading) return <LoadingSpinner size="lg" />

  return (
    <div className="space-y-5">

      {stats && <AlertBanners stats={stats} />}

      {/* ── KPI Cards ───────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.05 }}
        className="kpi-row"
      >
        <Kpi
          label="Total Planifié"
          value={num(stats?.total)}
          foot="passages programmés"
          spark={spark_total}
          sparkColor="var(--cyan)"
          sparkLabels={sparkLabels}
        />
        <Kpi
          label="Passages Faits"
          value={num(stats?.faits)}
          tone="ok"
          foot="interventions réalisées"
          spark={spark_faits}
          sparkColor="var(--green)"
          sparkLabels={sparkLabels}
        />
        <Kpi
          label="En Retard"
          value={num(stats?.en_retard)}
          tone={stats?.en_retard > 50 ? 'critical' : 'warn'}
          foot="nécessitent intervention"
          spark={spark_retard}
          sparkColor="var(--red)"
          sparkLabels={sparkLabels}
        />
        <Kpi
          label="Taux Réalisation"
          value={(((stats?.taux_realisation ?? 0) * 100).toFixed(1))}
          unit="%"
          tone={stats?.taux_realisation >= 0.85 ? 'ok' : stats?.taux_realisation >= 0.7 ? 'warn' : 'critical'}
          foot="du planning exécuté"
          spark={spark_taux}
          sparkColor="var(--cyan)"
          sparkLabels={sparkLabels}
        />
      </motion.div>

      {/* ── Graphiques ───────────────────────────────────────────────── */}
      <div className="flex gap-4 flex-col xl:flex-row">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.18 }}
          className="p-5 flex flex-col gap-3" style={{ ...GLASS_CARD, flex: '3' }}
        >
          <h3 className="text-sm font-semibold text-content">Planifié vs Faits par mois</h3>
          {moisLabels.length >= 2 ? (
            <AreaChart
              series={[totalSeries, faitsSeries]}
              colors={['var(--warning)', 'var(--success)']}
              xLabels={moisLabels}
              yLabel=""
              height={220}
            />
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted text-sm">Pas assez de données</div>
          )}
        </motion.div>

        {stats && <StatusDonut stats={stats} />}
      </div>

      {/* ── Tableau SBC ──────────────────────────────────────────────── */}
      {stats && sbcPerf.length > 0 && <SBCTable sbcPerf={sbcPerf} />}

    </div>
  )
}
