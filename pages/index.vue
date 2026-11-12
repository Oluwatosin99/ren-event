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
    <!-- DUAL PRIMARY STARTUP DECISION: QR SCANNER vs FOOD ORDER             -->
    <!-- =================================================================== -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
      <!-- CHOICE 1: QR GATE SCANNER & CHECK-IN -->
      <div class="bg-white dark:bg-slate-900 border-2 border-orange-500/60 dark:border-orange-500/50 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between relative overflow-hidden transition-colors">
        <div class="absolute -right-16 -top-16 w-56 h-56 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 space-y-5">
          <div class="flex items-center justify-between gap-3">
            <div class="w-12 h-12 p-2.5 rounded-2xl bg-orange-500/15 border border-orange-500/30 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <VIcon name="qr" size="lg" />
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-extrabold bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-500/30">
              Option 1 • Gate Access
            </span>
          </div>

          <div>
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              QR Gate Scanner &amp; Check-In
            </h2>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              Scan sponsor-forwarded QR passes with your phone camera, verify Pre-Registered (<strong>"Yes"</strong>) attendees, or assign seats via On-Site Gate Registration when capacity permits.
            </p>
          </div>

          <!-- Scanner Standby Preview + Live Attendance Snapshot -->
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div class="w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0">
              <img
                :src="isDark ? '/images/brand/renaissance-placeholder-dark.jpg' : '/images/brand/renaissance-placeholder-light.jpg'"
                alt="QR Gate Scanner"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="space-y-1.5 min-w-0">
              <div class="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <VIcon name="camera" size="xs" class="text-orange-500" />
                <span>Mobile Camera &amp; Ticket ID Lookup</span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                Instant gate verification &amp; automatic redirect to Food Ordering after check-in.
              </p>
              <div v-if="eventState" class="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                Checked-In: {{ eventState.capacity.checkedInCount.toLocaleString() }} / {{ eventState.capacity.totalExpected.toLocaleString() }}
              </div>
            </div>
          </div>
        </div>

        <div class="relative z-10 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <VIcon name="clock" size="xs" class="text-orange-500" />
            <span>Check-in Window: <strong>{{ eventState?.capacity.checkInWindow || '2:00 PM – 2:45 PM' }}</strong></span>
          </div>

          <NuxtLink
            to="/scanner"
            class="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-orange-500/25 transition flex items-center justify-center gap-2"
          >
            <VIcon name="qr" size="sm" />
            <span>Open QR Gate Scanner</span>
            <VIcon name="arrowRight" size="sm" />
          </NuxtLink>
        </div>
      </div>

      <!-- CHOICE 2: GUEST — ORDER YOUR FOOD -->
      <div class="bg-white dark:bg-slate-900 border-2 border-emerald-500/60 dark:border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between relative overflow-hidden transition-colors">
        <div class="absolute -right-16 -top-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 space-y-5">
          <div class="flex items-center justify-between gap-3">
            <div class="w-12 h-12 p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <VIcon name="utensils" size="lg" />
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              Option 2 • Food Menu
            </span>
          </div>

          <div>
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Guest — Order Your Food
            </h2>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              For seated guests who confirmed attendance (<strong>"Yes"</strong>) or received a seat at the gate. Look up your Ticket ID or confirm your Table &amp; Seat below.
            </p>
          </div>

          <!-- Optional Ticket ID Lookup (from SQLite Attendees DB) -->
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <label class="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <VIcon name="ticket" size="xs" class="text-orange-500" />
                <span>Ticket QR / ID Lookup (Optional)</span>
              </label>
              <span class="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Try: REN-0842</span>
            </div>

            <div class="flex flex-col sm:flex-row gap-2">
              <input
                v-model="guestTicketLookup"
                type="text"
                placeholder="Enter Ticket ID (e.g. REN-0842)"
                class="w-full min-w-0 sm:flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                @click="handleTicketLookup"
                type="button"
                class="w-full sm:w-auto justify-center px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition flex items-center gap-1.5 shrink-0"
              >
                <VIcon name="search" size="xs" />
                <span>Find Seat</span>
              </button>
            </div>

            <div v-if="lookupFeedback" class="text-xs font-semibold flex items-center gap-1.5" :class="lookupFound ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400'">
              <VIcon :name="lookupFound ? 'checkCircle' : 'alert'" size="xs" />
              <span>{{ lookupFeedback }}</span>
            </div>

            <!-- Guest Name, Table & Seat Selection -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Guest Name</label>
                <input
                  v-model="guestEntry.name"
                  type="text"
                  placeholder="Enter your name"
                  class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Table Number</label>
                <select
                  v-model="guestEntry.table"
                  class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option v-for="t in 200" :key="t" :value="`Table ${t}`">Table {{ t }}</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Seat Number</label>
                <select
                  v-model="guestEntry.seat"
                  class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option v-for="s in 10" :key="s" :value="`Seat ${s}`">Seat {{ s }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="relative z-10 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <VIcon name="checkCircle" size="xs" class="text-emerald-600 dark:text-emerald-400" />
            <span><strong class="text-emerald-700 dark:text-emerald-400">{{ totalAvailablePlates.toLocaleString() }}</strong> plates live now</span>
          </div>

          <button
            @click="handleEnterAsGuest"
            type="button"
            class="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2"
          >
            <span>Order Your Food</span>
            <VIcon name="arrowRight" size="sm" />
          </button>
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
  enterAsGuest,
  lookupGuestTicket,
  loginWithDb
} = useEventSuite()

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
