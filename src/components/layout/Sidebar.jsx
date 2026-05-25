import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Calendar, MapPin, Map, Upload, FileBarChart, Bell, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import logoImg from '../../assets/logo.png'

const NAV_ITEMS = [
  { to: '/',         icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/planning', icon: Calendar,        label: 'Planning'         },
  { to: '/sites',    icon: MapPin,          label: 'Sites'            },
  { to: '/carte',    icon: Map,             label: 'Carte'            },
  { to: '/imports',  icon: Upload,          label: 'Imports SBC'      },
  { to: '/rapports', icon: FileBarChart,    label: 'Rapports'         },
  { to: '/alerts',   icon: Bell,            label: 'Alertes'          },
]

function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
}

function NavItem({ to, icon: Icon, label, end }) {
  return (
    <NavLink to={to} end={end}>
      {({ isActive }) => (
        <div className="relative mx-2 my-[2px]">
          {isActive && (
            <span className="absolute -left-2 top-1 bottom-1 w-[3px] bg-primary rounded-r-sm pointer-events-none" />
          )}
          <span className={`flex items-center gap-3 px-3 py-[10px] rounded-[6px] text-sm font-medium transition-all ${
            isActive
              ? 'bg-sidebar-active text-sidebar-active-fg'
              : 'text-sidebar-fg hover:bg-sidebar-hover hover:text-content'
          }`}>
            <Icon
              size={16}
              className={`shrink-0 ${isActive ? 'text-sidebar-active-fg' : 'text-sidebar-fg'}`}
            />
            {label}
          </span>
        </div>
      )}
    </NavLink>
  )
}

export function Sidebar() {
  const { user, logout } = useAuth()
  const initials = getInitials(user?.nom)

  return (
    <aside
      className="fixed top-0 left-0 h-full w-60 flex flex-col z-40"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.12) 100%), var(--sidebar-bg)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-3">
        <img
          src={logoImg}
          alt="PM MTN CI"
          style={{ height: 36, width: 'auto', flexShrink: 0 }}
        />
        <div>
          <div className="text-sm font-semibold text-content leading-none">PM MTN CI</div>
          <div className="text-[10px] text-sidebar-fg mt-0.5 tracking-wide">Maintenance Préventive</div>
        </div>
      </div>

      <div className="h-px mx-4" style={{ background: 'var(--sidebar-border)' }} />

      {/* Main nav */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavItem key={to} to={to} icon={icon} label={label} end={to === '/'} />
        ))}
      </nav>

      <div className="h-px mx-4" style={{ background: 'var(--sidebar-border)' }} />

      {/* Settings + logout */}
      <div className="py-2">
        <NavItem to="/parametres" icon={Settings} label="Paramètres" />
        <div className="relative mx-2 my-[2px]">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-[10px] rounded-[6px] text-sm font-medium text-sidebar-fg hover:bg-sidebar-hover hover:text-content transition-all"
          >
            <LogOut size={16} className="shrink-0 text-sidebar-fg" />
            Déconnexion
          </button>
        </div>
      </div>

      <div className="h-px mx-4" style={{ background: 'var(--sidebar-border)' }} />

      {/* User info */}
      <div className="px-3 py-3 flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center shrink-0"
          style={{ background: 'var(--avatar-bg)', color: 'var(--avatar-fg)' }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] text-content font-medium truncate leading-none">{user?.nom}</div>
          <div className="text-[10px] text-sidebar-fg truncate mt-0.5 uppercase tracking-wider">{user?.role}</div>
        </div>
      </div>
    </aside>
  )
}
