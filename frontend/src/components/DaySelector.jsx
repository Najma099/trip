import './DaySelector.css'

export default function DaySelector({ dailyLogs = [], selectedDate, onSelect }) {
  if (!dailyLogs.length) return null

  return (
    <div className="day-selector" role="tablist" aria-label="Trip days">
      <div className="day-selector__track">
        {dailyLogs.map((day) => {
          const d = new Date(day.date + 'T12:00:00')
          const dayNum = d.getDate()
          const weekday = d.toLocaleDateString('en-US', { weekday: 'short' })
          const isActive = day.date === selectedDate

          return (
            <button
              key={day.date}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`day-pill ${isActive ? 'day-pill--active' : ''}`}
              onClick={() => onSelect(day.date)}
            >
              <span className="day-pill__num">{dayNum}</span>
              <span className="day-pill__week">{weekday}</span>
              <span className="day-pill__hours">{day.total_driving_hours}h drive</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
