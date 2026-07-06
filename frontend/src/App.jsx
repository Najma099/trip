import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GuestProvider } from './context/GuestContext'
import LandingPage from './pages/LandingPage'
import TripFormPage from './pages/TripFormPage'
import ResultsPage from './pages/ResultsPage'
import './App.css'

function App() {
  return (
    <GuestProvider>
      <BrowserRouter>
        <div className="app">
          <header className="app-header">
            <div className="brand">
              <span className="brand-mark">◆</span>
              <span className="brand-name">Spotter Trip Planner</span>
            </div>
            <p className="brand-tagline">FMCSA-compliant route & daily log sheets</p>
          </header>
          <main className="app-main">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/plan" element={<TripFormPage />} />
              <Route path="/results/:tripId" element={<ResultsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </GuestProvider>
  )
}

export default App
