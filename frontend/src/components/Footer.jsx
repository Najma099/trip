import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-col footer-brand">
          <span className="footer-logo">Spotter Trip Planner</span>
          <p>
            FMCSA-compliant route planning and daily log sheets for US trucking
            dispatchers. Built for property-carrying drivers on the 70-hour / 8-day schedule.
          </p>
        </div>
        <div className="footer-col">
          <h4>Product</h4>
          <Link to="/">Home</Link>
          <Link to="/plan">Plan Trip</Link>
          <Link to="/plan">Demo Route</Link>
        </div>
        <div className="footer-col">
          <h4>Compliance</h4>
          <span>49 CFR §395.3 HOS Rules</span>
          <span>§395.8 Daily Log Sheets</span>
          <span>70-hour / 8-day Cycle</span>
        </div>
        <div className="footer-col">
          <h4>Legal</h4>
          <span>For dispatch planning only</span>
          <span>Not a certified ELD device</span>
          <span>OpenRouteService routing</span>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Spotter Trip Planner</span>
        <span>Spotter AI Take-Home Project</span>
      </div>
    </footer>
  )
}
