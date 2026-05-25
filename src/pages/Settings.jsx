import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { X, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTheme, THEMES } from '../hooks/useTheme'
import { useAuth } from '../hooks/useAuth'
import { changePassword } from '../api/auth'
import { resetSystem } from '../api/admin'

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, description, children }) {
  return (
    <div className="bg-surface rounded-xl border border-edge p-6">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-content">{title}</h2>
        {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )
}

// ── Change password modal ─────────────────────────────────────────────────────
function ChangePasswordModal({ onClose }) {
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm()

  const onSubmit = async (data) => {
    if (data.nouveau_mot_de_passe !== data.confirmer) {
      setError('confirmer', { message: 'Les mots de passe ne correspondent pas' })
      return
    }
    try {
      await changePassword({
        ancien_mot_de_passe: data.ancien_mot_de_passe,
        nouveau_mot_de_passe: data.nouveau_mot_de_passe,
      })
      toast.success('Mot de passe modifié avec succès')
      onClose()
    } catch (err) {
      const detail = err.response?.data?.detail
      setError('root', { message: typeof detail === 'string' ? detail : 'Erreur lors du changement de mot de passe' })
    }
  }

  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-xl w-full max-w-md p-6 modal-content">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-content">Changer le mot de passe</h3>
          <button onClick={onClose} className="text-muted hover:text-content p-1 rounded hover:bg-surface-2">
            <X size={16} />
          </button>
        </div>

        {errors.root && (
          <div className="bg-danger-light border border-danger/20 text-danger text-sm rounded-lg p-3 mb-4">
            {errors.root.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <PasswordField label="Mot de passe actuel" name="ancien_mot_de_passe"
            show={showOld} onToggle={() => setShowOld((v) => !v)}
            register={register} error={errors.ancien_mot_de_passe} rules={{ required: 'Requis' }} />
          <PasswordField label="Nouveau mot de passe" name="nouveau_mot_de_passe"
            show={showNew} onToggle={() => setShowNew((v) => !v)}
            register={register} error={errors.nouveau_mot_de_passe}
            rules={{ required: 'Requis', minLength: { value: 6, message: 'Au moins 6 caractères' } }} />
          <PasswordField label="Confirmer le nouveau mot de passe" name="confirmer"
            show={showConfirm} onToggle={() => setShowConfirm((v) => !v)}
            register={register} error={errors.confirmer} rules={{ required: 'Requis' }} />

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 btn-ghost py-2.5 rounded-lg text-sm font-medium border border-edge">
              Annuler
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 btn-primary py-2.5 rounded-lg text-sm font-medium disabled:opacity-60 justify-center">
              {isSubmitting ? 'Enregistrement…' : 'Modifier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function PasswordField({ label, name, show, onToggle, register, error, rules }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          {...register(name, rules)}
          className="input-base pr-10"
        />
        <button type="button" onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-content">
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      {error && <p className="text-danger text-xs mt-1">{error.message}</p>}
    </div>
  )
}

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        checked ? 'bg-primary' : 'bg-edge-strong'
      }`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
        checked ? 'translate-x-[18px]' : 'translate-x-1'
      }`} />
    </button>
  )
}

