import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GuestProvider } from './context/GuestContext'
import { ToastProvider } from './context/ToastContext'
import Header from './components/Header'
import Footer from './components/Footer'
import SkipToContent from './components/SkipToContent'
import ScrollToTop from './components/ScrollToTop'
import ErrorBoundary from './components/ErrorBoundary'
import { Skeleton } from './components/Skeleton'

const Landing = lazy(() => import('./pages/Landing'))
const PlanTrip = lazy(() => import('./pages/PlanTrip'))
const TripResults = lazy(() => import('./pages/TripResults'))
const NotFound = lazy(() => import('./pages/NotFound'))

function PageFallback() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <Skeleton className="mx-auto h-8 w-48" />
    </div>
  )
}

function App() {
  return (
    <GuestProvider>
      <ToastProvider>
        <BrowserRouter>
          <SkipToContent />
          <ScrollToTop />
          <div className="App flex min-h-screen flex-col">
            <Header />
            <main id="main-content" className="flex-1" tabIndex={-1}>
              <ErrorBoundary>
                <Suspense fallback={<PageFallback />}>
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/plan" element={<PlanTrip />} />
                    <Route path="/results/:tripId" element={<TripResults />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </ToastProvider>
    </GuestProvider>
  )
}

export default App
