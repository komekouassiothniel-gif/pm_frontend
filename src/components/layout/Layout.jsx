import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { ChatAssistant } from '../ChatAssistant'

const PAGE_TITLES = {
  '/': 'Tableau de bord',
  '/planning': 'Planning',
  '/sites': 'Sites',
  '/imports': 'Imports SBC',
  '/rapports': 'Rapports',
  '/alerts': 'Alertes',
  '/parametres': 'Paramètres',
}

export function Layout() {
  const { user, loading } = useAuth()
  const { pathname } = useLocation()

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />
  if (!user) return <Navigate to="/login" replace />

  return (
    <div
      className="min-h-screen"
      style={{
        background: `
          radial-gradient(ellipse at top left,    var(--glow, rgba(255,204,0,0.04)) 0%, transparent 50%),
          radial-gradient(ellipse at bottom right, rgba(217,32,39,0.04)            0%, transparent 50%),
          var(--bg-app)
        `,
      }}
    >
      <Sidebar />
      <div className="ml-64 min-h-screen flex flex-col">
        <Header title={PAGE_TITLES[pathname] ?? 'PM MTN CI'} />
        <main className="pt-14 p-6 flex-1">
          <div key={pathname} className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
      <ChatAssistant />
    </div>
  )
}
