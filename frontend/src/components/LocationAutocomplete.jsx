import { useEffect, useId, useRef, useState } from 'react'
import { geocode } from '../services/api'

export default function LocationAutocomplete({
  id,
  testId,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  label,
}) {
  const listId = useId()
  const [open, setOpen] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!value || value.trim().length < 3) {
      setSuggestions([])
      return undefined
    }

    const t = setTimeout(() => {
      setLoading(true)
      geocode(value.trim())
        .then((data) => {
          const items = Array.isArray(data)
            ? data.map((d) => d.label || d.name).filter(Boolean)
            : []
          setSuggestions(items.slice(0, 5))
          setOpen(items.length > 0)
          setActiveIndex(-1)
        })
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false))
    }, 350)

    return () => clearTimeout(t)
  }, [value])

  useEffect(() => {
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  function pick(suggestion) {
    onChange(suggestion)
    setOpen(false)
    setSuggestions([])
  }

  function onKeyDown(e) {
    if (!open || !suggestions.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      pick(suggestions[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const errorId = error ? `${id}-error` : undefined
  const listboxId = `${listId}-listbox`

  return (
    <div ref={wrapRef} className="relative w-full">
      <input
        id={id}
        data-testid={testId}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-autocomplete="list"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={errorId}
        aria-label={label}
        autoComplete="off"
        className="sp-focus-ring w-full bg-transparent px-3 py-2.5 text-sm text-[color:var(--sp-text)] placeholder:text-[color:var(--sp-text-tertiary)]"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onFocus={() => suggestions.length && setOpen(true)}
        onKeyDown={onKeyDown}
      />
      {loading && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[color:var(--sp-text-tertiary)]">
          …
        </span>
      )}
      {open && suggestions.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-[color:var(--sp-border)] bg-white py-1 shadow-lg"
        >
          {suggestions.map((s, i) => (
            <li key={s} role="option" aria-selected={i === activeIndex}>
              <button
                type="button"
                className={`sp-focus-ring w-full px-3 py-2 text-left text-sm hover:bg-[color:var(--sp-bg)] ${
                  i === activeIndex ? 'bg-[color:var(--sp-bg)]' : ''
                }`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(s)}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p id={errorId} className="sr-only" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
