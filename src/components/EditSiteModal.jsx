import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet'
import { X, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import { updateSite } from '../api/sites'
import { CATEGORIES, CATEGORIE_LABELS, SBC_LIST } from '../utils/constants'

const TYPOLOGIES = ['Greenfield', 'Rooftop', 'Indoor', 'Rural', 'Hub']
const PRIORITES = ['Priority', 'Normal']

// ── Mini-map preview ──────────────────────────────────────────────────────────

function RecenterMap({ lat, lng }) {
  const map = useMap()
  useEffect(() => { map.setView([lat, lng], 13) }, [lat, lng, map])
  return null
}

function MapPreview({ lat, lng }) {
  const latN = Number(lat)
  const lngN = Number(lng)
  const valid = !isNaN(latN) && !isNaN(lngN) && Math.abs(latN) <= 90 && Math.abs(lngN) <= 180 && (latN !== 0 || lngN !== 0)

  if (!valid) {
    return (
      <div
        className="h-36 rounded-lg border border-edge flex items-center justify-center"
        style={{ background: 'var(--bg-surface-2)' }}
      >
        <div className="flex items-center gap-2 text-muted text-xs">
          <MapPin size={13} />
          Entrez des coordonnées valides
        </div>
      </div>
    )
  }

  return (
    <div className="h-36 rounded-lg overflow-hidden border border-edge">
      <MapContainer
        center={[latN, lngN]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <RecenterMap lat={latN} lng={lngN} />
        <CircleMarker
          center={[latN, lngN]}
          radius={9}
          pathOptions={{ fillColor: '#FFCC00', color: '#0f172a', weight: 2, fillOpacity: 0.9 }}
        />
      </MapContainer>
    </div>
  )
}

// ── Form helpers ──────────────────────────────────────────────────────────────

function FormSection({ title, children }) {
  return (
    <div>
      <h4 className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-3 pb-1.5 border-b border-edge">
        {title}
      </h4>
      {children}
    </div>
  )
}

function Field({ label, children, colSpan }) {
  return (
    <div className={colSpan === 2 ? 'col-span-2' : ''}>
      <label className="block text-xs font-medium text-muted mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function FieldErr({ msg }) {
  return <p className="text-danger text-xs mt-1">{msg}</p>
}

// ── Main component ────────────────────────────────────────────────────────────

export function EditSiteModal({ site, onClose, onSuccess }) {
  const queryClient = useQueryClient()
  const [previewLat, setPreviewLat] = useState(site.latitude ?? '')
  const [previewLng, setPreviewLng] = useState(site.longitude ?? '')

  const { register, handleSubmit, watch, formState: { errors, isSubmitting }, setError } = useForm({
    defaultValues: {
      nom:              site.nom ?? '',
      sbc:              site.sbc?.value ?? site.sbc ?? '',
      sto:              site.sto ?? '',
      region:           site.region ?? '',
      passive_handler:  site.passive_handler ?? '',
      categorie:        site.categorie?.value ?? site.categorie ?? '',
      techno:           site.techno ?? '',
      typologie:        site.typologie ?? '',
      priorite:         site.priorite ?? '',
      latitude:         site.latitude ?? '',
      longitude:        site.longitude ?? '',
      date_acceptance:  site.date_acceptance ?? '',
      date_handover:    site.date_handover ?? '',
    },
  })

  const watchLat = watch('latitude')
  const watchLng = watch('longitude')
  const watchCat = watch('categorie')
  const hasGE    = watchCat === 'GRID_GEN' || watchCat === 'GEN_ONLY'

  // Update mini-map preview as lat/lng change (debounced via render cycle)
  useEffect(() => {
    const lat = parseFloat(watchLat)
    const lng = parseFloat(watchLng)
    if (!isNaN(lat) && !isNaN(lng)) { setPreviewLat(lat); setPreviewLng(lng) }
  }, [watchLat, watchLng])

  const onSubmit = async (formData) => {
    // Convert empty strings to null
    const payload = Object.fromEntries(
      Object.entries(formData).map(([k, v]) => [k, v === '' ? null : v])
    )
    if (payload.latitude  !== null) payload.latitude  = Number(payload.latitude)
    if (payload.longitude !== null) payload.longitude = Number(payload.longitude)

    const oldCat = site.categorie?.value ?? site.categorie
    const catChanged = payload.categorie !== null && payload.categorie !== oldCat

    try {
      await updateSite(site.code_site, payload)

      if (catChanged) {
        toast('Catégorie modifiée — les passages futurs 2026 ont été recalculés.', {
          duration: 7000,
          style: { background: 'var(--warning)', color: '#0f172a' },
        })
      }

      toast.success(`Site ${site.nom} mis à jour`)
      queryClient.invalidateQueries({ queryKey: ['sites'] })
      queryClient.invalidateQueries({ queryKey: ['sites-map-full'] })
      queryClient.invalidateQueries({ queryKey: ['site-detail', site.code_site] })
      onSuccess?.()
      onClose()
    } catch (err) {
      const detail = err.response?.data?.detail
      setError('root', { message: typeof detail === 'string' ? detail : 'Erreur lors de la mise à jour' })
    }
  }

  return (
    <div className="fixed inset-0 modal-overlay flex items-start justify-center z-[1000] p-4 overflow-y-auto">
      <div className="bg-panel rounded-xl w-full max-w-2xl modal-content my-4">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-edge">
          <div>
            <h3 className="text-sm font-semibold text-content">Modifier le site</h3>
            <p className="text-[11px] text-muted mt-0.5 font-mono">{site.code_site}</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-content p-1 rounded hover:bg-surface-2 transition-colors">
            <X size={16} />
          </button>
        </div>

        {errors.root && (
          <div className="mx-6 mt-4 bg-danger-light border border-danger/20 text-danger text-sm rounded-lg p-3">
            {errors.root.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-5 space-y-6 max-h-[72vh] overflow-y-auto">

            {/* ── Identification ─────────────────────────────────── */}
            <FormSection title="Identification">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nom du site *" colSpan={2}>
                  <input {...register('nom', { required: 'Requis' })} className="input-base" />
                  {errors.nom && <FieldErr msg={errors.nom.message} />}
                </Field>

                <Field label="Code site">
                  <input
                    value={site.code_site}
                    disabled
                    className="input-base opacity-50 cursor-not-allowed font-mono text-sm"
                  />
                </Field>

                <Field label="SBC">
                  <select {...register('sbc')} className="input-base">
                    {SBC_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>

                <Field label="STO">
                  <input {...register('sto')} className="input-base" />
                </Field>

                <Field label="Région">
                  <input {...register('region')} className="input-base" />
                </Field>

                <Field label="Passive Handler" colSpan={2}>
                  <input {...register('passive_handler')} className="input-base" />
                </Field>
              </div>
            </FormSection>

            {/* ── Configuration technique ────────────────────────── */}
            <FormSection title="Configuration technique">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Type alimentation">
                  <select {...register('categorie')} className="input-base">
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{CATEGORIE_LABELS[c]}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Techno">
                  <input {...register('techno')} placeholder="G900+D1800+U900+L800" className="input-base" />
                </Field>

                <Field label="Typologie">
                  <select {...register('typologie')} className="input-base">
                    <option value="">—</option>
                    {TYPOLOGIES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>

                <Field label="Priorité">
                  <select {...register('priorite')} className="input-base">
                    <option value="">—</option>
                    {PRIORITES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
              </div>

              {/* Category-change warning */}
              {watchCat !== (site.categorie?.value ?? site.categorie) && (
                <div className="mt-3 flex items-start gap-2 text-xs text-warning bg-warning-light border border-warning/20 rounded-lg px-3 py-2">
                  <span className="shrink-0 mt-0.5">⚠</span>
                  <span>
                    Attention : le changement de catégorie affectera la fréquence de passage.
                    Les passages futurs 2026 seront recalculés automatiquement.
                  </span>
                </div>
              )}
            </FormSection>

            {/* ── Groupe Électrogène (GE présent) ───────────────── */}
            {hasGE && (
              <FormSection title="Groupe Électrogène">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Marque GE">
                    <input className="input-base opacity-50 cursor-not-allowed" disabled placeholder="Non disponible" />
                  </Field>
                  <Field label="Puissance (KVA)">
                    <input className="input-base opacity-50 cursor-not-allowed" disabled placeholder="Non disponible" />
                  </Field>
                </div>
                <p className="text-[11px] text-muted mt-2">
                  Ces champs ne sont pas encore stockés en base — ils seront importés via la mise à jour mensuelle.
                </p>
              </FormSection>
            )}

            {/* ── Localisation GPS ──────────────────────────────── */}
            <FormSection title="Localisation GPS">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Latitude">
                  <input
                    {...register('latitude', {
                      validate: (v) =>
                        v === '' ||
                        v === null ||
                        (!isNaN(Number(v)) && Number(v) >= -90 && Number(v) <= 90) ||
                        'Valeur entre −90 et 90',
                    })}
                    type="number"
                    step="any"
                    className="input-base font-mono"
                  />
                  {errors.latitude && <FieldErr msg={errors.latitude.message} />}
                </Field>

                <Field label="Longitude">
                  <input
                    {...register('longitude', {
                      validate: (v) =>
                        v === '' ||
                        v === null ||
                        (!isNaN(Number(v)) && Number(v) >= -180 && Number(v) <= 180) ||
                        'Valeur entre −180 et 180',
                    })}
                    type="number"
                    step="any"
                    className="input-base font-mono"
                  />
                  {errors.longitude && <FieldErr msg={errors.longitude.message} />}
                </Field>
              </div>

              <div className="mt-3">
                <MapPreview lat={previewLat} lng={previewLng} />
              </div>
            </FormSection>

            {/* ── Dates ─────────────────────────────────────────── */}
            <FormSection title="Dates">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Date d'acceptance">
                  <input {...register('date_acceptance')} type="date" className="input-base" />
                </Field>
                <Field label="Date Handover">
                  <input {...register('date_handover')} type="date" className="input-base" />
                </Field>
              </div>
            </FormSection>

          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-edge flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-ghost py-2.5 rounded-lg text-sm font-medium border border-edge"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 btn-primary py-2.5 rounded-lg text-sm font-medium disabled:opacity-60 justify-center"
            >
              {isSubmitting ? 'Enregistrement…' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
