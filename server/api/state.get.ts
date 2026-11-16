import { getFullEventState } from '../utils/db'
import { fetchEventStateFromSupabase } from '../utils/supabaseService'

export default defineEventHandler(async () => {
  const isNetlifyOrProd = process.env.NETLIFY === 'true' || process.env.NODE_ENV === 'production'

  // On Netlify/production, prioritize Supabase
  if (isNetlifyOrProd) {
    try {
      const onlineState = await fetchEventStateFromSupabase()
      if (onlineState && onlineState.menuItems && onlineState.menuItems.length > 0) {
        return onlineState
      }
    } catch (e) {
      console.warn('[state.get] Supabase fetch error in production:', e)
    }
  }

  // Locally, ALWAYS return full local SQLite state with zero network latency
  try {
    const localState = getFullEventState()
    if (localState && localState.menuItems && localState.menuItems.length > 0) {
      return localState
    }
  } catch (err) {
    console.warn('[state.get] Local SQLite read error, falling back:', err)
  }

  // Final fallback: try Supabase or static seed data
  const online = await fetchEventStateFromSupabase()
  if (online && online.menuItems && online.menuItems.length > 0) {
    return online
  }

  const { getFallbackMenuItems } = await import('../utils/seedMenuData')
  return {
    capacity: {
      totalExpected: 2000,
      totalTables: 200,
      seatsPerTable: 10,
      checkedInCount: 1414,
      postRegCount: 52,
      unclaimedSeatsReleased: false,
      checkInWindow: '2:00 PM – 2:45 PM'
    },
    menuItems: getFallbackMenuItems(),
    orders: [],
    attendees: [],
    users: [],
    metrics: {
      avgResponseMs: 10,
      totalProcessedLockOps: 1500
    }
  }
})
