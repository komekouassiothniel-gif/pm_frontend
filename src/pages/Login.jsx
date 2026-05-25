import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, AlertCircle, X, ArrowRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { THEME_CHOICES, getLoginThemePref, saveLoginTheme } from '../lib/loginTheme'
import logoImg from '../assets/logo.png'
import telecomBg from '../assets/telecom-bg.jpg'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getEffective(pref) {
  if (pref === 'system') return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  return pref
}

// ── Animation variants ────────────────────────────────────────────────────────

const SPRING = { type: 'spring', damping: 22, stiffness: 110 }

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { ...SPRING } },
}

const LEFT_STAGGER = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
}

const PILL_STAGGER = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08, delayChildren: 0.55 } },
}

const PILL_POP = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  show:   { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 15, stiffness: 220 } },
}

const FORM_ENTER = {
  hidden: { opacity: 0, x: 32 },
  show:   { opacity: 1, x: 0, transition: { type: 'spring', damping: 26, stiffness: 100, delay: 0.25 } },
}

// ── Spinner ───────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
      <path fill="currentColor" opacity="0.8" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
    </svg>
  )
}

// ── Theme selector ────────────────────────────────────────────────────────────

function ThemeSelector({ current, onChange }) {
  return (
    <div
      className="fixed bottom-5 right-5 flex items-center z-50 select-none"
      style={{
        background: 'color-mix(in oklch, var(--surface) 90%, transparent)',
        backdropFilter: 'blur(8px)',
        borderRadius: 999,
        padding: '3px',
        border: '1px solid var(--line)',
      }}
    >
      {THEME_CHOICES.map(({ id, icon, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          style={{
            padding: '4px 10px',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 500,
            fontFamily: 'var(--font-mono)',
            background: current === id ? 'var(--primary)' : 'transparent',
            color: current === id ? '#0A0B0F' : 'var(--ink-mute)',
            transition: 'background 200ms, color 200ms',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span>{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}

// ── Floating label input ──────────────────────────────────────────────────────

function FloatingInput({ label, type = 'text', registration, error, icon: Icon, rightEl, isDark, autoComplete }) {
  const [focused, setFocused] = useState(false)
  const [filled, setFilled] = useState(false)
  const isUp = focused || filled

  const borderColor = error
    ? (isDark ? 'rgba(239,68,68,0.55)' : 'var(--danger)')
    : focused
    ? 'rgba(255,204,0,0.6)'
    : (isDark ? 'rgba(255,255,255,0.1)' : 'var(--line)')

  const boxShadow = focused
    ? `0 0 0 3px ${isDark ? 'rgba(255,204,0,0.12)' : 'rgba(255,204,0,0.15)'}`
    : 'none'

  const labelColor = isUp
    ? (focused ? 'rgba(255,204,0,0.9)' : (isDark ? 'rgba(255,255,255,0.4)' : 'var(--ink-mute)'))
    : (isDark ? 'rgba(255,255,255,0.35)' : 'var(--ink-mute)')

  const iconColor = focused
    ? 'rgba(255,204,0,0.85)'
    : (isDark ? 'rgba(255,255,255,0.3)' : 'var(--ink-mute)')

  return (
    <div>
      <div style={{ position: 'relative' }}>
        {Icon && (
          <Icon size={15} style={{
            position: 'absolute', left: 16, top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none', zIndex: 1,
            color: iconColor, transition: 'color 200ms',
          }} />
        )}

        {/* Floating label */}
        <label style={{
          position: 'absolute',
          left: Icon ? 44 : 16,
          top: isUp ? 9 : '50%',
          transform: isUp ? 'translateY(0)' : 'translateY(-50%)',
          fontSize: isUp ? 10 : 14,
          fontFamily: isUp ? 'var(--font-mono)' : 'var(--font-body)',
          letterSpacing: isUp ? '0.1em' : 'normal',
          textTransform: isUp ? 'uppercase' : 'none',
          color: labelColor,
          pointerEvents: 'none',
          transition: 'top 170ms ease, font-size 170ms ease, color 170ms ease, letter-spacing 170ms ease',
          zIndex: 1,
        }}>
          {label}
        </label>

        <input
          type={type}
          autoComplete={autoComplete}
          {...registration}
          onChange={(e) => {
            setFilled(!!e.target.value)
            registration.onChange(e)
          }}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            setFocused(false)
            setFilled(!!e.target.value)
            registration.onBlur(e)
          }}
          style={{
            width: '100%',
            height: 52,
            paddingTop: isUp ? 22 : 14,
            paddingBottom: isUp ? 8 : 14,
            paddingLeft: Icon ? 44 : 16,
            paddingRight: rightEl ? 48 : 16,
            borderRadius: 12,
            fontSize: 14,
            outline: 'none',
            fontFamily: 'var(--font-body)',
            background: isDark ? 'rgba(255,255,255,0.04)' : 'var(--bg-surface-2)',
            border: `1px solid ${borderColor}`,
            color: isDark ? '#F5F7FB' : 'var(--text-primary)',
            boxShadow,
            transition: 'border-color 200ms, box-shadow 200ms',
          }}
        />

        {rightEl && (
          <div style={{
            position: 'absolute', right: 14,
            top: '50%', transform: 'translateY(-50%)', zIndex: 1,
          }}>
            {rightEl}
          </div>
        )}
      </div>

      {error && (
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          marginTop: 6, color: isDark ? '#F87171' : 'var(--danger)',
        }}>
          {error.message}
        </p>
      )}
    </div>
  )
}

// ── Forgot modal ──────────────────────────────────────────────────────────────

function ForgotModal({ onClose, isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.97 }}
        transition={{ ...SPRING }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 400,
          borderRadius: 20, padding: '2rem', position: 'relative',
          background: isDark ? 'rgba(10,11,16,0.97)' : '#FFFFFF',
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 32px 64px -16px rgba(0,0,0,0.8)',
        }}
      >
        <div style={{
          position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
          background: 'linear-gradient(90deg,transparent,rgba(255,204,0,0.5),transparent)',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: isDark ? '#F1F5F9' : '#0F172A', margin: 0 }}>
            Réinitialiser le mot de passe
          </h2>
          <button onClick={onClose} style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#64748B', background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <X size={16} />
          </button>
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 20, color: isDark ? 'rgba(255,255,255,0.45)' : '#64748B' }}>
          Contactez votre administrateur système pour réinitialiser votre mot de passe.
        </p>
        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 8, color: isDark ? 'rgba(255,255,255,0.4)' : '#64748B' }}>
          Email
        </label>
        <input
          type="email"
          placeholder="votre@email.com"
          style={{ width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 13, outline: 'none', fontFamily: 'var(--font-body)', background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFF', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`, color: isDark ? '#F1F5F9' : '#0F172A', marginBottom: 16 }}
        />
        <button disabled style={{ width: '100%', padding: '10px 0', borderRadius: 10, fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, opacity: 0.4, cursor: 'not-allowed', background: '#FFCC00', color: '#090A0F', border: 'none' }}>
          Envoyer le lien
        </button>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textAlign: 'center', marginTop: 12, color: isDark ? 'rgba(255,255,255,0.3)' : '#94A3B8' }}>
          Fonctionnalité en cours de déploiement
        </p>
      </motion.div>
    </motion.div>
  )
}

