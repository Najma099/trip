import LogSheetGrid from './LogSheetGrid'

export default function LogSheet({ dailyLogs = [] }) {
  if (!dailyLogs.length) {
    return (
      <div className="card log-sheet-empty">
        <p>No daily log sheets available for this trip.</p>
      </div>
    )
  }

  return (
    <section className="log-sheets">
      <h3>Daily Log Sheets</h3>
      {dailyLogs.map((day) => (
        <div key={day.date} className="card log-sheet-day">
          <LogSheetGrid segments={day.segments} date={day.date} />
          <div className="log-totals">
            <span>Driving: {day.total_driving_hours}h</span>
            <span>On Duty: {day.total_on_duty_hours}h</span>
          </div>
        </div>
      ))}
    </section>
  )
}
