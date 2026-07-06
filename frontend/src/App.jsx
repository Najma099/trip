import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GuestProvider } from './context/GuestContext'
import Header from './components/Header'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import PlanTrip from './pages/PlanTrip'
import TripResults from './pages/TripResults'

function App() {
  return (
    <GuestProvider>
      <BrowserRouter>
        <div className="App flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/plan" element={<PlanTrip />} />
              <Route path="/results/:tripId" element={<TripResults />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </GuestProvider>
  )
}

export default App
