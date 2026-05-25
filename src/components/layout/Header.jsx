import { useState } from 'react'
import { Bell } from 'lucide-react'
import { useAlertCount } from '../../hooks/useAlerts'
import { useAuth } from '../../hooks/useAuth'
import { AlertPanel } from '../ui/AlertPanel'
import { LiveClock } from '../noc'

function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
}

export function Header({ title }) {
  const [showAlerts, setShowAlerts] = useState(false)
  const { data: count = 0 } = useAlertCount()
  const { user } = useAuth()

  return (
    <header className="fixed top-0 left-60 right-0 h-14 bg-surface border-b border-edge flex items-center justify-between px-6 z-30">
      <h1 className="text-[13px] font-medium text-secondary">{title}</h1>

      <div className="flex items-center gap-3">
        <LiveClock />
        <div className="relative">
          <button
            onClick={() => setShowAlerts((s) => !s)}
            className="relative w-8 h-8 rounded-full flex items-center justify-center text-muted hover:bg-surface-2 hover:text-content"
            aria-label="Alertes"
          >
            <Bell size={17} />
            {count > 0 && (
              <span className="absolute top-0.5 right-0.5 h-4 w-4 bg-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </button>
          {showAlerts && <AlertPanel onClose={() => setShowAlerts(false)} />}
        </div>

        <div
          className="w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center ml-1 shrink-0 cursor-default"
          style={{ background: 'var(--avatar-bg)', color: 'var(--avatar-fg)' }}
          title={user?.nom}
        >
          {getInitials(user?.nom)}
        </div>
      </div>
    </header>
  )
}
