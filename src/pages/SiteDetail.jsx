import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft, MapPin, Zap, Calendar, CheckCircle2,
  Clock, AlertTriangle, TrendingUp, Wrench, ChevronDown, Pencil,
} from 'lucide-react'
import { getSiteDetail } from '../api/sites'
import { EditSiteModal } from '../components/EditSiteModal'
import { Badge } from '../components/ui/Badge'
import { KpiCard } from '../components/ui/KpiCard'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { CATEGORIE_LABELS } from '../utils/constants'
import { formatDate, formatPercent } from '../utils/formatters'

const TABS = ['Historique des passages', 'Snags récurrents']

const ANNEES = [2025, 2026, 2027]

export default function SiteDetail() {
  const { code_site } = useParams()
  const navigate = useNavigate()
  const [annee, setAnnee] = useState(2026)
  const [activeTab, setActiveTab] = useState(0)
  const [showEdit, setShowEdit] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['site-detail', code_site, annee],
    queryFn: () => getSiteDetail(code_site, annee).then((r) => r.data),
  })

  if (isLoading) return <LoadingSpinner size="lg" />

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted text-sm">Site introuvable ou erreur de chargement.</p>
        <button onClick={() => navigate('/sites')} className="btn-ghost text-sm px-4 py-2 rounded-lg border border-edge">
          ← Retour aux sites
        </button>
      </div>
    )
  }

  const { stats, historique, snags_recurrents } = data

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="bg-surface rounded-xl border border-edge shadow-sm p-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => navigate('/sites')}
          className="flex items-center gap-1.5 text-muted hover:text-content text-sm transition-colors shrink-0"
        >
          <ArrowLeft size={15} />
          Sites
        </button>

        <span className="text-edge-strong">·</span>

        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className="font-mono text-sm font-semibold text-content">{data.code_site}</span>
          <span className="text-content font-medium truncate">{data.nom}</span>
          <Badge value={data.categorie.value ?? data.categorie} label={CATEGORIE_LABELS[data.categorie.value ?? data.categorie]} />
          <Badge value={data.sbc.value ?? data.sbc} label={data.sbc.value ?? data.sbc} />
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${data.actif ? 'bg-success-light text-success' : 'bg-surface-2 text-muted'}`}>
            {data.actif ? 'Actif' : 'Inactif'}
          </span>
        </div>

        {/* Modifier */}
        <button
          onClick={() => setShowEdit(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-edge text-muted hover:text-content hover:border-primary transition-colors shrink-0"
        >
          <Pencil size={13} />
          Modifier
        </button>

        {/* Sélecteur d'année */}
        <div className="relative shrink-0">
          <select
            value={annee}
            onChange={(e) => setAnnee(Number(e.target.value))}
            className="appearance-none border border-edge-strong rounded-lg pl-3 pr-7 py-1.5 text-sm bg-surface text-content focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            {ANNEES.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard
          label="Passages planifiés"
          value={stats.total_passages_annee}
          icon={Calendar}
          colorClass="text-primary"
        />
        <KpiCard
          label="Passages faits"
          value={stats.passages_faits}
          icon={CheckCircle2}
          colorClass="text-success"
          sub={stats.dernier_passage ? `Dernier : ${formatDate(stats.dernier_passage)}` : null}
        />
        <KpiCard
          label="En retard"
          value={stats.passages_en_retard}
          icon={AlertTriangle}
          colorClass={stats.passages_en_retard > 0 ? 'text-danger' : 'text-muted'}
        />
        <KpiCard
          label="À venir"
          value={stats.passages_a_venir}
          icon={Clock}
          colorClass="text-info"
          sub={stats.prochain_passage ? `Prochain : ${formatDate(stats.prochain_passage)}` : null}
        />
        <KpiCard
          label="Taux de réalisation"
          value={formatPercent(stats.taux_realisation * 100)}
          icon={TrendingUp}
          colorClass={stats.taux_realisation >= 0.8 ? 'text-success' : stats.taux_realisation >= 0.5 ? 'text-warning' : 'text-danger'}
        />
      </div>

      {/* ── Infos site ── */}
      <div className="bg-surface rounded-xl border border-edge shadow-sm p-4">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Informations du site</h3>
        <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3 text-sm">
          <InfoRow icon={MapPin} label="STO" value={data.sto} />
          <InfoRow icon={MapPin} label="Région" value={data.region} />
          <InfoRow icon={Zap} label="Alimentation" value={data.type_alimentation} />
          <InfoRow icon={Calendar} label="Cycle" value={data.cycle} />
          <InfoRow icon={Calendar} label="Date acceptance" value={formatDate(data.date_acceptance)} />
          <InfoRow icon={Wrench} label="Marque GE" value={data.marque_ge} />
          <InfoRow icon={Wrench} label="Puissance GE" value={data.puissance_ge ? `${data.puissance_ge} KVA` : null} />
          <InfoRow icon={Calendar} label="Créé le" value={formatDate(data.created_at?.split('T')[0])} />
        </dl>
      </div>

      {/* ── Onglets ── */}
      <div className="bg-surface rounded-xl border border-edge shadow-sm overflow-hidden">
        <div className="flex border-b border-edge">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-5 py-3 text-sm font-medium transition-colors ${
                activeTab === i
                  ? 'text-primary border-b-2 border-primary -mb-px bg-surface'
                  : 'text-muted hover:text-content'
              }`}
            >
              {tab}
              {i === 0 && <span className="ml-2 text-xs bg-surface-2 text-muted px-1.5 py-0.5 rounded-full">{historique.length}</span>}
              {i === 1 && snags_recurrents.length > 0 && (
                <span className="ml-2 text-xs bg-danger-light text-danger px-1.5 py-0.5 rounded-full">{snags_recurrents.length}</span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 0 && <HistoriqueTab rows={historique} />}
        {activeTab === 1 && <SnagsTab rows={snags_recurrents} />}
      </div>

      {showEdit && (
        <EditSiteModal
          site={data}
          onClose={() => setShowEdit(false)}
          onSuccess={() => setShowEdit(false)}
        />
      )}
    </div>
  )
}