// ── Stat pill ─────────────────────────────────────────────────────────────────

function StatPill({ num, label }) {
  return (
    <motion.div
      variants={PILL_POP}
      whileHover={{ scale: 1.04 }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '10px 24px', borderRadius: 999,
        backdropFilter: 'blur(12px)',
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.15)',
        cursor: 'default',
      }}
    >
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#FFCC00', lineHeight: 1.2 }}>
        {num}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>
        {label}
      </span>
    </motion.div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Login() {
  const { login } = useAuth()

  const [pref, setPref]       = useState(() => getLoginThemePref())
  const [isDark, setIsDark]   = useState(() => getEffective(getLoginThemePref()) === 'dark')
  const [showPwd, setShowPwd] = useState(false)
  const [showModal, setModal] = useState(false)
  const [shaking, setShaking] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm()

  const handleTheme = (id) => {
    saveLoginTheme(id)
    setPref(id)
    setIsDark(getEffective(id) === 'dark')
  }

  const triggerShake = () => {
    setShaking(true)
    setTimeout(() => setShaking(false), 520)
  }

  const onSubmit = async ({ email, password }) => {
    try {
      await login(email, password)
    } catch {
      setError('root', { message: 'Email ou mot de passe incorrect' })
      triggerShake()
    }
  }

  return (
    <>
      <AnimatePresence>
        {showModal && <ForgotModal onClose={() => setModal(false)} isDark={isDark} />}
      </AnimatePresence>

      <ThemeSelector current={pref} onChange={handleTheme} />

      <div className="min-h-screen flex overflow-hidden">

        {/* ══════════════════════════════════════════════════════
            LEFT PANEL — Telecom image + content
        ══════════════════════════════════════════════════════ */}
        <div className="hidden lg:flex flex-col w-[48%] shrink-0 relative overflow-hidden">

          {/* Background image — static fade-in only, no scale */}
          <div
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${telecomBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              animation: 'imageFadeIn 0.8s ease-out forwards',
            }}
          />

          {/* Dark gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(9,10,15,0.88) 0%, rgba(9,10,15,0.60) 50%, rgba(255,204,0,0.08) 100%)',
          }} />

          {/* Micro grid */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)',
            backgroundSize: '32px 32px',
          }} />

          {/* Right edge separator */}
          <div style={{
            position: 'absolute', top: 0, right: 0, bottom: 0, width: 1,
            background: 'linear-gradient(180deg,transparent,rgba(255,255,255,0.07) 25%,rgba(255,255,255,0.07) 75%,transparent)',
          }} />

          {/* Content — top / center / bottom */}
          <div className="relative z-10 flex flex-col justify-between h-full px-12 py-12">

            {/* TOP — Logo */}
            <motion.div
              variants={FADE_UP}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.15 }}
              className="flex items-center gap-4"
            >
              <img src={logoImg} alt="PM MTN CI" style={{ height: 56, width: 'auto', flexShrink: 0 }} />
              <div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1,
                  background: 'linear-gradient(135deg,#FFFFFF 0%,#94A3B8 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  PM MTN CI
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, marginTop: 5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)' }}>
                  Maintenance Préventive Passive
                </div>
              </div>
            </motion.div>

            {/* CENTER — Tagline */}
            <motion.div
              variants={LEFT_STAGGER}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={FADE_UP} style={{ fontFamily: 'var(--font-display)', lineHeight: 1.08, letterSpacing: '-0.03em' }}>
                <div style={{ fontSize: 52, fontWeight: 800, color: '#FFFFFF' }}>Supervisez.</div>
                <div style={{
                  fontSize: 52, fontWeight: 800,
                  background: 'linear-gradient(135deg, #FFCC00 0%, #FF8800 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  Planifiez.
                </div>
                <div style={{ fontSize: 52, fontWeight: 800, color: '#FFFFFF' }}>Optimisez.</div>
              </motion.div>

              <motion.div
                variants={FADE_UP}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11, marginTop: 22,
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.42)',
                }}
              >
                665 sites · 3 SBCs · Côte d'Ivoire
              </motion.div>
            </motion.div>

            {/* BOTTOM — Stats pills */}
            <motion.div
              variants={PILL_STAGGER}
              initial="hidden"
              animate="show"
              className="flex items-center gap-3"
            >
              <StatPill num="665" label="Sites" />
              <StatPill num="3"   label="SBCs" />
              <StatPill num="2026" label="Année" />
            </motion.div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            RIGHT PANEL
        ══════════════════════════════════════════════════════ */}
        <div
          className="flex-1 flex items-center justify-center px-6 py-10 relative"
          style={{
            background: isDark ? '#090A0F' : '#F4F6FB',
            transition: 'background 300ms ease',
          }}
        >
          {/* Ambient glow */}
          <div style={{
            position: 'absolute', width: 560, height: 560, pointerEvents: 'none',
            background: 'radial-gradient(circle,rgba(255,204,0,0.05) 0%,transparent 65%)',
          }} />

          <motion.div
            variants={FORM_ENTER}
            initial="hidden"
            animate="show"
            className="relative w-full max-w-[420px]"
          >
            {/* Login card */}
            <motion.form
              onSubmit={handleSubmit(onSubmit)}
              animate={shaking ? { x: [0, -8, 8, -6, 6, -3, 3, 0], transition: { duration: 0.5 } } : {}}
              style={{
                position: 'relative',
                borderRadius: 24,
                padding: '48px 40px',
                background: isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
                backdropFilter: isDark ? 'blur(24px)' : 'none',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.07)',
                boxShadow: isDark
                  ? '0 32px 64px -16px rgba(0,0,0,0.65)'
                  : '0 24px 64px -16px rgba(15,23,42,0.12)',
              }}
            >
              {/* Top highlight line */}
              <div style={{
                position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
                background: 'linear-gradient(90deg,transparent,rgba(255,204,0,0.65),transparent)',
              }} />

              {/* Mobile logo */}
              <div className="flex lg:hidden items-center gap-3 mb-8">
                <img src={logoImg} alt="PM MTN CI" style={{ height: 28, width: 'auto' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: isDark ? '#F5F7FB' : '#0F172A' }}>
                  PM MTN CI
                </span>
              </div>

              {/* Heading */}
              <div style={{ marginBottom: 32 }}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10, fontWeight: 600, letterSpacing: '0.15em',
                  textTransform: 'uppercase', color: '#FFCC00', marginBottom: 12,
                }}>
                  — Authentification
                </div>
                <h1 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 28, fontWeight: 700,
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  letterSpacing: '-0.025em', margin: '0 0 8px',
                }}>
                  Connexion
                </h1>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, margin: 0, color: isDark ? 'rgba(255,255,255,0.42)' : '#64748B' }}>
                  Accès réservé aux équipes autorisées
                </p>
              </div>

              {/* Error banner */}
              <AnimatePresence>
                {errors.root && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                    style={{ marginBottom: 20 }}
                  >
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', borderRadius: 10, fontSize: 13,
                      fontFamily: 'var(--font-body)',
                      background: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(220,38,38,0.06)',
                      border: `1px solid ${isDark ? 'rgba(239,68,68,0.28)' : 'rgba(220,38,38,0.2)'}`,
                      color: isDark ? '#F87171' : '#DC2626',
                    }}>
                      <AlertCircle size={14} style={{ flexShrink: 0 }} />
                      {errors.root.message}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <FloatingInput
                  label="Email"
                  type="email"
                  autoComplete="email"
                  registration={register('email', { required: 'Email requis' })}
                  error={errors.email}
                  icon={Mail}
                  isDark={isDark}
                />

                <FloatingInput
                  label="Mot de passe"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  registration={register('password', { required: 'Mot de passe requis' })}
                  error={errors.password}
                  icon={Lock}
                  isDark={isDark}
                  rightEl={
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPwd((v) => !v)}
                      aria-label={showPwd ? 'Masquer' : 'Afficher'}
                      style={{
                        color: isDark ? 'rgba(255,255,255,0.35)' : 'var(--ink-mute)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: 2, display: 'flex', transition: 'color 200ms',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = isDark ? 'rgba(255,255,255,0.7)' : 'var(--text-primary)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = isDark ? 'rgba(255,255,255,0.35)' : 'var(--ink-mute)' }}
                    >
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                />
              </div>

              {/* Forgot link */}
              <div style={{ textAlign: 'right', marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setModal(true)}
                  style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11,
                    color: '#FFCC00', background: 'none', border: 'none',
                    padding: 0, cursor: 'pointer', transition: 'opacity 200ms',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.65' }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
                >
                  Mot de passe oublié ?
                </button>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={!isSubmitting ? {
                  y: -2,
                  boxShadow: '0 10px 28px rgba(255,204,0,0.38)',
                  filter: 'brightness(1.08)',
                } : {}}
                whileTap={!isSubmitting ? { y: 0, scale: 0.99 } : {}}
                transition={{ type: 'spring', damping: 18, stiffness: 200 }}
                style={{
                  marginTop: 24,
                  width: '100%', height: 52,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  borderRadius: 12,
                  fontFamily: 'var(--font-display)',
                  fontSize: 15, fontWeight: 700,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  background: isSubmitting ? (isDark ? 'rgba(255,255,255,0.07)' : '#F1F5F9') : '#FFCC00',
                  color: isSubmitting ? (isDark ? 'rgba(255,255,255,0.25)' : '#94A3B8') : '#090A0F',
                  border: 'none',
                  boxShadow: isSubmitting ? 'none' : '0 4px 18px -4px rgba(255,204,0,0.28)',
                  transition: 'background 300ms, color 300ms, box-shadow 300ms',
                }}
              >
                {isSubmitting
                  ? <><Spinner /><span>Connexion en cours…</span></>
                  : <><span>Se connecter</span><ArrowRight size={16} /></>
                }
              </motion.button>
            </motion.form>

            {/* Footer label */}
            <div style={{
              textAlign: 'center', marginTop: 20,
              fontFamily: 'var(--font-mono)', fontSize: 10,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: isDark ? 'rgba(255,255,255,0.18)' : 'var(--text-muted)',
            }}>
              MTN Côte d'Ivoire — Projet PM 2026
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
