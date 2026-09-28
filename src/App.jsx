import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import Login from './pages/Login'

// Code-split all pages — loads only what's needed per route
const Dashboard   = lazy(() => import('./pages/Dashboard'))
const Money       = lazy(() => import('./pages/Money'))
const Expenses    = lazy(() => import('./pages/Expenses'))
const Experiences = lazy(() => import('./pages/Experiences'))
const Goals       = lazy(() => import('./pages/Goals'))
const Notes       = lazy(() => import('./pages/Notes'))
const Reports     = lazy(() => import('./pages/Reports'))
const Settings    = lazy(() => import('./pages/Settings'))

function PageLoader() {
  return (
    <div className="flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: 16 }}>
      <div className="spinner" style={{ width: 48, height: 48 }} />
      <p style={{ color: 'var(--text-muted)', fontSize: 12, letterSpacing: 2 }}>INITIALIZING SYSTEM...</p>
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/" replace /> : children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
        <Route path="money"       element={<Suspense fallback={<PageLoader />}><Money /></Suspense>} />
        <Route path="expenses"    element={<Suspense fallback={<PageLoader />}><Expenses /></Suspense>} />
        <Route path="experiences" element={<Suspense fallback={<PageLoader />}><Experiences /></Suspense>} />
        <Route path="goals"       element={<Suspense fallback={<PageLoader />}><Goals /></Suspense>} />
        <Route path="notes"       element={<Suspense fallback={<PageLoader />}><Notes /></Suspense>} />
        <Route path="reports"     element={<Suspense fallback={<PageLoader />}><Reports /></Suspense>} />
        <Route path="settings"    element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
