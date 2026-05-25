// ─── Style configs for the Login page ────────────────────────────────────────

export const LOGIN_THEMES = {
  dark: {
    id: 'dark',
    // Page
    bgPage:           '#090A0F',
    // Left panel
    panelGrad:        'linear-gradient(135deg,#0D0E14 0%,#12141A 100%)',
    ambNode1:         'rgba(255,204,0,0.06)',
    ambNode2:         'rgba(217,32,39,0.05)',
    gridLine:         'rgba(255,255,255,0.018)',
    vBorder:          'rgba(255,255,255,0.05)',
    // Logo area
    logoBg:           'linear-gradient(135deg,rgba(255,204,0,0.15),rgba(255,204,0,0.05))',
    logoBorder:       'rgba(255,204,0,0.2)',
    logoGlow:         '0 8px 24px -8px rgba(255,204,0,0.15)',
    logoText:         '#FFCC00',
    // Title
    titleFrom:        '#FFFFFF',
    titleTo:          '#94A3B8',
    // Badge
    badgeBg:          'rgba(255,255,255,0.03)',
    badgeBorder:      'rgba(255,255,255,0.07)',
    badgeText:        '#64748B',
    ledColor:         '#FFCC00',
    // Feature cards
    featBg:           'rgba(255,255,255,0.025)',
    featBorder:       'rgba(255,255,255,0.06)',
    featIconBg:       'rgba(255,204,0,0.08)',
    featIconBorder:   'rgba(255,204,0,0.15)',
    featIconColor:    '#FFCC00',
    featTitle:        '#F1F5F9',
    featDesc:         '#64748B',
    featSpot:         'rgba(255,204,0,0.06)',
    featSpotBorder:   'rgba(255,204,0,0.12)',
    // Footer
    footerText:       '#334155',
    footerMtn:        '#FFCC00',
    footerHw:         '#D92027',
    // Right card
    cardBg:           'rgba(255,255,255,0.018)',
    cardBorder:       'rgba(255,255,255,0.06)',
    cardShadow:       '0 32px 64px -16px rgba(0,0,0,0.85)',
    topLight:         'rgba(255,204,0,0.28)',
    ambCenter:        'rgba(255,204,0,0.025)',
    // Text
    textH1:           '#F8FAFC',
    textSub:          '#475569',
    textLabel:        '#475569',
    // Inputs
    inputBg:          '#05060A',
    inputBorder:      'rgba(255,255,255,0.07)',
    inputText:        '#E2E8F0',
    inputPlaceholder: '#334155',
    focusBorder:      'rgba(255,204,0,0.45)',
    focusShadow:      'inset 0 0 0 1px rgba(255,204,0,0.08)',
    errBorder:        'rgba(217,32,39,0.4)',
    // Error banner
    errBg:            'rgba(217,32,39,0.08)',
    errBorderBanner:  'rgba(217,32,39,0.2)',
    errText:          '#F87171',
    // Forgot link
    forgotColor:      '#FFCC00',
    // Button
    btnBg:            'linear-gradient(135deg,#FFCC00 0%,#E6B800 100%)',
    btnBorder:        'rgba(255,204,0,0.3)',
    btnShadow:        '0 4px 16px -6px rgba(255,204,0,0.15)',
    btnHoverShadow:   '0 8px 24px -6px rgba(255,204,0,0.2)',
    btnTextDark:      '#0A0B0F',
    btnBgLoading:     'rgba(255,204,0,0.12)',
    btnTextLoading:   '#FFCC00',
    btnBorderLoading: 'rgba(255,204,0,0.2)',
    // Modal
    modalBg:          'rgba(10,11,14,0.97)',
    modalBorder:      'rgba(255,255,255,0.08)',
    modalText:        '#F1F5F9',
    modalSub:         '#64748B',
  },

  light: {
    id: 'light',
    // Page
    bgPage:           '#F8FAFF',
    // Left panel (always dark navy regardless of theme)
    panelGrad:        'linear-gradient(135deg,#1E293B 0%,#0F172A 100%)',
    ambNode1:         'rgba(255,204,0,0.08)',
    ambNode2:         'rgba(217,32,39,0.04)',
    gridLine:         'rgba(255,255,255,0.04)',
    vBorder:          'rgba(255,255,255,0.08)',
    // Logo area
    logoBg:           'linear-gradient(135deg,rgba(255,204,0,0.2),rgba(255,204,0,0.08))',
    logoBorder:       'rgba(255,204,0,0.3)',
    logoGlow:         '0 8px 24px -8px rgba(255,204,0,0.1)',
    logoText:         '#B8960A',
    // Title
    titleFrom:        '#FFFFFF',
    titleTo:          '#94A3B8',
    // Badge
    badgeBg:          'rgba(255,255,255,0.08)',
    badgeBorder:      'rgba(255,255,255,0.12)',
    badgeText:        '#94A3B8',
    ledColor:         '#FFCC00',
    // Feature cards
    featBg:           'rgba(255,255,255,0.06)',
    featBorder:       'rgba(255,255,255,0.1)',
    featIconBg:       'rgba(255,204,0,0.12)',
    featIconBorder:   'rgba(255,204,0,0.22)',
    featIconColor:    '#B8960A',
    featTitle:        '#E2E8F0',
    featDesc:         '#94A3B8',
    featSpot:         'rgba(255,204,0,0.1)',
    featSpotBorder:   'rgba(255,204,0,0.18)',
    // Footer
    footerText:       '#64748B',
    footerMtn:        '#FFCC00',
    footerHw:         '#D92027',
    // Right card (light / white)
    cardBg:           '#FFFFFF',
    cardBorder:       '#E2E8F0',
    cardShadow:       '0 32px 64px -16px rgba(15,23,42,0.1)',
    topLight:         'rgba(255,204,0,0.45)',
    ambCenter:        'rgba(255,204,0,0.02)',
    // Text
    textH1:           '#0F172A',
    textSub:          '#475569',
    textLabel:        '#64748B',
    // Inputs
    inputBg:          '#F8FAFF',
    inputBorder:      '#CBD5E1',
    inputText:        '#0F172A',
    inputPlaceholder: '#94A3B8',
    focusBorder:      'rgba(255,204,0,0.6)',
    focusShadow:      'inset 0 0 0 1px rgba(255,204,0,0.1)',
    errBorder:        'rgba(217,32,39,0.4)',
    // Error banner
    errBg:            'rgba(217,32,39,0.06)',
    errBorderBanner:  'rgba(217,32,39,0.18)',
    errText:          '#DC2626',
    // Forgot link
    forgotColor:      '#B8960A',
    // Button
    btnBg:            'linear-gradient(135deg,#FFCC00 0%,#E6B800 100%)',
    btnBorder:        'rgba(255,204,0,0.35)',
    btnShadow:        '0 4px 16px -6px rgba(255,204,0,0.2)',
    btnHoverShadow:   '0 8px 24px -6px rgba(255,204,0,0.3)',
    btnTextDark:      '#0A0B0F',
    btnBgLoading:     'rgba(255,204,0,0.15)',
    btnTextLoading:   '#B8960A',
    btnBorderLoading: 'rgba(255,204,0,0.25)',
    // Modal
    modalBg:          '#FFFFFF',
    modalBorder:      '#E2E8F0',
    modalText:        '#0F172A',
    modalSub:         '#64748B',
  },
}

