import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'spotter_guest_id'

const GuestContext = createContext(null)

function getOrCreateGuestId() {
  let id = localStorage.getItem(STORAGE_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(STORAGE_KEY, id)
  }
  return id
}

export function GuestProvider({ children }) {
  const [guestId, setGuestId] = useState(null)

  useEffect(() => {
    setGuestId(getOrCreateGuestId())
  }, [])

  return (
    <GuestContext.Provider value={{ guestId }}>
      {children}
    </GuestContext.Provider>
  )
}

export function useGuest() {
  const ctx = useContext(GuestContext)
  if (!ctx) throw new Error('useGuest must be used within GuestProvider')
  return ctx
}
