import { useState, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from 'use-debounce'
import { useForm } from 'react-hook-form'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Plus, Search, Upload, RefreshCw, CheckCircle, XCircle, X, Pencil } from 'lucide-react'
import { getSites, createSite, uploadMiseAJourMensuelle } from '../api/sites'
import { EditSiteModal } from '../components/EditSiteModal'
import { useSortTable, SortIcon } from '../hooks/useSortTable.jsx'
import { Badge } from '../components/ui/Badge'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { EmptyState } from '../components/ui/EmptyState'
import { Pagination } from '../components/ui/Pagination'
import { SBC_LIST, CATEGORIES, CATEGORIE_LABELS } from '../utils/constants'
import { formatDate } from '../utils/formatters'

const PAGE_SIZE = 50
const MAJ_STORAGE_KEY = 'sites_last_maj'

// ── Côte d'Ivoire SVG map ─────────────────────────────────────────────────────
const CI_PATH = 'M150 80 L380 80 L420 100 L460 150 L470 230 L500 290 L520 340 L500 380 L460 410 L420 430 L380 440 L320 440 L260 430 L210 420 L160 410 L120 380 L100 340 L90 280 L100 220 L120 150 L150 80 Z'

function lonToX(lon) { return 390 + (lon + 3.97) * 83.9 }
function latToY(lat) { return 380 - (lat - 5.35) * 60.8 }

function SiteMapReal({ sites, onSelect }) {
  const pins = useMemo(() =>
    sites
      .filter((s) => s.latitude != null && s.longitude != null)
      .map((s) => ({
        code: s.code_site,
        x: lonToX(Number(s.longitude)),
        y: latToY(Number(s.latitude)),
        color: s.actif ? 'var(--success)' : 'var(--text-muted)',
        live: !s.actif,
      })),
    [sites]
  )

  if (pins.length === 0) return null

  return (
    <div className="bg-surface rounded-xl border border-edge overflow-hidden" style={{ height: 300, position: 'relative' }}>
      <div className="map-stage" style={{ position: 'absolute', inset: 0 }}>
        <svg className="map-svg" viewBox="0 0 600 480" preserveAspectRatio="xMidYMid meet">
          <defs>
            <pattern id="sitemap-dots" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="var(--ink-faint)" opacity="0.18" />
            </pattern>
          </defs>
          <rect width="600" height="480" fill="url(#sitemap-dots)" />
          <path className="map-country" d={CI_PATH} />
          {pins.map((p) => (
            <g
              key={p.code}
              className={`pin${p.live ? ' live' : ''}`}
              style={{ color: p.color }}
              transform={`translate(${p.x.toFixed(1)},${p.y.toFixed(1)})`}
              onClick={() => onSelect(p.code)}
            >
              <circle className="pin-halo" r="10" />
              <circle className="pin-ring" r="5" />
              <circle className="pin-core" r="2.5" />
            </g>
          ))}
          {/* North indicator */}
          <g transform="translate(32, 42)" opacity="0.55">
            <circle r="12" fill="none" stroke="var(--ink-faint)" strokeWidth="0.7" />
            <path d="M0 -8 L3 6 L0 3 L-3 6 Z" fill="var(--cyan)" />
            <text x="0" y="-15" textAnchor="middle" className="pin-label" style={{ fontSize: 8, fill: 'var(--ink-mute)' }}>N</text>
          </g>
        </svg>
        <div className="map-legend" style={{ gap: 10 }}>
          <span className="leg"><span className="leg-dot" style={{ background: 'var(--success)' }} />Actifs ({pins.filter((p) => !p.live).length})</span>
          <span className="leg"><span className="leg-dot" style={{ background: 'var(--text-muted)' }} />Inactifs ({pins.filter((p) => p.live).length})</span>
        </div>
      </div>
    </div>
  )
}