// ─── Choices exposed for the selector UI ─────────────────────────────────────

export const THEME_CHOICES = [
  { id: 'dark',   icon: '🌙', label: 'Sombre'  },
  { id: 'light',  icon: '☀️', label: 'Blanc'   },
  { id: 'system', icon: '💻', label: 'Système' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function systemEffective() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** Returns the stored user preference ("dark" | "light" | "system") */
export function getLoginThemePref() {
  const stored = localStorage.getItem('app_theme')
  return ['dark', 'light', 'system'].includes(stored) ? stored : 'dark'
}

/** Returns the style config object for the current effective theme */
export function getLoginTheme() {
  const pref = getLoginThemePref()
  const effective = pref === 'system' ? systemEffective() : pref
  return LOGIN_THEMES[effective] || LOGIN_THEMES.dark
}

/** Saves the user's preference and applies data-theme immediately */
export function saveLoginTheme(id) {
  if (!['dark', 'light', 'system'].includes(id)) return
  document.documentElement.classList.add('theme-transitioning')
  localStorage.setItem('app_theme', id)
  localStorage.setItem('pm_theme', id)
  const effective = id === 'system' ? systemEffective() : id
  document.documentElement.setAttribute('data-theme', effective)
  window.dispatchEvent(new CustomEvent('app-theme-changed', { detail: id }))
  setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 320)
}
