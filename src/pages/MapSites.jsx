import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import MarkerClusterGroup from '@changey/react-leaflet-markercluster'
import '@changey/react-leaflet-markercluster/dist/styles.min.css'
import { Search } from 'lucide-react'
import { getSites } from '../api/sites'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { EditSiteModal } from '../components/EditSiteModal'
import { CATEGORIES, CATEGORIE_LABELS, SBC_LIST } from '../utils/constants'
import { useTheme } from '../hooks/useTheme'

// ── Category marker colors ─────────────────────────────────────────────────────

const CAT_COLOR = {
  GRID_ONLY:  '#3B82F6',
  GRID_GEN:   '#22C55E',
  SOLAR_ONLY: '#FFCC00',
  GEN_ONLY:   '#F97316',
}

// ── Tile layer switches with theme ────────────────────────────────────────────

function ThemedTiles({ isDark }) {
  return isDark ? (
    <TileLayer
      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      attribution='&copy; <a href="https://carto.com/">CARTO</a>'
    />
  ) : (
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
    />
  )
}

// ── Popup content (plain HTML inside Leaflet popup) ───────────────────────────

function SitePopupContent({ site, onNavigate, onEdit }) {
  const color = CAT_COLOR[site.categorie] ?? '#888'
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minWidth: 210, maxWidth: 260 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 2 }}>
        {site.nom}
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#94a3b8', marginBottom: 10 }}>
        {site.code_site}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
        <span style={{ background: color, color: '#fff', borderRadius: 4, padding: '2px 7px', fontSize: 10, fontWeight: 600 }}>
          {CATEGORIE_LABELS[site.categorie] ?? site.categorie}
        </span>
        <span style={{ background: '#f1f5f9', color: '#475569', borderRadius: 4, padding: '2px 7px', fontSize: 10 }}>
          {site.sbc}
        </span>
        {site.priorite && (
          <span style={{ background: '#fef3c7', color: '#92400e', borderRadius: 4, padding: '2px 7px', fontSize: 10 }}>
            {site.priorite}
          </span>
        )}
      </div>

      <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.8 }}>
        <div><b>STO :</b> {site.sto}</div>
        <div><b>Région :</b> {site.region}</div>
        {site.techno && <div><b>Techno :</b> {site.techno}</div>}
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
        <button
          onClick={onNavigate}
          style={{
            flex: 1, padding: '6px 0', borderRadius: 6,
            border: '1px solid #e2e8f0', background: '#f8fafc',
            color: '#1e293b', fontSize: 11, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Voir le détail
        </button>
        <button
          onClick={onEdit}
          style={{
            flex: 1, padding: '6px 0', borderRadius: 6,
            border: 'none', background: '#FFCC00',
            color: '#0f172a', fontSize: 11, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Modifier
        </button>
      </div>
    </div>
  )
}

// ── Map page ──────────────────────────────────────────────────────────────────

export default function MapSites() {
  const navigate    = useNavigate()
  const queryClient = useQueryClient()
  const { theme }   = useTheme()
  const isDark      = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const [search,     setSearch]     = useState('')
  const [selectedSbc, setSelectedSbc] = useState('')
  const [activeCats, setActiveCats] = useState(() => new Set(CATEGORIES))
  const [editSite,   setEditSite]   = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['sites-map-full'],
    queryFn:  () => getSites({ limit: 1000, skip: 0 }).then((r) => r.data),
    staleTime: 120_000,
  })

  const allSites = data?.items ?? []

  const withCoords = allSites.filter((s) => s.latitude != null && s.longitude != null)

  const filtered = withCoords.filter((s) => {
    if (!activeCats.has(s.categorie)) return false
    if (selectedSbc && s.sbc !== selectedSbc) return false
    if (search) {
      const q = search.toLowerCase()
      return s.code_site.toLowerCase().includes(q) || s.nom.toLowerCase().includes(q)
    }
    return true
  })

  const toggleCat = (cat) => {
    setActiveCats((prev) => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  if (isLoading) return <LoadingSpinner size="lg" />

  return (
    <div className="flex flex-col gap-4" style={{ height: 'calc(100vh - 96px)' }}>

      {/* ── Toolbar ──────────────────────────────────────────── */}
      <div className="bg-surface rounded-xl border border-edge p-3 flex flex-wrap gap-3 items-center shrink-0">

        {/* Search */}
        <div className="relative min-w-52">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un site…"
            className="pl-8 pr-3 py-1.5 border border-edge-strong rounded-lg text-sm bg-surface text-content focus:outline-none focus:ring-1 focus:ring-primary w-full"
          />
        </div>

        {/* SBC */}
        <select
          value={selectedSbc}
          onChange={(e) => setSelectedSbc(e.target.value)}
          className="border border-edge-strong rounded-lg px-3 py-1.5 text-sm bg-surface text-content focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Tous les SBC</option>
          {SBC_LIST.map((s) => <option key={s}>{s}</option>)}
        </select>

        {/* Category toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map((cat) => {
            const active = activeCats.has(cat)
            return (
              <button
                key={cat}
                onClick={() => toggleCat(cat)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all"
                style={active
                  ? { background: CAT_COLOR[cat], borderColor: CAT_COLOR[cat], color: '#fff' }
                  : { borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-surface-2)' }
                }
              >
                <span className="w-2 h-2 rounded-full" style={{ background: active ? 'rgba(255,255,255,0.7)' : CAT_COLOR[cat] }} />
                {CATEGORIE_LABELS[cat]}
              </button>
            )
          })}
        </div>

        {/* Stats */}
        <div className="ml-auto text-xs text-muted font-mono whitespace-nowrap">
          <span className="text-content font-semibold">{filtered.length}</span> affichés
          {' · '}
          <span>{withCoords.length} géolocalisés</span>
          {' · '}
          <span>{allSites.length} total</span>
        </div>
      </div>

      {/* ── Map ──────────────────────────────────────────────── */}
      <div className="flex-1 rounded-xl overflow-hidden border border-edge" style={{ minHeight: 500 }}>
        <div style={{ height: 'calc(100vh - 56px)', width: '100%' }}>
        <MapContainer
          center={[7.54, -5.55]}
          zoom={7}
          style={{ height: '100%', width: '100%', minHeight: 500 }}
        >
          <ThemedTiles isDark={isDark} />

          <MarkerClusterGroup chunkedLoading>
            {filtered.map((site) => (
              <CircleMarker
                key={site.code_site}
                center={[site.latitude, site.longitude]}
                radius={8}
                pathOptions={{
                  fillColor: CAT_COLOR[site.categorie] ?? '#888',
                  color: '#fff',
                  weight: 2,
                  opacity: 1,
                  fillOpacity: 0.88,
                }}
              >
                <Popup maxWidth={280} closeButton={false}>
                  <SitePopupContent
                    site={site}
                    onNavigate={() => navigate(`/sites/${site.code_site}`)}
                    onEdit={() => setEditSite(site)}
                  />
                </Popup>
              </CircleMarker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
        </div>
      </div>

      {/* ── Legend ───────────────────────────────────────────── */}
      <div className="flex items-center gap-5 flex-wrap shrink-0">
        {CATEGORIES.map((cat) => (
          <span key={cat} className="flex items-center gap-1.5 text-xs text-muted">
            <span className="w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ background: CAT_COLOR[cat] }} />
            {CATEGORIE_LABELS[cat]}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-xs text-muted ml-auto">
          Clusters actifs au zoom ≤ 10
        </span>
      </div>

      {/* ── Edit modal ───────────────────────────────────────── */}
      {editSite && (
        <EditSiteModal
          site={editSite}
          onClose={() => setEditSite(null)}
          onSuccess={() => {
            setEditSite(null)
            queryClient.invalidateQueries({ queryKey: ['sites-map-full'] })
          }}
        />
      )}
    </div>
  )
}