// ── Reset system modal (2 steps) ──────────────────────────────────────────────
function ResetModal({ onClose }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [step, setStep] = useState(1)
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReset = async () => {
    if (confirmText !== 'CONFIRMER') return
    setLoading(true)
    try {
      await resetSystem()
      queryClient.clear()
      await queryClient.invalidateQueries()
      toast.success('Système réinitialisé. Importez la liste des sites pour recommencer.', { duration: 6000 })
      onClose()
      navigate('/sites')
    } catch (err) {
      const detail = err.response?.data?.detail
      toast.error(typeof detail === 'string' ? detail : 'Erreur lors de la réinitialisation')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-xl w-full max-w-md modal-content border border-danger/30">

        {/* Step 1 — Warning */}
        {step === 1 && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-danger-light flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-danger" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-content">Réinitialiser le système</h3>
                <p className="text-xs text-muted mt-0.5">Action irréversible</p>
              </div>
            </div>

            <p className="text-sm text-content font-medium mb-3">
              Êtes-vous sûr de vouloir réinitialiser le système ?
            </p>
            <p className="text-sm text-muted mb-1">Cette action supprimera <strong className="text-content">TOUTES</strong> les données :</p>
            <ul className="text-sm text-muted space-y-0.5 mb-5 pl-4 list-disc">
              <li>Sites (665 sites)</li>
              <li>Passages et exécutions</li>
              <li>Imports SBC</li>
              <li>Alertes</li>
              <li>Utilisateurs non-admin</li>
            </ul>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 btn-ghost py-2.5 rounded-lg text-sm font-medium border border-edge"
              >
                Annuler
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-danger text-white hover:bg-danger/90 transition-colors"
              >
                Continuer
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Type confirmation */}
        {step === 2 && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-content">Confirmation requise</h3>
              <button onClick={onClose} className="text-muted hover:text-content p-1 rounded hover:bg-surface-2">
                <X size={16} />
              </button>
            </div>

            <div className="bg-danger-light border border-danger/20 rounded-lg p-3 mb-5 text-sm text-danger flex items-start gap-2">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <span>Cette action est <strong>définitive et irréversible</strong>. Toutes les données seront perdues.</span>
            </div>

            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Tapez <span className="text-danger font-mono">CONFIRMER</span> pour valider
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="CONFIRMER"
              autoFocus
              className="input-base mb-5 font-mono"
              style={{ borderColor: confirmText && confirmText !== 'CONFIRMER' ? 'var(--danger)' : undefined }}
            />

            <div className="flex gap-3">
              <button
                onClick={() => { setStep(1); setConfirmText('') }}
                className="flex-1 btn-ghost py-2.5 rounded-lg text-sm font-medium border border-edge"
              >
                Retour
              </button>
              <button
                onClick={handleReset}
                disabled={confirmText !== 'CONFIRMER' || loading}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-danger text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-danger/90"
              >
                {loading ? 'Réinitialisation…' : 'Réinitialiser'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Preferences ───────────────────────────────────────────────────────────────
const PREF_KEY = 'pm_prefs'
const defaultPrefs = { colGE: false, notifSonore: false, lignesParPage: 50 }

function loadPrefs() {
  try { return { ...defaultPrefs, ...JSON.parse(localStorage.getItem(PREF_KEY) || '{}') } }
  catch { return defaultPrefs }
}
function savePrefs(prefs) { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)) }

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Settings() {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const [showPwModal, setShowPwModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [prefs, setPrefs] = useState(loadPrefs)

  const updatePref = (key, value) => {
    const next = { ...prefs, [key]: value }
    setPrefs(next)
    savePrefs(next)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* ── Apparence ─────────────────────────────────────────────────────── */}
      <Section title="Apparence" description="Choisissez votre thème d'interface.">
        <div className="flex items-center p-1 rounded-xl bg-surface-2 border border-edge w-fit">
          {THEMES.map((t) => {
            const active = theme === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-primary text-canvas shadow-sm'
                    : 'text-muted hover:text-content'
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>
        <p className="text-xs text-muted mt-3">
          {THEMES.find((t) => t.id === theme)?.description}
        </p>
      </Section>

      {/* ── Compte ────────────────────────────────────────────────────────── */}
      <Section title="Compte" description="Informations de votre compte utilisateur.">
        <dl className="divide-y divide-edge mb-5">
          <InfoRow label="Nom" value={user?.nom} />
          <InfoRow label="Email" value={user?.email} />
          <InfoRow label="Rôle"
            value={user?.role}
            valueClass="text-xs font-semibold uppercase tracking-wider bg-primary-light text-primary rounded-full px-2.5 py-0.5"
          />
        </dl>
        <button
          onClick={() => setShowPwModal(true)}
          className="btn-primary px-4 py-2 rounded-lg text-sm"
        >
          Changer le mot de passe
        </button>
      </Section>

      {/* ── Préférences ───────────────────────────────────────────────────── */}
      <Section title="Préférences" description="Options d'affichage et comportement de l'application.">
        <div className="divide-y divide-edge">
          <PrefRow label="Afficher colonnes GE par défaut"
            description="Affiche les colonnes groupes électrogènes dans le planning à l'ouverture."
            checked={prefs.colGE} onChange={(v) => updatePref('colGE', v)} />
          <PrefRow label="Notification sonore"
            description="Émet un bip lors des alertes et notifications importantes."
            checked={prefs.notifSonore} onChange={(v) => updatePref('notifSonore', v)} />
          <div className="flex items-center justify-between py-4">
            <div className="flex-1 pr-4">
              <p className="text-sm font-medium text-content">Lignes par page</p>
              <p className="text-xs text-muted mt-0.5">Nombre de lignes affichées par défaut dans les tableaux.</p>
            </div>
            <select
              value={prefs.lignesParPage}
              onChange={(e) => updatePref('lignesParPage', Number(e.target.value))}
              className="border border-edge rounded-lg px-3 py-1.5 text-sm bg-surface text-content focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </Section>

      {/* ── Zone Danger (admin only) ───────────────────────────────────────── */}
      {user?.role === 'admin' && (
        <div className="rounded-xl border p-6 space-y-4"
          style={{
            borderColor: 'color-mix(in oklch, var(--danger) 30%, var(--border))',
            background: 'color-mix(in oklch, var(--danger) 4%, var(--bg-surface))',
          }}
        >
          <div>
            <h2 className="text-sm font-semibold text-danger flex items-center gap-2">
              <AlertTriangle size={15} />
              Zone Danger
            </h2>
            <p className="text-xs text-muted mt-1">
              Ces actions sont irréversibles. Procédez avec extrême précaution.
            </p>
          </div>

          <div className="border-t pt-4" style={{ borderColor: 'color-mix(in oklch, var(--danger) 20%, var(--border))' }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-content">Réinitialiser le système</p>
                <p className="text-xs text-muted mt-0.5">
                  Supprime tous les sites, passages, imports et alertes. Les comptes admin sont conservés.
                </p>
              </div>
              <button
                onClick={() => setShowResetModal(true)}
                className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
                style={{ background: 'var(--danger)' }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85' }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
              >
                <AlertTriangle size={14} />
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}

      {showPwModal && <ChangePasswordModal onClose={() => setShowPwModal(false)} />}
      {showResetModal && <ResetModal onClose={() => setShowResetModal(false)} />}
    </div>
  )
}

function InfoRow({ label, value, valueClass }) {
  return (
    <div className="flex items-center justify-between py-3">
      <dt className="text-xs font-semibold text-muted uppercase tracking-wider w-20 shrink-0">{label}</dt>
      <dd className={valueClass ?? 'text-sm text-content'}>{value ?? '—'}</dd>
    </div>
  )
}

function PrefRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex-1 pr-4">
        <p className="text-sm font-medium text-content">{label}</p>
        <p className="text-xs text-muted mt-0.5">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}