export default function Sites() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [sbc, setSbc] = useState('')
  const [skip, setSkip] = useState(0)
  const [showCreate, setShowCreate] = useState(false)
  const [showMAJ, setShowMAJ] = useState(searchParams.get('action') === 'mise-a-jour')
  const [editingSite, setEditingSite] = useState(null)

  const lastMAJ = localStorage.getItem(MAJ_STORAGE_KEY)
  const { sortKey, sortDir, toggleSort, sortData } = useSortTable()

  const [debouncedSearch] = useDebounce(search, 300)

  const params = { limit: PAGE_SIZE, skip, ...(sbc && { sbc }), ...(debouncedSearch && { search: debouncedSearch }) }

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['sites', params],
    queryFn: () => getSites(params).then((r) => r.data),
  })

  const { data: mapData } = useQuery({
    queryKey: ['sites-map'],
    queryFn: () => getSites({ limit: 2000, skip: 0 }).then((r) => r.data),
    staleTime: 300_000,
  })

  const mapSites = mapData?.items ?? []

  return (
    <div className="space-y-4">
      {/* Map */}
      {mapSites.length > 0 && (
        <SiteMapReal sites={mapSites} onSelect={(code) => navigate(`/sites/${code}`)} />
      )}
      {/* Toolbar */}
      <div className="bg-surface rounded-xl border border-edge shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSkip(0) }}
            placeholder="Rechercher un site…"
            className="w-full pl-8 pr-8 py-1.5 border border-edge-strong rounded-lg text-sm bg-surface text-content focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {isFetching && (
            <RefreshCw size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted animate-spin" />
          )}
        </div>

        <select
          value={sbc}
          onChange={(e) => { setSbc(e.target.value); setSkip(0) }}
          className="border border-edge-strong rounded-lg px-3 py-1.5 text-sm bg-surface text-content focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Tous les SBC</option>
          {SBC_LIST.map((s) => <option key={s}>{s}</option>)}
        </select>

        {/* Badge dernière mise à jour */}
        {lastMAJ && (
          <span className="text-xs text-gray-400 border border-gray-100 rounded-full px-3 py-1">
            Dernière mise à jour : {formatDate(lastMAJ)}
          </span>
        )}

        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => setShowMAJ(true)}
            className="flex items-center gap-2 bg-amber-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
          >
            <RefreshCw size={14} />
            Mise à jour mensuelle
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 btn-primary px-4 py-1.5 rounded-lg text-sm font-medium"
          >
            <Plus size={14} />
            Nouveau site
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-edge shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div style={{ minWidth: 860 }}>
            {/* Header */}
            <div className="grid grid-cols-[auto_2fr_1fr_1fr_1.5fr_1fr_1.2fr_1fr_auto] gap-2 px-4 py-3 border-b border-edge bg-surface-2 text-xs font-semibold text-muted uppercase tracking-wider">
              {[
                { label: 'Code',            key: 'code_site'      },
                { label: 'Nom',             key: 'nom'            },
                { label: 'Catégorie',       key: 'categorie'      },
                { label: 'SBC',             key: 'sbc'            },
                { label: 'Techno',          key: 'techno'         },
                { label: 'Priorité',        key: 'priorite'       },
                { label: 'Passive Handler', key: 'passive_handler'},
                { label: 'Statut',          key: 'actif'          },
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
              <span />
            </div>

            {isLoading && <LoadingSpinner />}

            {!isLoading && data?.items?.length === 0 && (
              <EmptyState message={
                debouncedSearch
                  ? `Aucun site trouvé pour "${debouncedSearch}"`
                  : "Aucun site trouvé"
              } />
            )}

            {!isLoading && sortData(data?.items ?? []).map((site) => (
              <div
                key={site.id}
                onClick={() => navigate(`/sites/${site.code_site}`)}
                className="grid grid-cols-[auto_2fr_1fr_1fr_1.5fr_1fr_1.2fr_1fr_auto] gap-2 px-4 py-3 border-b border-edge text-sm hover:bg-canvas transition-colors items-center cursor-pointer"
              >
                <span className="font-mono text-content font-medium whitespace-nowrap">{site.code_site}</span>
                <span className="text-content truncate" title={site.nom}>{site.nom}</span>
                <Badge value={site.categorie} label={CATEGORIE_LABELS[site.categorie]} />
                <span className="text-muted">{site.sbc}</span>
                <span className="text-muted text-xs truncate" title={site.techno ?? ''}>{site.techno ?? '—'}</span>
                <span className="text-muted text-xs">{site.priorite ?? '—'}</span>
                <span className="text-muted text-xs truncate" title={site.passive_handler ?? ''}>{site.passive_handler ?? '—'}</span>
                <span className={`text-xs font-medium ${site.actif ? 'text-success' : 'text-muted'}`}>
                  {site.actif ? 'Actif' : 'Inactif'}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); setEditingSite(site) }}
                  className="p-1.5 rounded-md text-muted hover:text-content hover:bg-surface-2 transition-colors"
                  title="Modifier le site"
                >
                  <Pencil size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {data && data.total > PAGE_SIZE && (
          <Pagination
            skip={skip}
            limit={PAGE_SIZE}
            total={data.total}
            onPageChange={setSkip}
          />
        )}
      </div>

      {showCreate && (
        <CreateSiteModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); refetch() }}
        />
      )}

      {showMAJ && (
        <MiseAJourModal
          onClose={() => setShowMAJ(false)}
          onSuccess={() => { setShowMAJ(false); refetch() }}
        />
      )}

      {editingSite && (
        <EditSiteModal
          site={editingSite}
          onClose={() => setEditingSite(null)}
          onSuccess={() => { setEditingSite(null); refetch() }}
        />
      )}
    </div>
  )
}

