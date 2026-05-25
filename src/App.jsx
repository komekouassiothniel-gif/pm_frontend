import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './hooks/useAuth'
import { ThemeProvider } from './hooks/useTheme'
import { Layout } from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Planning from './pages/Planning'
import Sites from './pages/Sites'
import SiteDetail from './pages/SiteDetail'
import Imports from './pages/Imports'
import Rapports from './pages/Rapports'
import Alerts from './pages/Alerts'
import Settings from './pages/Settings'
import MapSites from './pages/MapSites'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="planning" element={<Planning />} />
                <Route path="sites" element={<Sites />} />
                <Route path="sites/:code_site" element={<SiteDetail />} />
                <Route path="imports" element={<Imports />} />
                <Route path="rapports" element={<Rapports />} />
                <Route path="alerts" element={<Alerts />} />
                <Route path="carte" element={<MapSites />} />
                <Route path="parametres" element={<Settings />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: { fontSize: '13px', borderRadius: '10px' },
            success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
            error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
