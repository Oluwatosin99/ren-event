import type { EventState, FoodOrder, UserRole } from '~/server/utils/db'

export interface ActiveUserSession {
  loggedIn: boolean
  name: string
  email: string
  role: UserRole
  department: string
}

export const useEventSuite = () => {
  const eventState = useState<EventState | null>('ren-event-state', () => null)
  const isLoading = useState<boolean>('ren-event-loading', () => false)

  // Light / Dark Mode Theme (Defaults to Light mode or saved preference; applied directly to <html>)
  const isDark = useState<boolean>('ren-theme-dark', () => false)

  const applyThemeClass = () => {
    if (import.meta.client) {
      const root = document.documentElement
      if (isDark.value) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }

  const initTheme = () => {
    if (import.meta.client) {
      const saved = localStorage.getItem('ren-theme')
      if (saved === 'dark') {
        isDark.value = true
      } else if (saved === 'light') {
        isDark.value = false
      }
      applyThemeClass()
    }
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
    if (import.meta.client) {
      localStorage.setItem('ren-theme', isDark.value ? 'dark' : 'light')
      applyThemeClass()
    }
  }

  // Active Role Session (defaults to 'guest' until authenticated as Admin or Vendor)
  const userSession = useState<ActiveUserSession>('ren-user-session', () => ({
    loggedIn: false,
    name: 'Guest Attendee',
    email: '',
    role: 'guest',
    department: 'Guest'
  }))

  const initSession = () => {
    if (import.meta.client) {
      try {
        const saved = localStorage.getItem('ren-session')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed && ['admin', 'vendor', 'guest'].includes(parsed.role)) {
            userSession.value = parsed
          }
        }
      } catch {}
    }
  }

  const persistSession = () => {
    if (import.meta.client) {
      localStorage.setItem('ren-session', JSON.stringify(userSession.value))
    }
  }

  const logoutSession = () => {
    userSession.value = {
      loggedIn: false,
      name: 'Guest Attendee',
      email: '',
      role: 'guest',
      department: 'Guest'
    }
    persistSession()
  }

  // Active Guest Context (Table & Seat from "Yes" pre-registration or On-Site Gate Registration)
  const activeGuestContext = useState<{
    name: string
    ticketId: string
    table: string
    seat: string
    guestType: string
  }>('ren-active-guest', () => ({
    name: '',
    ticketId: '',
    table: 'Table 1',
    seat: 'Seat 1',
    guestType: 'Pre-Registered (Yes)'
  }))

  const lastGuestOrder = useState<FoodOrder | null>('ren-last-guest-order', () => null)

  // Device-level "already ordered" lock (survives refresh)
  const persistGuestOrder = (order: FoodOrder | null) => {
    lastGuestOrder.value = order
    if (import.meta.client) {
      if (order) localStorage.setItem('ren-guest-order', JSON.stringify(order))
      else localStorage.removeItem('ren-guest-order')
    }
  }

  const initGuestOrder = () => {
    if (!import.meta.client || lastGuestOrder.value) return
    try {
      const saved = localStorage.getItem('ren-guest-order')
      if (saved) lastGuestOrder.value = JSON.parse(saved)
    } catch {}
  }

  // DEV MODE ONLY: clears the device lock so another order can be placed
  const clearGuestOrderLock = () => persistGuestOrder(null)

  const fetchState = async () => {
    try {
      const data = await $fetch<EventState>('/api/state')
      eventState.value = data
      return data
    } catch (e) {
      console.error('Failed to sync event state:', e)
      return null
    }
  }

  const loginWithDb = async (email: string, password: string) => {
    isLoading.value = true
    try {
      const res = await $fetch<{
        ok: boolean
        role: UserRole
        user: { name: string; email: string; role: UserRole; department: string }
        fallbackToGuest?: boolean
        state?: EventState
      }>('/api/auth', {
        method: 'POST',
        body: { email, password }
      })

      userSession.value = {
        loggedIn: true,
        name: res.user.name,
        email: res.user.email,
        role: res.role,
        department: res.user.department
      }
      persistSession()
      if (res.state) eventState.value = res.state
      return { ok: true as const, role: res.role, fallbackToGuest: Boolean(res.fallbackToGuest) }
    } catch (err: any) {
      return {
        ok: false as const,
        error: err?.data?.statusMessage || 'Authentication failed'
      }
    } finally {
      isLoading.value = false
    }
  }

  const enterAsGuest = (guestInfo?: { name?: string; table?: string; seat?: string; ticketId?: string }) => {
    userSession.value = {
      loggedIn: true,
      name: guestInfo?.name || 'Guest Attendee',
      email: '',
      role: 'guest',
      department: 'Event Guest'
    }
    persistSession()
    if (guestInfo) {
      activeGuestContext.value = {
        name: guestInfo.name || activeGuestContext.value.name,
        ticketId: guestInfo.ticketId || activeGuestContext.value.ticketId,
        table: guestInfo.table || activeGuestContext.value.table,
        seat: guestInfo.seat || activeGuestContext.value.seat,
        guestType: guestInfo.ticketId ? 'Pre-Registered / On-Site' : 'Seated Guest'
      }
    }
  }

  const lookupGuestTicket = async (ticketId: string) => {
    return await $fetch<{
      ok: boolean
      found: boolean
      attendee?: { ticketId: string; name: string; type: string; table: string; seat: string }
    }>('/api/auth', {
      method: 'POST',
      body: { action: 'guest_lookup', ticketId }
    })
  }

  const submitFoodOrder = async (payload: {
    guest: string
    ticketId?: string
    table: string
    seat: string
    dishId: string
    sides: string[]
    proteins: string[]
    idempotencyKey?: string
    devOverride?: boolean
  }) => {
    isLoading.value = true
    try {
      const res = await $fetch<{ ok: boolean; order: FoodOrder; state: EventState }>('/api/orders', {
        method: 'POST',
        body: payload
      })
      eventState.value = res.state
      persistGuestOrder(res.order)
      return { ok: true as const, order: res.order }
    } catch (err: any) {
      await fetchState()
      const errData = err?.data?.data
      if (errData?.code === 'ALREADY_ORDERED' && errData.order) {
        persistGuestOrder(errData.order)
        return {
          ok: false as const,
          alreadyOrdered: true as const,
          order: errData.order as FoodOrder,
          error: err?.data?.statusMessage || 'A meal has already been ordered for this seat.'
        }
      }
      return {
        ok: false as const,
        error: err?.data?.statusMessage || err?.message || 'Unable to submit order.'
      }
    } finally {
      isLoading.value = false
    }
  }

  const simulateConcurrencyBurst = async (count = 25) => {
    isLoading.value = true
    try {
      const res = await $fetch<{ ok: boolean; burstCreated: number; state: EventState }>('/api/orders', {
        method: 'POST',
        body: { action: 'simulate_burst', count }
      })
      eventState.value = res.state
      return res.burstCreated
    } finally {
      isLoading.value = false
    }
  }

  const updateOrderStatus = async (payload: Record<string, any>) => {
    const res = await $fetch<{ ok: boolean; order?: FoodOrder; state: EventState }>('/api/orders', {
      method: 'PATCH',
      body: payload
    })
    eventState.value = res.state
    return res
  }

  const updateMenuOrStock = async (payload: Record<string, any>) => {
    const res = await $fetch<{ ok: boolean; state: EventState }>('/api/menu', {
      method: 'POST',
      body: payload
    })
    eventState.value = res.state
    return res
  }

  const uploadDishImage = async (file: File) => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = () => reject(new Error('Could not read selected image file'))
      reader.readAsDataURL(file)
    })
    const res = await $fetch<{ ok: boolean; url: string }>('/api/upload', {
      method: 'POST',
      body: { filename: file.name, dataUrl }
    })
    return res.url
  }

  const performGateAction = async (payload: Record<string, any>) => {
    const res = await $fetch<any>('/api/checkin', {
      method: 'POST',
      body: payload
    })
    if (res.state) {
      eventState.value = res.state
    }
    return res
  }

  const manageUsers = async (payload: Record<string, any>) => {
    const res = await $fetch<{ ok: boolean; state: EventState }>('/api/users', {
      method: 'POST',
      body: payload
    })
    eventState.value = res.state
    return res
  }

  return {
    eventState,
    isLoading,
    isDark,
    initTheme,
    toggleTheme,
    userSession,
    initSession,
    logoutSession,
    activeGuestContext,
    lastGuestOrder,
    initGuestOrder,
    clearGuestOrderLock,
    fetchState,
    loginWithDb,
    enterAsGuest,
    lookupGuestTicket,
    submitFoodOrder,
    simulateConcurrencyBurst,
    updateOrderStatus,
    updateMenuOrStock,
    uploadDishImage,
    performGateAction,
    manageUsers
  }
}
