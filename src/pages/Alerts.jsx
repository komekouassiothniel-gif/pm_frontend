import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { X, CheckCircle, ArrowRight, AlertTriangle, AlertCircle, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import { getAlerts, updateAlert, closeAlert } from '../api/alerts'
import { useSortTable, SortIcon } from '../hooks/useSortTable.jsx'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { EmptyState } from '../components/ui/EmptyState'
import { Pagination } from '../components/ui/Pagination'
import { NIVEAUX_ALERTE, STATUTS_ALERTE, NIVEAU_LABELS } from '../utils/constants'
import { formatDate } from '../utils/formatters'

const SEVERITY_MAP = {
  critique:      'critical',
  avertissement: 'warn',
  information:   'info',
}

const SEVERITY_ICONS = {
  critique:      <AlertTriangle size={16} />,
  avertissement: <AlertCircle size={16} />,
  information:   <Info size={16} />,
}

const PAGE_SIZE = 50

export default function Alerts() {
  const [niveau, setNiveau] = useState('')
  const [statut, setStatut] = useState('')
  const [skip, setSkip] = useState(0)
  const qc = useQueryClient()
  const { sortKey, sortDir, toggleSort, sortData } = useSortTable('created_at', 'desc')

  const params = {
    limit: PAGE_SIZE,
    skip,
    ...(niveau && { niveau }),
    ...(statut && { statut }),
  }

  const { data, isLoading } = useQuery({
    queryKey: ['alerts', params],
    queryFn: () => getAlerts(params).then((r) => r.data),
    refetchInterval: 60_000,
  })

  const navigate = useNavigate()

  const closeMut = useMutation({
    mutationFn: closeAlert,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alerts'] })
      qc.invalidateQueries({ queryKey: ['alertCount'] })
      toast.success('Alerte fermée')
    },
    onError: () => toast.error('Erreur lors de la fermeture'),
  })

  const takeMut = useMutation({
    mutationFn: (id) => updateAlert(id, { statut: 'prise_en_charge' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alerts'] })
      toast.success('Alerte prise en charge')
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-surface rounded-xl border border-edge shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <select
          value={niveau}
          onChange={(e) => { setNiveau(e.target.value); setSkip(0) }}
          className="border border-edge-strong rounded-lg px-3 py-1.5 text-sm bg-surface text-content focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Tous les niveaux</option>
          {NIVEAUX_ALERTE.map((n) => (
            <option key={n} value={n}>{NIVEAU_LABELS[n]}</option>
          ))}
        </select>

        <select
          value={statut}
          onChange={(e) => { setStatut(e.target.value); setSkip(0) }}
          className="border border-edge-strong rounded-lg px-3 py-1.5 text-sm bg-surface text-content focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Hors fermées</option>
          {STATUTS_ALERTE.map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>

        {data && (
          <span className="ml-auto text-xs text-muted">
            {data.total} alerte{data.total > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Alert list */}
      <div className="bg-surface rounded-xl border border-edge shadow-sm overflow-hidden">
        {/* Sort header */}
        <div className="grid grid-cols-[3fr_1fr_1fr_80px] px-4 py-3 border-b border-edge bg-surface-2 text-xs font-semibold text-muted uppercase tracking-wider">
          {[
            { label: 'Alerte',  key: 'message'     },
            { label: 'Type',    key: 'type_alerte' },
            { label: 'Date',    key: 'created_at'  },
          ].map(({ label, key }) => (
            <button key={key} onClick={() => toggleSort(key)} className="flex items-center gap-1 text-left hover:text-content transition-colors">
              {label}
              <SortIcon colKey={key} sortKey={sortKey} sortDir={sortDir} />
            </button>
          ))}
          <span>Actions</span>
        </div>

        {isLoading && <LoadingSpinner />}

        {!isLoading && data?.items?.length === 0 && (
          <EmptyState message="Aucune alerte active" />
        )}

        {!isLoading && (
          <div className="alert-list px-2 py-1">
            {sortData(data?.items ?? []).map((alert) => {
              const severity = SEVERITY_MAP[alert.niveau] || 'info'
              return (
                <div key={alert.id} className="alert-item">
                  <div className={`alert-icon ${severity}`}>
                    {SEVERITY_ICONS[alert.niveau] || <Info size={16} />}
                  </div>

                  <div className="alert-body">
                    <div className="alert-title line-clamp-2">{alert.message}</div>
                    <div className="alert-meta">
                      <span>{alert.type_alerte?.replace(/_/g, ' ')}</span>
                      <span className="sep">·</span>
                      <span>{NIVEAU_LABELS[alert.niveau]}</span>
                      {alert.statut && <><span className="sep">·</span><span>{alert.statut.replace(/_/g, ' ')}</span></>}
                    </div>
                    {alert.type_alerte === 'mise_a_jour_sites' && alert.statut !== 'fermee' && (
                      <button
                        onClick={() => navigate('/sites?action=mise-a-jour')}
                        className="mt-1 flex items-center gap-1 text-xs text-warning hover:opacity-80 font-medium"
                      >
                        <ArrowRight size={12} />
                        Faire la mise à jour
                      </button>
                    )}
                  </div>

                  <div className="alert-time">
                    <div>{formatDate(alert.created_at?.split('T')[0])}</div>
                    <span className={`severity ${severity}`}>
                      {severity === 'critical' ? 'P1' : severity === 'warn' ? 'P2' : 'INFO'}
                    </span>
                  </div>

                  <div className="flex gap-2 items-start pt-1 shrink-0 pl-2">
                    {alert.statut === 'nouvelle' && (
                      <button onClick={() => takeMut.mutate(alert.id)} className="text-warning hover:opacity-70" title="Prendre en charge">
                        <CheckCircle size={15} />
                      </button>
                    )}
                    <button onClick={() => closeMut.mutate(alert.id)} className="text-muted hover:text-danger" title="Fermer">
                      <X size={15} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {data && data.total > PAGE_SIZE && (
          <Pagination skip={skip} limit={PAGE_SIZE} total={data.total} onPageChange={setSkip} />
        )}
      </div>
    </div>
  )
}