// ── Modal Nouveau site ────────────────────────────────────────────────────────

function CreateSiteModal({ onClose, onSuccess }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm()

  const onSubmit = async (data) => {
    try {
      await createSite(data)
      onSuccess()
    } catch (err) {
      const detail = err.response?.data?.detail
      setError('root', { message: typeof detail === 'string' ? detail : 'Erreur lors de la création' })
    }
  }

  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
      <div className="bg-panel rounded-xl w-full max-w-lg p-6 modal-content">
        <h3 className="text-sm font-semibold text-content mb-5">Nouveau site</h3>

        {errors.root && (
          <div className="bg-danger-light border border-danger/20 text-danger text-sm rounded-lg p-3 mb-4">
            {errors.root.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Code site *" error={errors.code_site}>
              <input
                {...register('code_site', { required: 'Requis', pattern: { value: /^CI\d{5}$/, message: 'Format CI00000' } })}
                placeholder="CI00001"
                className={inputCls}
              />
            </Field>
            <Field label="Nom *" error={errors.nom}>
              <input {...register('nom', { required: 'Requis' })} className={inputCls} />
            </Field>
            <Field label="Catégorie *" error={errors.categorie}>
              <select {...register('categorie', { required: 'Requis' })} className={inputCls}>
                <option value="">— Choisir —</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORIE_LABELS[c]}</option>)}
              </select>
            </Field>
            <Field label="SBC *" error={errors.sbc}>
              <select {...register('sbc', { required: 'Requis' })} className={inputCls}>
                <option value="">— Choisir —</option>
                {SBC_LIST.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="STO *" error={errors.sto}>
              <input {...register('sto', { required: 'Requis' })} placeholder="STO ABIDJAN NORD" className={inputCls} />
            </Field>
            <Field label="Région *" error={errors.region}>
              <input {...register('region', { required: 'Requis' })} placeholder="LAGUNES" className={inputCls} />
            </Field>
          </div>
          <ModalActions onClose={onClose} submitting={isSubmitting} submitLabel="Créer le site" />
        </form>
      </div>
    </div>
  )
}

// ── Modal Mise à jour mensuelle ───────────────────────────────────────────────

