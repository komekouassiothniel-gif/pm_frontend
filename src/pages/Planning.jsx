import { useState, useRef, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Filter, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { getPlanning, updatePassageStatut } from '../api/planning'
import { useSortTable, SortIcon } from '../hooks/useSortTable.jsx'
import { Badge } from '../components/ui/Badge'
import { Sparkline } from '../components/noc'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { EmptyState } from '../components/ui/EmptyState'
import { MOIS, SBC_LIST, STATUTS_PASSAGE, STATUT_LABELS } from '../utils/constants'
import { formatDate } from '../utils/formatters'

const LIMIT = 500

export default function Planning() {
  const [filters, setFilters] = useState({ annee: 2026 })
  const [editingId, setEditingId] = useState(null)
  const parentRef = useRef(null)
  const qc = useQueryClient()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['planning', filters],
    queryFn: () => getPlanning({ ...filters, limit: LIMIT }).then((r) => r.data),
    staleTime: 30_000,
  })

  const rows = useMemo(() => data?.items ?? [], [data?.items])

  const siteSparklines = useMemo(() => {
    const map = {}
    for (const p of rows) {
      const key = p.site?.code_site
      if (!key) continue
      if (!map[key]) map[key] = {}
      const m = p.mois_num
      if (!map[key][m]) map[key][m] = { total: 0, faits: 0 }
      map[key][m].total++
      if (p.statut === 'Fait') map[key][m].faits++
    }
    const result = {}
    for (const [site, months] of Object.entries(map)) {
      const sorted = Object.entries(months).sort(([a], [b]) => Number(a) - Number(b))
      result[site] = sorted.map(([, c]) => c.total > 0 ? Math.round((c.faits / c.total) * 100) : 0)
    }
    return result
  }, [rows])

  const { sortKey, sortDir, toggleSort, sortData } = useSortTable()
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')

  const filteredRows = rows.filter((p) => {
    if (dateDebut && p.date_planifiee < dateDebut) return false
    if (dateFin && p.date_planifiee > dateFin) return false
    return true
  })
  const displayRows = sortData(filteredRows)

  const virtualizer = useVirtualizer({
    count: displayRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 10,
  })

  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => updatePassageStatut(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['planning'] })
      qc.invalidateQueries({ queryKey: ['planningStats'] })
      setEditingId(null)
      toast.success('Passage mis à jour')
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  })

  const handleFilterChange = (key, val) =>
    setFilters((prev) => {
      const next = { ...prev }
      if (val === '' || val === 'all') delete next[key]
      else next[key] = val
      return next
    })

  return (
    <div className="flex flex-col h-[calc(100vh-5.5rem)] gap-4">
      {/* Filters */}
      <div className="bg-surface rounded-xl border border-edge shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <Filter size={15} className="text-muted" />

        <select
          value={filters.sbc ?? 'all'}
          onChange={(e) => handleFilterChange('sbc', e.target.value)}
          className="border border-edge-strong rounded-lg px-3 py-1.5 text-sm bg-surface text-content focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">Tous les SBC</option>
          {SBC_LIST.map((s) => <option key={s}>{s}</option>)}
        </select>

        <select
          value={filters.mois_num ?? 'all'}
          onChange={(e) => handleFilterChange('mois_num', e.target.value)}
          className="border border-edge-strong rounded-lg px-3 py-1.5 text-sm bg-surface text-content focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">Tous les mois</option>
          {MOIS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
        </select>

        <select
          value={filters.statut ?? 'all'}
          onChange={(e) => handleFilterChange('statut', e.target.value)}
          className="border border-edge-strong rounded-lg px-3 py-1.5 text-sm bg-surface text-content focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">Tous les statuts</option>
          {STATUTS_PASSAGE.map((s) => (
            <option key={s} value={s}>{STATUT_LABELS[s]}</option>
          ))}
        </select>

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="border border-edge-strong rounded-lg px-3 py-1.5 text-sm bg-surface text-content focus:outline-none focus:ring-1 focus:ring-primary"
            title="Date début"
          />
          <span className="text-muted text-xs">→</span>
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="border border-edge-strong rounded-lg px-3 py-1.5 text-sm bg-surface text-content focus:outline-none focus:ring-1 focus:ring-primary"
            title="Date fin"
          />
          {(dateDebut || dateFin) && (
            <button
              onClick={() => { setDateDebut(''); setDateFin('') }}
              className="text-xs text-primary hover:underline whitespace-nowrap"
            >
              Réinitialiser dates
            </button>
          )}
        </div>

        <button
          onClick={() => refetch()}
          className="p-1.5 rounded-lg hover:bg-edge text-muted"
          title="Rafraîchir"
        >
          <RefreshCw size={15} />
        </button>

        {data && (
          <span className="text-xs text-muted">
            {displayRows.length !== rows.length
              ? `${displayRows.length} / ${data.total}`
              : `${data.total}`} passage{data.total > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-edge shadow-sm flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1.5fr_1fr_72px] gap-2 px-4 py-3 border-b border-edge bg-surface-2 text-xs font-semibold text-muted uppercase tracking-wider">
          {[
            { label: 'Site',          key: 'site.code_site'  },
            { label: 'SBC',           key: 'site.sbc'        },
            { label: 'Mois',          key: 'mois_num'        },
            { label: 'Passage',       key: 'passage_num'     },
            { label: 'Date planifiée',key: 'date_planifiee'  },
            { label: 'Statut',        key: 'statut'          },
          ].map(({ label, key }) => (
            <button
              key={key}
              onClick={() => toggleSort(key)}
              className="flex items-center gap-1 text-left hover:text-content transition-colors"
            >
              {label}
              <SortIcon colKey={key} sortKey={sortKey} sortDir={sortDir} />
            </button>
          ))}
          <span>Tendance</span>
        </div>

        {isLoading && <LoadingSpinner />}

        {!isLoading && displayRows.length === 0 && (
          <EmptyState message="Aucun passage pour ces filtres" />
        )}

        {!isLoading && displayRows.length > 0 && (
          <div
            ref={parentRef}
            className="flex-1 overflow-y-auto"
          >
            <div
              style={{ height: virtualizer.getTotalSize() }}
              className="relative"
            >
              {virtualizer.getVirtualItems().map((vRow) => {
                const p = displayRows[vRow.index]
                const isEditing = editingId === p.id

                return (
                  <div
                    key={p.id}
                    style={{
                      position: 'absolute',
                      top: vRow.start,
                      left: 0,
                      right: 0,
                      height: vRow.size,
                    }}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_1.5fr_1fr_72px] gap-2 px-4 items-center border-b border-edge text-sm hover:bg-canvas transition-colors"
                  >
                    <span className="truncate font-medium text-content" title={p.site?.nom}>
                      {p.site?.code_site} — {p.site?.nom}
                    </span>
                    <span className="text-muted">{p.site?.sbc}</span>
                    <span className="text-muted">{p.mois_nom}</span>
                    <span className="text-muted">
                      {p.passage_num}/{p.total_passages}
                    </span>
                    <span className="text-muted">{formatDate(p.date_planifiee)}</span>
                    <div className="flex items-center gap-1.5">
                      <Badge value={p.statut} label={STATUT_LABELS[p.statut]} />
                      {p.statut === 'Prevu' && (
                        <button
                          onClick={() => setEditingId(isEditing ? null : p.id)}
                          className="text-xs text-primary hover:underline"
                        >
                          Saisir
                        </button>
                      )}
                    </div>
                    <div className="flex items-center">
                      {(siteSparklines[p.site?.code_site]?.length ?? 0) >= 2 && (
                        <Sparkline
                          data={siteSparklines[p.site?.code_site]}
                          color="var(--success)"
                          w={64}
                          h={16}
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Inline edit modal */}
      {editingId && (
        <EditModal
          passage={rows.find((p) => p.id === editingId)}
          onClose={() => setEditingId(null)}
          onSave={(payload) => updateMut.mutate({ id: editingId, payload })}
          saving={updateMut.isPending}
        />
      )}
    </div>
  )
}

function EditModal({ passage, onClose, onSave, saving }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { statut: 'Fait', date_execution: '', wo_ticket: '' },
  })
  const statut = watch('statut')

  const onSubmit = (formData) => {
    const payload = { statut: formData.statut }
    if (formData.statut === 'Fait') {
      payload.date_execution = formData.date_execution
      payload.wo_ticket = formData.wo_ticket
    }
    onSave(payload)
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-base font-semibold text-content mb-1">
          Mettre à jour le statut
        </h3>
        <p className="text-sm text-muted mb-5">
          {passage?.site?.code_site} — {passage?.mois_nom} — passage {passage?.passage_num}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-1.5">Statut</label>
            <select
              {...register('statut', { required: true })}
              className="w-full border border-edge-strong rounded-lg px-3 py-2.5 text-sm bg-surface text-content focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Fait">Fait</option>
              <option value="Non_effectue">Non effectué</option>
            </select>
          </div>

          {statut === 'Fait' && (
            <>
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">
                  Date d'exécution
                </label>
                <input
                  type="date"
                  {...register('date_execution', { required: statut === 'Fait' })}
                  className="w-full border border-edge-strong rounded-lg px-3 py-2.5 text-sm bg-surface text-content focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">
                  Numéro WO <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  {...register('wo_ticket', { required: statut === 'Fait' })}
                  className="w-full border border-edge-strong rounded-lg px-3 py-2.5 text-sm bg-surface text-content focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="WO-2026-XXXXX"
                />
                {errors.wo_ticket && (
                  <p className="text-danger text-xs mt-1">Numéro WO requis</p>
                )}
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-edge-strong text-muted py-2.5 rounded-lg text-sm font-medium hover:bg-canvas"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 btn-primary py-2.5 rounded-lg text-sm font-medium disabled:opacity-60"
            >
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
