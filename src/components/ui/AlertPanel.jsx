import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { getAlerts, closeAlert } from '../../api/alerts'
import { Badge } from './Badge'

export function AlertPanel({ onClose }) {
  const qc = useQueryClient()

  const { data } = useQuery({
    queryKey: ['alertsPanel'],
    queryFn: () => getAlerts({ limit: 20 }).then((r) => r.data),
  })

  const closeMut = useMutation({
    mutationFn: closeAlert,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alertsPanel'] })
      qc.invalidateQueries({ queryKey: ['alertCount'] })
    },
  })

  return (
    <div className="absolute right-0 top-12 w-96 bg-surface border border-edge-strong rounded-xl shadow-2xl z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-edge">
        <h3 className="text-sm font-semibold text-content">
          Alertes {data?.total != null && `(${data.total})`}
        </h3>
        <button
          onClick={onClose}
          className="text-muted hover:text-content p-1 rounded hover:bg-edge transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-edge">
        {data?.items?.length === 0 && (
          <p className="text-sm text-muted text-center py-10">Aucune alerte active</p>
        )}
        {data?.items?.map((alert) => (
          <div key={alert.id} className="px-4 py-3 hover:bg-canvas transition-colors">
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge value={alert.niveau} />
                  <span className="text-xs text-muted truncate">{alert.type_alerte}</span>
                </div>
                <p className="text-xs text-content line-clamp-2">{alert.message}</p>
              </div>
              <button
                onClick={() => closeMut.mutate(alert.id)}
                className="text-muted hover:text-danger shrink-0 mt-0.5 transition-colors"
                title="Fermer"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-edge px-4 py-2.5">
        <a href="/alerts" onClick={onClose} className="text-xs text-primary hover:underline">
          Voir toutes les alertes →
        </a>
      </div>
    </div>
  )
}
