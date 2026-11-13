import { getFullEventState } from '../utils/db'
import { fetchEventStateFromSupabase } from '../utils/supabaseService'

export default defineEventHandler(async () => {
  // If Supabase is configured (e.g. Netlify production), use Supabase as primary
  const onlineState = await fetchEventStateFromSupabase()
  if (onlineState) {
    return onlineState
  }

  // Fallback to local SQLite for local offline development
  try {
    return getFullEventState()
  } catch (err) {
    console.warn('[state.get] Fallback to static seed data:', err)
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
  }
})
