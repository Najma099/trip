import { useMemo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

const COLORS = {
  Driving: '#1e3a8a',
  'On Duty': '#0ea5e9',
  'Off Duty': '#cbd5e1',
}

function LegendRow({ name, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} />
          <span className="text-sm font-medium text-[color:var(--sp-text)]">{name}</span>
        </div>
        <div className="flex items-baseline gap-2 tabular-nums">
          <span className="font-sora text-lg font-semibold text-[color:var(--sp-text)]">{value.toFixed(1)}h</span>
          <span className="font-mono text-[11px] text-[color:var(--sp-text-tertiary)]">{pct}%</span>
        </div>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--sp-bg)]">
        <div
          className="h-full transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

export default function DailyCharts({ day }) {
  const driving = day?.total_driving_hours || 0
  const onDuty = day?.total_on_duty_hours || 0
  const offDuty = day?.total_off_duty_hours || 0
  const total = driving + onDuty + offDuty

  const chartData = useMemo(
    () =>
      [
        { name: 'Driving', value: driving },
        { name: 'On Duty', value: onDuty },
        { name: 'Off Duty', value: offDuty },
      ].filter((d) => d.value > 0),
    [driving, onDuty, offDuty, day?.date]
  )

  if (!day) return null

  return (
    <div
      data-testid="chart-donut-card"
      className="grid grid-cols-1 gap-6 rounded-2xl border border-[color:var(--sp-border)] bg-white p-5 shadow-sm sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]"
    >
      <div className="sp-fade-in-quick" key={day.date}>
        <span className="eyebrow">Selected day</span>
        <h3 className="mt-1 font-sora text-xl font-semibold tracking-tight text-[color:var(--sp-text)]">
          Duty proportions
        </h3>
        <p className="mt-1 max-w-sm text-xs text-[color:var(--sp-text-tertiary)]">
          Driving / on-duty / off-duty split for the active day. Switch days with the pills above to update the chart.
        </p>

        <div className="relative mt-3 h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData.length ? chartData : [{ name: 'Empty', value: 1 }]}
                cx="50%"
                cy="50%"
                innerRadius={72}
                outerRadius={112}
                paddingAngle={2}
                dataKey="value"
                stroke="#ffffff"
                strokeWidth={2}
                isAnimationActive
                animationDuration={650}
                animationEasing="ease-out"
              >
                {(chartData.length ? chartData : [{ name: 'Empty', value: 1 }]).map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[entry.name] || '#e2e8f0'}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span data-testid="chart-donut-total" className="font-sora text-4xl font-semibold tabular-nums text-[color:var(--sp-text)]">
              {total.toFixed(1)}h
            </span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--sp-text-tertiary)]">
              total day
            </span>
          </div>
        </div>
      </div>

      <div className="sp-fade-in-quick flex flex-col justify-center gap-5" key={`leg-${day.date}`}>
        <LegendRow name="Driving" value={driving} total={total} color={COLORS.Driving} />
        <LegendRow name="On Duty" value={onDuty} total={total} color={COLORS['On Duty']} />
        <LegendRow name="Off Duty" value={offDuty} total={total} color={COLORS['Off Duty']} />
        <div className="mt-2 rounded-lg border border-dashed border-[color:var(--sp-border)] bg-[color:var(--sp-bg)] px-3 py-2 text-[11px] text-[color:var(--sp-text-tertiary)]">
          Off duty includes sleeper berth periods. Driving obeys the 11-hour daily limit; on-duty (non-driving) counts against the 14-hour window.
        </div>
      </div>
    </div>
  )
}
