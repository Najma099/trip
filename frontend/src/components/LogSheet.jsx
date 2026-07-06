import LogSheetGrid from './LogSheetGrid'
import './LogSheet.css'

export default function LogSheet({ dailyLogs = [], selectedDate }) {
  if (!dailyLogs.length) {
    return (
      <div className="card log-sheet-empty">
        <p>No daily log sheets available for this trip.</p>
      </div>
    )
  }

  const activeDate = selectedDate || dailyLogs[0].date
  const activeDay = dailyLogs.find((d) => d.date === activeDate) || dailyLogs[0]

  return (
    <section className="card log-sheet">
      <header className="log-sheet__header">
        <h2 className="section-title">FMCSA Daily Log Sheet</h2>
        <p className="section-sub">§395.8 duty status grid for selected day</p>
      </header>

      <div key={activeDate} className="log-sheet__content fade-switch">
        <LogSheetGrid segments={activeDay.segments} date={activeDay.date} />
        <div className="log-sheet__totals">
          <div className="log-sheet__total">
            <span className="log-sheet__total-label">Driving</span>
            <span className="log-sheet__total-value">{activeDay.total_driving_hours}h</span>
          </div>
          <div className="log-sheet__total">
            <span className="log-sheet__total-label">On Duty</span>
            <span className="log-sheet__total-value">{activeDay.total_on_duty_hours}h</span>
          </div>
          <div className="log-sheet__total">
            <span className="log-sheet__total-label">Off Duty</span>
            <span className="log-sheet__total-value">{activeDay.total_off_duty_hours ?? '—'}h</span>
          </div>
        </div>
      </div>
    </section>
  )
}
