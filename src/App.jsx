import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'
import CookieBanner from './components/CookieBanner'
import Home from './pages/Home' // eager: first paint

// every other page is code-split → small initial bundle
const Features = lazy(() => import('./pages/Features'))
const Portfolio = lazy(() => import('./pages/Portfolio'))
const About = lazy(() => import('./pages/About'))
const Academy = lazy(() => import('./pages/Academy'))
const Contact = lazy(() => import('./pages/Contact'))
const Quote = lazy(() => import('./pages/Quote'))
const Admin = lazy(() => import('./pages/Admin'))
const Auth = lazy(() => import('./pages/Auth'))
const Success = lazy(() => import('./pages/Success'))
const NotFound = lazy(() => import('./pages/NotFound'))

export default function App() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <Routes>
        <Route path="auth" element={<Auth />} />
        <Route path="success" element={<Success />} />
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="features" element={<Features />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="quote" element={<RequireAuth><Quote /></RequireAuth>} />
          <Route path="academy" element={<RequireAuth from="academy"><Academy /></RequireAuth>} />
          <Route path="admin" element={<Admin />} />
          {/* old links keep working */}
          <Route path="login" element={<Navigate to="/auth" replace />} />
          <Route path="signup" element={<Navigate to="/auth?mode=signup" replace />} />
          <Route path="services" element={<Navigate to="/features" replace />} />
          <Route path="solutions" element={<Navigate to="/features" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <CookieBanner />
    </Suspense>
  )
}