function MiseAJourModal({ onClose, onSuccess }) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

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
      const { data } = await uploadMiseAJourMensuelle(file)
      if (data && Array.isArray(data.ajoutes)) {
        localStorage.setItem(MAJ_STORAGE_KEY, data.date_mise_a_jour)
        setResult(data)
      } else {
        setError('Réponse inattendue du serveur')
      }
    } catch (err) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Le traitement a expiré (>60s). Le fichier est peut-être trop volumineux — vérifiez si la mise à jour a quand même réussi en actualisant la liste.')
      } else {
        const msg = err.response?.data?.detail
        setError(typeof msg === 'string' ? msg : `Erreur serveur${err.message ? ` : ${err.message}` : ''}`)
      }
    } finally {
      setUploading(false)
    }
  }, [])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }, [handleFile])

  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
      <div className="bg-panel rounded-xl w-full max-w-xl p-6 modal-content">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-content">Mise à jour mensuelle des sites</h3>
          <button onClick={result ? onSuccess : onClose} className="text-muted hover:text-content p-1 rounded hover:bg-surface-2">
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-muted mb-5">
          Uploadez la liste Excel des sites acceptés ce mois. Le système détectera
          automatiquement les ajouts, suppressions et modifications.
        </p>

        {!result && (
          <div
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 transition-colors ${
              dragging ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-amber-300'
            }`}
          >
            {uploading ? (
              <LoadingSpinner />
            ) : (
              <>
                <Upload size={26} className={dragging ? 'text-amber-500' : 'text-gray-400'} />
                <p className="text-sm text-gray-500">
                  {dragging ? 'Déposez le fichier ici' : 'Glissez-déposez la liste des sites'}
                </p>
                <label className="cursor-pointer bg-amber-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors">
                  Choisir un fichier .xlsx
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files[0])}
                  />
                </label>
                <p className="text-xs text-gray-400">Colonnes : code_site, nom, categorie, sbc, sto, region</p>
              </>
            )}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-danger-light border border-danger/20 text-danger rounded-lg p-3 mt-4">
            <XCircle size={16} className="shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle size={18} />
              <span className="text-sm font-semibold">Mise à jour effectuée avec succès</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <RapportBox color="text-success" label="Ajoutés / réactivés" items={result.ajoutes} />
              <RapportBox color="text-danger" label="Désactivés" items={result.supprimes} />
              <RapportBox color="text-info" label="Modifiés" items={result.modifies} />
              <div className="bg-surface-2 rounded-xl p-4">
                <p className="text-xs text-muted mb-2">Passages</p>
                <p className="text-sm text-success font-medium">+{result.passages_generes} générés</p>
                <p className="text-sm text-danger font-medium">−{result.passages_annules} annulés</p>
              </div>
            </div>

            <button
              onClick={onSuccess}
              className="w-full btn-primary py-2.5 rounded-lg text-sm font-medium"
            >
              Fermer et actualiser
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Helpers UI ────────────────────────────────────────────────────────────────

const inputCls = 'input-base'

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-muted mb-1.5">{label}</label>
      {children}
      {error && <p className="text-danger text-xs mt-1">{error.message}</p>}
    </div>
  )
}

function ModalActions({ onClose, submitting, submitLabel }) {
  return (
    <div className="flex gap-3 pt-2">
      <button type="button" onClick={onClose}
        className="flex-1 btn-ghost py-2.5 rounded-lg text-sm font-medium border border-edge">
        Annuler
      </button>
      <button type="submit" disabled={submitting}
        className="flex-1 btn-primary py-2.5 rounded-lg text-sm font-medium disabled:opacity-60 justify-center">
        {submitting ? 'En cours…' : submitLabel}
      </button>
    </div>
  )
}

function RapportBox({ color, label, items }) {
  return (
    <div className="bg-surface-2 rounded-lg p-4">
      <p className="text-xs text-muted mb-2">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{items.length}</p>
      {items.length > 0 && (
        <p className="text-xs text-muted mt-1 truncate" title={items.join(', ')}>
          {items.slice(0, 3).join(', ')}{items.length > 3 ? `… +${items.length - 3}` : ''}
        </p>
      )}
    </div>
  )
}
