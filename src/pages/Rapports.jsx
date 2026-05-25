import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileBarChart, Download, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { getRapportPassages, exportRapportExcel } from '../api/rapports'
import { KpiCard } from '../components/ui/KpiCard'
import { Badge } from '../components/ui/Badge'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { EmptyState } from '../components/ui/EmptyState'
import { Pagination } from '../components/ui/Pagination'
import { SBC_LIST, CATEGORIES, CATEGORIE_LABELS } from '../utils/constants'
import { formatDate, formatPercent } from '../utils/formatters'
import { Activity, CheckCircle, AlertTriangle, Clock } from 'lucide-react'

const STATUTS = ['Prevu', 'Fait', 'Non_effectue']
const STATUT_LABELS = { Prevu: 'Prévu', Fait: 'Fait', Non_effectue: 'Non effectué' }
const PAGE_SIZE = 100

function cleanParams(f) {
  return Object.fromEntries(
    Object.entries(f).filter(([, v]) => v !== '' && v != null)
  )
}

export default function Rapports() {
  const [filters, setFilters] = useState({
    date_debut: '', date_fin: '',
    sbc: '', statut: '', categorie: '', annee: '',
  })
  const [skip, setSkip] = useState(0)
  const [queried, setQueried] = useState(false)
  const [exporting, setExporting] = useState(false)

  const params = { ...cleanParams(filters), skip, limit: PAGE_SIZE }

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['rapportPassages', params],
    queryFn: () => getRapportPassages(params).then((r) => r.data),
    enabled: queried,
  })

  const handleGenerate = () => {
    setSkip(0)
    setQueried(true)
    refetch()
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const { data: blob } = await exportRapportExcel(cleanParams(filters))
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const d1 = filters.date_debut || 'debut'
      const d2 = filters.date_fin || 'fin'
      a.download = `Rapport_PM_MTN_${d1}_${d2}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Rapport Excel téléchargé')
    } catch {
      toast.error("Erreur lors de l'export Excel")
    } finally {
      setExporting(false)
    }
  }

  const set = (key) => (e) => {
    setFilters((f) => ({ ...f, [key]: e.target.value }))
    setQueried(false)
  }

  const inputCls =
    'border border-edge-strong rounded-lg px-3 py-1.5 text-sm bg-surface text-content focus:outline-none focus:ring-1 focus:ring-primary'

  const stats = data?.stats

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-surface rounded-xl border border-edge shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">Date début</label>
            <input type="date" value={filters.date_debut} onChange={set('date_debut')} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">Date fin</label>
            <input type="date" value={filters.date_fin} onChange={set('date_fin')} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">SBC</label>
            <select value={filters.sbc} onChange={set('sbc')} className={inputCls}>
              <option value="">Tous</option>
              {SBC_LIST.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">Statut</label>
            <select value={filters.statut} onChange={set('statut')} className={inputCls}>
              <option value="">Tous</option>
              {STATUTS.map((s) => (
                <option key={s} value={s}>{STATUT_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">Catégorie</label>
            <select value={filters.categorie} onChange={set('categorie')} className={inputCls}>
              <option value="">Toutes</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORIE_LABELS[c]}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">Année</label>
            <select value={filters.annee} onChange={set('annee')} className={inputCls}>
              <option value="">Toutes</option>
              {[2025, 2026, 2027].map((y) => <option key={y}>{y}</option>)}
            </select>
          </div>

          <div className="flex gap-2 ml-auto">
            <button
              onClick={handleGenerate}
              disabled={isLoading || isFetching}
              className="flex items-center gap-2 btn-primary px-4 py-1.5 rounded-lg text-sm font-medium disabled:opacity-60"
            >
              <Search size={14} />
              Générer
            </button>
            {data && (
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-2 bg-success text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                <Download size={14} />
                {exporting ? 'Export…' : 'Excel'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard label="Total passages" value={stats.total} icon={Activity} colorClass="text-primary" />
          <KpiCard
            label="Effectués"
            value={stats.faits}
            icon={CheckCircle}
            colorClass="text-success"
            sub={`Taux : ${formatPercent(stats.taux_realisation)}`}
          />
          <KpiCard label="À venir" value={stats.a_venir} icon={Clock} colorClass="text-info" />
          <KpiCard
            label="Non effectués"
            value={stats.non_effectues}
            icon={AlertTriangle}
            colorClass="text-danger"
            sub={stats.en_retard ? `dont ${stats.en_retard} en retard` : null}
          />
          <KpiCard
            label="Résultats affichés"
            value={data.total}
            icon={FileBarChart}
            colorClass="text-warning"
          />
        </div>
      )}

      {/* Table */}
      {queried && (
        <div className="bg-surface rounded-xl border border-edge shadow-sm overflow-hidden">
          <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1.5fr_1fr_1fr] px-4 py-3 border-b border-edge bg-surface-2 text-xs font-semibold text-muted uppercase tracking-wider">
            <span>Code</span>
            <span>Nom</span>
            <span>Cat.</span>
            <span>SBC</span>
            <span>Statut</span>
            <span>Date planif.</span>
            <span>Date exéc.</span>
            <span>WO</span>
          </div>

          {(isLoading || isFetching) && <LoadingSpinner />}

          {!isLoading && !isFetching && data?.items?.length === 0 && (
            <EmptyState message="Aucun passage trouvé pour ces filtres" Icon={FileBarChart} />
          )}

          {!isLoading && !isFetching && data?.items?.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1.5fr_1fr_1fr] px-4 py-3 border-b border-edge text-sm items-center hover:bg-canvas transition-colors"
            >
              <span className="font-mono text-xs text-content font-medium">{p.site.code_site}</span>
              <span className="text-content truncate text-xs" title={p.site.nom}>{p.site.nom}</span>
              <Badge value={p.site.categorie} />
              <span className="text-muted text-xs">{p.site.sbc}</span>
              <Badge value={p.statut} />
              <span className="text-muted text-xs">{formatDate(p.date_planifiee)}</span>
              <span className="text-muted text-xs">{p.execution ? formatDate(p.execution.date_execution) : '—'}</span>
              <span className="text-muted text-xs font-mono truncate">{p.execution?.wo_ticket || '—'}</span>
            </div>
          ))}

          {data && data.total > PAGE_SIZE && (
            <Pagination skip={skip} limit={PAGE_SIZE} total={data.total} onPageChange={setSkip} />
          )}
        </div>
      )}

      {!queried && (
        <div className="bg-surface rounded-xl border border-edge shadow-sm">
          <EmptyState message="Définissez vos filtres et cliquez sur Générer" Icon={FileBarChart} />
        </div>
      )}
    </div>
  )
}
