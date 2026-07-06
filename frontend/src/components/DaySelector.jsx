import './DaySelector.css'

export default function DaySelector({ dailyLogs = [], selectedDate, onSelect }) {
  if (!dailyLogs.length) return null

  return (
    <div className="day-selector">
      <div className="day-selector-track">
        {dailyLogs.map((day) => {
          const d = new Date(day.date + 'T12:00:00')
          const dayNum = d.getDate()
          const weekday = d.toLocaleDateString('en-US', { weekday: 'short' })
          const isActive = day.date === selectedDate

          return (
            <button
              key={day.date}
              type="button"
              className={`day-pill ${isActive ? 'active' : ''}`}
              onClick={() => onSelect(day.date)}
            >
              <span className="day-pill-num">{dayNum}</span>
              <span className="day-pill-week">{weekday}</span>
              <span className="day-pill-hours">{day.total_driving_hours}h drive</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
