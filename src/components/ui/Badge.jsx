const VARIANTS = {
  /* Planning statuts */
  Prevu:          'bg-info-light    text-info',
  Fait:           'bg-success-light text-success',
  Non_effectue:   'bg-danger-light  text-danger',
  En_retard:      'bg-warning-light text-warning',

  /* Site catégories */
  GRID_GEN:   'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  GRID_ONLY:  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  GEN_ONLY:   'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  SOLAR_ONLY: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',

  /* Alertes niveaux */
  information:   'bg-info-light    text-info',
  avertissement: 'bg-warning-light text-warning',
  critique:      'bg-danger-light  text-danger',

  /* Alertes statuts */
  nouvelle:       'bg-info-light    text-info',
  prise_en_charge:'bg-warning-light text-warning',
  fermee:         'bg-surface-2     text-muted',

  /* Rôles */
  admin:   'bg-primary-light text-primary',
  sbc:     'bg-success-light text-success',
  lecture: 'bg-surface-2     text-muted',
}

export function Badge({ value, label }) {
  const cls = VARIANTS[value] ?? 'bg-surface-2 text-muted'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label ?? value}
    </span>
  )
}
