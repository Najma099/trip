import LogSheetGrid from './LogSheetGrid'
import DaySelector from './DaySelector'

export default function LogSheet({ dailyLogs = [], selectedDate, onSelectDate }) {
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
    <section className="log-sheets card">
      <div className="log-sheets-header">
        <h3>Daily Log Sheet</h3>
        <p className="log-sheets-sub">FMCSA §395.8 duty status grid — select a day below</p>
      </div>

      <DaySelector
        dailyLogs={dailyLogs}
        selectedDate={activeDate}
        onSelect={onSelectDate}
      />

      <div className="log-sheet-day active-day">
        <LogSheetGrid segments={activeDay.segments} date={activeDay.date} />
        <div className="log-totals">
          <div className="log-total-item">
            <span className="log-total-label">Driving</span>
            <span className="log-total-value">{activeDay.total_driving_hours}h</span>
          </div>
          <div className="log-total-item">
            <span className="log-total-label">On Duty</span>
            <span className="log-total-value">{activeDay.total_on_duty_hours}h</span>
          </div>
          <div className="log-total-item">
            <span className="log-total-label">Off Duty</span>
            <span className="log-total-value">{activeDay.total_off_duty_hours ?? '—'}h</span>
          </div>
        </div>
      </div>
    </section>
  )
}