// ── Onglet Historique ─────────────────────────────────────────────────────────

function HistoriqueTab({ rows }) {
  if (!rows.length) {
    return <p className="text-center text-muted text-sm py-10">Aucun passage planifié pour cette année.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface-2 text-xs font-semibold text-muted uppercase tracking-wider">
            <th className="px-4 py-3 text-left">Mois</th>
            <th className="px-4 py-3 text-left">N°</th>
            <th className="px-4 py-3 text-left">Date planifiée</th>
            <th className="px-4 py-3 text-left">Statut</th>
            <th className="px-4 py-3 text-left">Exécution</th>
            <th className="px-4 py-3 text-left">WO / Ticket</th>
            <th className="px-4 py-3 text-left">Carburant</th>
            <th className="px-4 py-3 text-left">CH GE</th>
            <th className="px-4 py-3 text-left">Observations</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id} className="border-t border-edge hover:bg-canvas transition-colors">
              <td className="px-4 py-2.5 font-medium text-content">{p.mois}</td>
              <td className="px-4 py-2.5 text-muted font-mono">{p.passage_num}</td>
              <td className="px-4 py-2.5 text-muted">{formatDate(p.date_planifiee)}</td>
              <td className="px-4 py-2.5">
                <Badge value={p.statut} label={STATUT_LABELS[p.statut] ?? p.statut} />
              </td>
              <td className="px-4 py-2.5 text-muted">{formatDate(p.date_execution)}</td>
              <td className="px-4 py-2.5 font-mono text-xs text-content">{p.wo_ticket || '—'}</td>
              <td className="px-4 py-2.5 text-muted">{p.niveau_carburant != null ? `${p.niveau_carburant} %` : '—'}</td>
              <td className="px-4 py-2.5 text-muted">{p.ch_ge != null ? `${p.ch_ge} %` : '—'}</td>
              <td className="px-4 py-2.5 text-muted max-w-xs truncate" title={p.observations ?? ''}>
                {p.observations || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Onglet Snags récurrents ───────────────────────────────────────────────────

function SnagsTab({ rows }) {
  if (!rows.length) {
    return <p className="text-center text-muted text-sm py-10">Aucun snag récurrent détecté.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface-2 text-xs font-semibold text-muted uppercase tracking-wider">
            <th className="px-4 py-3 text-left">Description</th>
            <th className="px-4 py-3 text-left w-24">Occurrences</th>
            <th className="px-4 py-3 text-left w-36">Dernière date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s, i) => (
            <tr key={i} className="border-t border-edge hover:bg-canvas transition-colors">
              <td className="px-4 py-2.5 text-content">{s.description}</td>
              <td className="px-4 py-2.5">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                  s.count >= 3 ? 'bg-danger-light text-danger' : 'bg-warning-light text-warning'
                }`}>
                  {s.count}×
                </span>
              </td>
              <td className="px-4 py-2.5 text-muted">{formatDate(s.derniere_date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={13} className="text-muted mt-0.5 shrink-0" />
      <div>
        <dt className="text-xs text-muted">{label}</dt>
        <dd className="text-content font-medium">{value || '—'}</dd>
      </div>
    </div>
  )
}

const STATUT_LABELS = {
  Prevu: 'Prévu',
  Fait: 'Fait',
  Non_effectue: 'Non effectué',
  En_retard: 'En retard',
}
