import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GuestProvider } from './context/GuestContext'
import Header from './components/Header'
import Footer from './components/Footer'
import LandingPage from './pages/LandingPage'
import TripFormPage from './pages/TripFormPage'
import ResultsPage from './pages/ResultsPage'
import './App.css'

function AppLayout() {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/plan" element={<TripFormPage />} />
          <Route path="/results/:tripId" element={<ResultsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <GuestProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </GuestProvider>
  )
}

export default App
