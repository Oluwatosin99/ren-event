<template>
  <div class="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 space-y-8">
    <!-- Startup Brand Logo Intro Overlay (Starts with Logo, Fades into Dual Decision) -->
    <BrandSplash />

    <!-- Top Renaissance Landing Header -->
    <div class="text-center max-w-2xl mx-auto space-y-3">
      <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-extrabold uppercase tracking-wider">
        <span class="flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span class="w-2 h-2 rounded-full bg-orange-500"></span>
          <span class="w-2 h-2 rounded-full bg-yellow-400"></span>
          <span class="w-2 h-2 rounded-full bg-red-600"></span>
        </span>
        <span>Renaissance Event Access Portal</span>
      </div>

      <h1 class="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
        Choose Your Entry Point
      </h1>
      <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        Start at the <strong>QR Gate Scanner</strong> for admission &amp; table check-in, go straight to <strong>Order Your Food</strong> at your seat, or sign in below as a Vendor / Admin.
      </p>
    </div>

    <!-- =================================================================== -->
    <!-- 4 PRIMARY OPERATIONAL ENTRY PORTALS                                 -->
    <!-- =================================================================== -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- PORTAL 1: QR GATE SCANNER & REGISTRATION -->
      <div class="bg-white dark:bg-slate-900 border-2 border-orange-500/50 hover:border-orange-500 rounded-3xl p-5 shadow-lg flex flex-col justify-between relative overflow-hidden transition group">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="w-11 h-11 rounded-2xl bg-orange-500/15 border border-orange-500/30 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <VIcon name="qr" size="md" />
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-500/30">
              Station 1
            </span>
          </div>

          <div>
            <h2 class="text-lg font-black text-slate-900 dark:text-white leading-tight">
              QR Gate Scanner
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Verify QR passes at the entrance, confirm pre-registered guests, and assign table seats.
            </p>
          </div>

          <div v-if="eventState" class="p-2.5 rounded-xl bg-orange-500/5 dark:bg-slate-950 border border-orange-500/20 text-[11px] font-mono text-orange-700 dark:text-orange-400">
            Checked-in: <strong>{{ eventState.capacity.checkedInCount.toLocaleString() }}</strong> / {{ eventState.capacity.totalExpected.toLocaleString() }}
          </div>
        </div>

        <div class="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
          <NuxtLink
            to="/scanner"
            class="w-full py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 transition flex items-center justify-center gap-1.5"
          >
            <span>Open Gate Scanner</span>
            <VIcon name="arrowRight" size="xs" />
          </NuxtLink>
        </div>
      </div>

      <!-- PORTAL 2: ORDER FOOD ALONE -->
      <div class="bg-white dark:bg-slate-900 border-2 border-emerald-500/50 hover:border-emerald-500 rounded-3xl p-5 shadow-lg flex flex-col justify-between relative overflow-hidden transition group">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <VIcon name="utensils" size="md" />
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              Station 2
            </span>
          </div>

          <div>
            <h2 class="text-lg font-black text-slate-900 dark:text-white leading-tight">
              Order Food Alone
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              For seated guests: browse Nigerian &amp; Continental meals, pick proteins &amp; sides, and place your order.
            </p>
          </div>

          <div class="p-2.5 rounded-xl bg-emerald-500/5 dark:bg-slate-950 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
            <VIcon name="checkCircle" size="xs" />
            <span>{{ isStaffOrAdmin ? `${totalAvailablePlates.toLocaleString()} plates live` : '1 order per seated guest' }}</span>
          </div>
        </div>

        <div class="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
          <NuxtLink
            to="/menu"
            class="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition flex items-center justify-center gap-1.5"
          >
            <span>Order Food Menu</span>
            <VIcon name="arrowRight" size="xs" />
          </NuxtLink>
        </div>
      </div>

      <!-- PORTAL 3: DELIVERY SERVER SCANNER (DELIVERED GUYS) -->
      <div class="bg-white dark:bg-slate-900 border-2 border-blue-500/50 hover:border-blue-500 rounded-3xl p-5 shadow-lg flex flex-col justify-between relative overflow-hidden transition group">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="w-11 h-11 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <VIcon name="checkCircle" size="md" />
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
              Station 3
            </span>
          </div>

          <div>
            <h2 class="text-lg font-black text-slate-900 dark:text-white leading-tight">
              Delivery Server Scanner
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Food delivery waitstaff: scan ticket QR or enter Order ID to mark meals delivered with server audit log.
            </p>
          </div>

          <div v-if="eventState" class="p-2.5 rounded-xl bg-blue-500/5 dark:bg-slate-950 border border-blue-500/20 text-[11px] font-mono text-blue-700 dark:text-blue-400">
            Served: <strong>{{ eventState.orders.filter(o => o.status === 'served').length }}</strong> / {{ eventState.orders.length }} orders
          </div>
        </div>

        <div class="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
          <NuxtLink
            to="/delivery"
            class="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition flex items-center justify-center gap-1.5"
          >
            <span>Open Delivery Station</span>
            <VIcon name="arrowRight" size="xs" />
          </NuxtLink>
        </div>
      </div>

      <!-- PORTAL 4: ADMIN EXECUTIVE MATRIX -->
      <div class="bg-white dark:bg-slate-900 border-2 border-purple-500/50 hover:border-purple-500 rounded-3xl p-5 shadow-lg flex flex-col justify-between relative overflow-hidden transition group">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="w-11 h-11 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <VIcon name="layers" size="md" />
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
              Station 4
            </span>
          </div>

          <div>
            <h2 class="text-lg font-black text-slate-900 dark:text-white leading-tight">
              Admin Entry &amp; Matrix
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Live Table × Seat heatmap matrix, Quad performance, Backend Server Summary &amp; system maintenance.
            </p>
          </div>

          <div class="p-2.5 rounded-xl bg-purple-500/5 dark:bg-slate-950 border border-purple-500/20 text-[11px] text-purple-700 dark:text-purple-400 font-semibold flex items-center gap-1.5">
            <VIcon name="lock" size="xs" />
            <span>Strict Admin Maintenance Access</span>
          </div>
        </div>

        <div class="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
          <NuxtLink
            to="/admin"
            class="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/25 transition flex items-center justify-center gap-1.5"
          >
            <span>Open Admin Dashboard</span>
            <VIcon name="arrowRight" size="xs" />
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- =================================================================== -->
    <!-- FAST SEAT LOOKUP & DIRECT FOOD ORDERING CARD                         -->
    <!-- =================================================================== -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl transition-colors">
      <div class="max-w-3xl mx-auto space-y-5">
        <div class="text-center space-y-1.5">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
            <VIcon name="ticket" size="xs" />
            <span>Fast Guest Seating Lookup</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Ready to Order? Confirm Your Table &amp; Seat
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Look up your assigned seat using your Ticket ID, or pick your Table &amp; Seat directly to jump straight into the menu.
          </p>
        </div>

        <div class="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
          <!-- Ticket ID Lookup -->
          <div class="flex flex-col sm:flex-row gap-2">
            <input
              v-model="guestTicketLookup"
              type="text"
              placeholder="Enter Ticket ID (e.g. REN-0842)"
              class="w-full min-w-0 sm:flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              @click="handleTicketLookup"
              type="button"
              class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shrink-0"
            >
              <VIcon name="search" size="xs" />
              <span>Find My Seat</span>
            </button>
          </div>

          <div v-if="lookupFeedback" class="text-xs font-semibold flex items-center gap-1.5" :class="lookupFound ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400'">
            <VIcon :name="lookupFound ? 'checkCircle' : 'alert'" size="xs" />
            <span>{{ lookupFeedback }}</span>
          </div>

          <!-- Guest Name, Table & Seat Dropdowns -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div>
              <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Guest Name</label>
              <input
                v-model="guestEntry.name"
                type="text"
                placeholder="Enter your name"
                class="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Table Number</label>
              <select
                v-model="guestEntry.table"
                class="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                <option v-for="t in 200" :key="t" :value="`Table ${t}`">Table {{ t }}</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Seat Number</label>
              <select
                v-model="guestEntry.seat"
                class="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                <option v-for="s in 10" :key="s" :value="`Seat ${s}`">Seat {{ s }}</option>
              </select>
            </div>
          </div>

          <div class="pt-2 flex justify-end">
            <button
              @click="handleEnterAsGuest"
              type="button"
              class="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2"
            >
              <span>Proceed to Food Menu</span>
              <VIcon name="arrowRight" size="sm" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- =================================================================== -->
    <!-- VENDOR & ADMIN LOGIN PANEL (SQLITE AUTH)                            -->
    <!-- =================================================================== -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl transition-colors">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div class="lg:col-span-5 space-y-3">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/30">
            <VIcon name="lock" size="xs" />
            <span>Staff, Vendor &amp; Admin Sign In</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Food Vendor &amp; Tech Operations Access
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Authenticated via SQLite: <strong>Admins</strong> access every station (QR Gate, Menu, Vendor Receipts &amp; User DB); <strong>Vendors</strong> upload menus/plates &amp; process/print receipts; any other login routes to <strong>Order Your Food</strong>.
          </p>

          <!-- Quick Station Role Buttons for Testing -->
          <div class="pt-2 space-y-2">
            <div class="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Quick Role Switcher (Demo Stations)
            </div>
            <div class="grid grid-cols-3 gap-2">
              <button
                @click="quickSignIn('admin@renaissance.ng', 'admin123', '/admin')"
                type="button"
                class="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-left transition"
              >
                <VIcon name="shield" size="sm" class="text-red-600 dark:text-red-400 mb-1" />
                <div class="text-xs font-extrabold text-slate-900 dark:text-white">Admin</div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400">Sees All</div>
              </button>

              <button
                @click="quickSignIn('vendor@renaissance.ng', 'vendor123', '/vendor')"
                type="button"
                class="p-2.5 rounded-xl bg-yellow-400/15 hover:bg-yellow-400/25 border border-yellow-500/40 text-left transition"
              >
                <VIcon name="printer" size="sm" class="text-yellow-700 dark:text-yellow-400 mb-1" />
                <div class="text-xs font-extrabold text-slate-900 dark:text-white">Vendor</div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400">Food &amp; Orders</div>
              </button>

              <button
                @click="handleEnterAsGuest"
                type="button"
                class="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-left transition"
              >
                <VIcon name="utensils" size="sm" class="text-emerald-600 dark:text-emerald-400 mb-1" />
                <div class="text-xs font-extrabold text-slate-900 dark:text-white">Guest</div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400">Order Only</div>
              </button>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleDbLogin" class="lg:col-span-7 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3.5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input
                v-model="loginForm.email"
                type="email"
                required
                placeholder="vendor@renaissance.ng or admin@renaissance.ng"
                class="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <input
                v-model="loginForm.password"
                type="password"
                required
                placeholder="Enter password"
                class="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div v-if="loginError" class="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
            <VIcon name="alert" size="xs" />
            <span>{{ loginError }}</span>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-3 rounded-xl bg-slate-900 dark:bg-orange-500 hover:bg-slate-800 dark:hover:bg-orange-600 disabled:opacity-50 text-white font-black text-xs sm:text-sm shadow-lg transition flex items-center justify-center gap-2"
          >
            <span>{{ isLoading ? 'Authenticating...' : 'Sign In via Database' }}</span>
            <VIcon name="arrowRight" size="sm" />
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const {
  eventState,
  isLoading,
  isDark,
  userSession,
  enterAsGuest,
  lookupGuestTicket,
  loginWithDb
} = useEventSuite()

