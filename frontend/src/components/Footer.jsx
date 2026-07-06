import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="logo-icon">⬡</span>
          <span>Spotter Trip Planner</span>
          <p className="footer-tagline">FMCSA-compliant routing & daily log sheets for US trucking dispatchers.</p>
        </div>
        <div className="footer-links">
          <div>
            <h4>Product</h4>
            <Link to="/plan">Plan Trip</Link>
            <Link to="/">Home</Link>
          </div>
          <div>
            <h4>Compliance</h4>
            <span>HOS 70-hour / 8-day</span>
            <span>§395.8 Log Sheets</span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Spotter Trip Planner</span>
          <span>Built for Spotter AI take-home</span>
        </div>
      </div>
    </footer>
  )
}
