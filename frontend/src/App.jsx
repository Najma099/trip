import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GuestProvider } from './context/GuestContext'
import LandingPage from './pages/LandingPage'
import './App.css'

function PlanPlaceholder() {
  return (
    <section className="card">
      <h2>Trip planner loading…</h2>
    </section>
  )
}

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
              <Route path="/plan" element={<PlanPlaceholder />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </GuestProvider>
  )
}

export default App