const isStaffOrAdmin = computed(() => userSession.value?.role === 'admin' || userSession.value?.role === 'vendor')

const guestTicketLookup = ref('')
const lookupFeedback = ref('')
const lookupFound = ref(false)

const guestEntry = reactive({
  name: '',
  ticketId: '',
  table: 'Table 12',
  seat: 'Seat 4'
})

const loginForm = reactive({
  email: '',
  password: ''
})
const loginError = ref('')

const totalAvailablePlates = computed(() => {
  if (!eventState.value) return 0
  return eventState.value.menuItems.reduce((sum, item) => sum + (item.manualClosed ? 0 : item.stock), 0)
})

const handleTicketLookup = async () => {
  lookupFeedback.value = ''
  if (!guestTicketLookup.value.trim()) return
  const res = await lookupGuestTicket(guestTicketLookup.value.trim())
  if (res.found && res.attendee) {
    lookupFound.value = true
    guestEntry.name = res.attendee.name
    guestEntry.ticketId = res.attendee.ticketId
    guestEntry.table = res.attendee.table
    guestEntry.seat = res.attendee.seat
    lookupFeedback.value = `Found ${res.attendee.type}: ${res.attendee.name} (${res.attendee.table} • ${res.attendee.seat})`
  } else {
    lookupFound.value = false
    lookupFeedback.value = 'Ticket ID not found — you can still enter your Name, Table & Seat below.'
  }
}

const handleEnterAsGuest = () => {
  enterAsGuest({
    name: guestEntry.name.trim() || 'Event Guest',
    ticketId: guestEntry.ticketId,
    table: guestEntry.table,
    seat: guestEntry.seat
  })
  router.push('/menu')
}

const handleDbLogin = async () => {
  loginError.value = ''
  const res = await loginWithDb(loginForm.email, loginForm.password)
  if (!res.ok) {
    loginError.value = res.error
    return
  }
  if (res.role === 'admin') {
    router.push('/admin')
  } else if (res.role === 'vendor') {
    router.push('/vendor')
  } else {
    enterAsGuest({ name: loginForm.email.split('@')[0] })
    router.push('/menu')
  }
}

const quickSignIn = async (email: string, password: string, targetRoute: string) => {
  loginError.value = ''
  const res = await loginWithDb(email, password)
  if (res.ok) {
    router.push(targetRoute)
  } else {
    loginError.value = res.error
  }
}
</script>
