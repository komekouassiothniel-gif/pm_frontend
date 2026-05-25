import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { uploadExcel, getImports, deleteImport } from '../api/imports'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { formatDate } from '../utils/formatters'
import { useSortTable, SortIcon } from '../hooks/useSortTable.jsx'

export default function Imports() {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const qc = useQueryClient()

  const { sortKey, sortDir, toggleSort, sortData } = useSortTable('date_import', 'desc')

  const { data: history, refetch } = useQuery({
    queryKey: ['imports'],
    queryFn: () => getImports({ limit: 50 }).then((r) => r.data),
  })

  const deleteMut = useMutation({
    mutationFn: deleteImport,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['imports'] })
      qc.invalidateQueries({ queryKey: ['planning'] })
      qc.invalidateQueries({ queryKey: ['planningStats'] })
      setConfirmId(null)
      toast.success('Import annulé — passages réinitialisés à "Prévu"')
    },
    onError: () => toast.error("Erreur lors de l'annulation"),
  })

  const handleFile = useCallback(async (file) => {
    if (!file) return
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('Format invalide — seuls les fichiers .xlsx sont acceptés')
      return
    }
    setError(null)
    setResult(null)
    setUploading(true)
    try {
      const { data } = await uploadExcel(file)
      setResult(data)
      refetch()
      toast.success('Import SBC effectué avec succès')
    } catch (err) {
      const msg = err.response?.data?.detail
      const errMsg = typeof msg === 'string' ? msg : "Erreur lors de l'import"
      setError(errMsg)
      toast.error(errMsg)
    } finally {
      setUploading(false)
    }
  }, [refetch])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  const sortedHistory = sortData(history?.items ?? [])

  const HISTORY_COLS = [
    { label: 'Date', key: 'date_import' },
    { label: 'Fichier', key: 'nom_fichier' },
    { label: 'Intégrés', key: 'nb_integres' },
    { label: 'Doublons', key: 'nb_doublons' },
    { label: 'Introuvables', key: 'nb_non_trouves' },
    { label: 'Statut', key: 'statut' },
  ]

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`bg-surface rounded-xl border-2 border-dashed transition-colors p-10 flex flex-col items-center justify-center gap-3 ${
          dragging ? 'border-primary bg-primary-light' : 'border-edge hover:border-primary/40'
        }`}
      >
        {uploading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className={`p-4 rounded-full ${dragging ? 'bg-primary-light' : 'bg-surface-2'}`}>
              <Upload size={28} className={dragging ? 'text-primary' : 'text-muted'} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-content">
                {dragging ? 'Déposez le fichier ici' : 'Glissez-déposez votre fichier Excel'}
              </p>
              <p className="text-xs text-muted mt-1">ou</p>
            </div>
            <label className="cursor-pointer btn-primary px-5 py-2 rounded-lg text-sm">
              Choisir un fichier .xlsx
              <input
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </label>
            <p className="text-xs text-muted mt-1">
              Colonnes requises : Site ID, ASP, Executed date, Work Order Number
            </p>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-danger-light border border-danger/20 text-danger rounded-lg p-4">
          <XCircle size={18} className="shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-surface rounded-xl border border-edge p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={18} className="text-success" />
            <h3 className="text-sm font-semibold text-content">Résultat de l'import</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatBox label="Intégrés" value={result.integres} color="text-success" />
            <StatBox label="Doublons ignorés" value={result.doublons} color="text-warning" />
            <StatBox label="Non trouvés" value={result.non_trouves} color="text-danger" />
            <StatBox label="Dépassement max" value={result.max_depasse ?? 0} color="text-muted" />
          </div>
          {result.fichier && (
            <p className="text-xs text-muted mt-3">Fichier : {result.fichier}</p>
          )}
        </div>
      )}

      {/* History */}
      <div className="bg-surface rounded-xl border border-edge overflow-hidden">
        <div className="px-5 py-4 border-b border-edge bg-surface-2">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
            Historique des imports
          </h3>
        </div>

        {/* Header row */}
        <div className="grid grid-cols-[1.2fr_2fr_1fr_1fr_1.2fr_1fr_auto] gap-2 px-5 py-2.5 bg-surface-2 border-b border-edge text-xs font-semibold text-muted uppercase tracking-wider">
          {HISTORY_COLS.map(({ label, key }) => (
            <button
              key={key}
              onClick={() => toggleSort(key)}
              className="flex items-center gap-1 text-left hover:text-content transition-colors"
            >
              {label}
              <SortIcon colKey={key} sortKey={sortKey} sortDir={sortDir} />
            </button>
          ))}
          <span className="w-8" />
        </div>

        <div className="divide-y divide-edge">
          {!history && <LoadingSpinner />}
          {history?.items?.length === 0 && (
            <p className="text-sm text-muted text-center py-10">Aucun import enregistré</p>
          )}
          {sortedHistory.map((imp) => (
            <div
              key={imp.id}
              className="grid grid-cols-[1.2fr_2fr_1fr_1fr_1.2fr_1fr_auto] gap-2 items-center px-5 py-3 hover:bg-canvas transition-colors"
            >
              <span className="text-xs text-muted whitespace-nowrap">
                {formatDate(imp.date_import?.split('T')[0])}
              </span>
              <div className="flex items-center gap-2 min-w-0">
                <FileSpreadsheet size={14} className="text-muted shrink-0" />
                <span className="text-sm font-medium text-content truncate">{imp.nom_fichier}</span>
              </div>
              <span className="text-success text-sm tabular-nums">{imp.nb_integres ?? 0}</span>
              <span className={`text-sm tabular-nums ${(imp.nb_doublons ?? 0) > 0 ? 'text-warning' : 'text-muted'}`}>
                {imp.nb_doublons ?? 0}
              </span>
              <span className={`text-sm tabular-nums ${(imp.nb_non_trouves ?? 0) > 0 ? 'text-danger' : 'text-muted'}`}>
                {imp.nb_non_trouves ?? 0}
              </span>
              <StatusIcon statut={imp.statut} />
              <button
                onClick={() => setConfirmId(imp.id)}
                className="p-1.5 rounded-lg hover:bg-danger-light text-muted hover:text-danger transition-colors"
                title="Annuler cet import"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm modal */}
      {confirmId !== null && (
        <ConfirmModal
          onConfirm={() => deleteMut.mutate(confirmId)}
          onCancel={() => setConfirmId(null)}
          loading={deleteMut.isPending}
        />
      )}
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────────

function StatBox({ label, value, color }) {
  return (
    <div className="bg-surface-2 rounded-lg p-4 text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-muted mt-1">{label}</div>
    </div>
  )
}

function StatusIcon({ statut }) {
  if (statut === 'succes') return <CheckCircle size={16} className="text-success" />
  if (statut === 'partiel') return <AlertCircle size={16} className="text-warning" />
  return <XCircle size={16} className="text-danger" />
}

function ConfirmModal({ onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-xl shadow-2xl w-full max-w-sm p-6">
        <h3 className="text-base font-semibold text-content mb-2">
          Supprimer cet import ?
        </h3>
        <p className="text-sm text-muted mb-6">
          Les passages intégrés lors de cet import seront réinitialisés à "Prévu"
          et leurs exécutions supprimées. Cette action est irréversible.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-edge-strong text-muted py-2.5 rounded-lg text-sm font-medium hover:bg-canvas transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-60 transition-colors"
          >
            {loading ? 'Suppression…' : 'Confirmer la suppression'}
          </button>
        </div>
      </div>
    </div>
  )
}
