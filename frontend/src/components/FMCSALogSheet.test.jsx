import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import FMCSALogSheet from './FMCSALogSheet'

const mockDay = {
  date: '2025-01-01',
  segments: [
    { status: 'off', start: '00:00', end: '08:00', location: 'Dallas, TX', remark: '10-hour rest' },
    { status: 'driving', start: '08:00', end: '10:00', location: '', remark: '' },
    { status: 'on', start: '10:00', end: '11:00', location: 'Houston, TX', remark: 'Loading' },
    { status: 'driving', start: '11:00', end: '17:00', location: '', remark: '' },
    { status: 'on', start: '17:00', end: '17:30', location: '', remark: 'Fuel/break' },
    { status: 'driving', start: '17:30', end: '22:00', location: '', remark: '' },
    { status: 'off', start: '22:00', end: '23:59', location: 'Memphis, TN', remark: '10-hour rest' },
  ],
  total_driving_hours: 9.5,
  total_on_duty_hours: 11.0,
  total_off_duty_hours: 13.0,
}

describe('FMCSALogSheet', () => {
  it('renders date header', () => {
    render(<FMCSALogSheet day={mockDay} dayIndex={0} totalDays={3} />)
    expect(screen.getByText(/1 Jan 2025/)).toBeInTheDocument()
  })

  it('renders day label', () => {
    render(<FMCSALogSheet day={mockDay} dayIndex={0} totalDays={3} />)
    expect(screen.getByText(/Day 1 of 3/)).toBeInTheDocument()
  })

  it('renders driving hours summary', () => {
    render(<FMCSALogSheet day={mockDay} dayIndex={0} totalDays={3} />)
    expect(screen.getByText(/9\.5/)).toBeInTheDocument()
  })
})
