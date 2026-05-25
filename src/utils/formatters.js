import { MOIS } from './constants'

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

export function formatMois(moisNum) {
  return MOIS[(moisNum || 1) - 1] || '—'
}

export function formatPercent(val) {
  if (val == null) return '—'
  return `${Number(val).toFixed(1)} %`
}

export function formatNumber(val) {
  if (val == null) return '—'
  return Number(val).toLocaleString('fr-FR')
}
