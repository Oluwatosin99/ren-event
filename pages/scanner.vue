<template>
  <div class="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
    <!-- Top Subheader -->
    <div class="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm transition-colors">
      <div class="flex items-center gap-3">
        <div class="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
          <VIcon name="qr" size="lg" />
        </div>
        <div>
          <h1 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            Gate Access Control &amp; QR Ticket Scanner
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Verify Pre-Registered ("Yes") Guests &amp; Sponsor-Forwarded Passes or assign Seats via On-Site Registration
          </p>
        </div>
      </div>

      <NuxtLink
        to="/admin"
        class="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 text-xs font-bold transition flex items-center gap-1.5"
      >
        <VIcon name="database" size="xs" />
        <span>Admin Console</span>
      </NuxtLink>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left 5 Cols: Camera QR Scanner & Ticket Verification -->
      <div class="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-md flex flex-col items-center transition-colors">
        <div class="w-full flex items-center justify-between mb-3">
          <span class="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Mobile Camera Gate Scanner
          </span>
          <button
            @click="toggleCameraStream"
            type="button"
            class="px-2.5 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5"
            :class="cameraActive
              ? 'bg-red-500/15 text-red-600 dark:text-red-400'
              : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'"
          >
            <VIcon name="camera" size="xs" />
            <span>{{ cameraActive ? 'Stop Camera' : 'Start Camera' }}</span>
          </button>
        </div>

        <!-- Scanner Frame -->
        <div class="w-full max-w-[340px] bg-slate-950 border-4 border-slate-200 dark:border-slate-800 rounded-[2rem] p-4 shadow-xl text-white">
          <div class="text-center mb-3">
            <div class="text-xs font-extrabold">Renaissance Gate Scanner</div>
            <div class="text-[11px] text-slate-400">Scan Guest QR or enter Ticket ID below</div>
          </div>

          <div class="relative w-full h-52 rounded-2xl bg-slate-900 border-2 border-emerald-500/50 overflow-hidden flex items-center justify-center">
            <video
              v-show="cameraActive"
              ref="videoRef"
              autoplay
              playsinline
              muted
              class="absolute inset-0 w-full h-full object-cover"
            ></video>

            <div class="absolute inset-5 border-2 border-dashed border-yellow-400/70 rounded-xl pointer-events-none"></div>
            <div class="scanner-laser absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-lg shadow-emerald-400 pointer-events-none"></div>

            <div v-if="!cameraActive" class="text-center px-4">
              <div class="w-20 h-20 rounded-2xl bg-[#090d16] border border-emerald-500/30 mx-auto mb-2 overflow-hidden flex items-center justify-center shadow-inner">
                <img
                  src="/images/brand/renaissance-placeholder-dark.jpg"
                  alt="Renaissance Gate Standby"
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="text-xs font-bold" :class="scanResult.status === 'unregistered' ? 'text-orange-400' : 'text-emerald-400'">
                {{ scanResult.title }}
              </div>
              <div class="text-[11px] text-slate-400 mt-0.5">
                {{ scanResult.subtitle }}
              </div>
            </div>
          </div>

          <!-- Ticket ID Lookup Form -->
          <form @submit.prevent="handleManualCodeLookup" class="mt-3 flex flex-col sm:flex-row gap-1.5">
            <input
              v-model="manualTicketInput"
              type="text"
              placeholder="Ticket ID (e.g. REN-0842)"
              class="w-full min-w-0 sm:flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
            />
            <button
              type="submit"
              class="w-full sm:w-auto justify-center px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shrink-0"
            >
              Verify
            </button>
          </form>

          <!-- Quick Scan Actions -->
          <div class="mt-2.5 grid grid-cols-2 gap-2">
            <button
              @click="triggerScanCheck('valid')"
              type="button"
              class="py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition flex items-center justify-center gap-1"
            >
              <VIcon name="check" size="xs" />
              <span>Scan Guest QR</span>
            </button>
            <button
              @click="triggerScanCheck('walkin')"
              type="button"
              class="py-2 px-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-[11px] transition flex items-center justify-center gap-1"
            >
              <VIcon name="plus" size="xs" />
              <span>Unregistered</span>
            </button>
          </div>

          <!-- Active Verified Guest Card -->
          <div
            class="mt-4 p-3.5 rounded-2xl border transition-all"
            :class="scanResult.status === 'unregistered'
              ? 'bg-orange-500/10 border-orange-500/40'
              : 'bg-emerald-500/10 border-emerald-500/30'"
          >
            <div class="flex items-center justify-between">
              <span
                class="text-[11px] font-extrabold uppercase tracking-wider"
                :class="scanResult.status === 'unregistered' ? 'text-orange-400' : 'text-emerald-400'"
              >
                {{ scanResult.badge }}
              </span>
              <span class="text-xs font-mono font-bold text-slate-300">{{ scanResult.ticketId }}</span>
            </div>
            <div class="text-sm font-black text-white mt-1">{{ scanResult.guestName }}</div>
            <div class="text-xs text-slate-300 mt-0.5 flex items-center justify-between">
              <span>{{ scanResult.tableSeat }}</span>
              <span class="text-[11px] text-yellow-400 font-semibold">{{ scanResult.guestType }}</span>
            </div>

            <button
              v-if="scanResult.status === 'verified'"
              @click="proceedGuestToFoodMenu"
              type="button"
              class="mt-3 w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow"
            >
              <VIcon name="utensils" size="xs" />
              <span>Open Food Menu for Guest</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Right 7 Cols: Live Capacity Stats & On-Site Registration -->
      <div class="lg:col-span-7 space-y-5">
        <div v-if="eventState" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm transition-colors">
            <div class="text-[11px] text-slate-500 dark:text-slate-400">Total Capacity</div>
            <div class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
              {{ eventState.capacity.totalExpected.toLocaleString() }}
            </div>
            <div class="text-[10px] text-slate-400">200 Tables • 10 Seats</div>
          </div>
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm transition-colors">
            <div class="text-[11px] text-slate-500 dark:text-slate-400">Checked-In</div>
            <div class="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
              {{ eventState.capacity.checkedInCount.toLocaleString() }}
            </div>
            <div class="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">Verified at Gate</div>
          </div>
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm transition-colors">
            <div class="text-[11px] text-slate-500 dark:text-slate-400">On-Site Reg</div>
            <div class="text-xl sm:text-2xl font-black text-orange-600 dark:text-orange-400 font-mono mt-0.5">
              {{ eventState.capacity.postRegCount }}
            </div>
            <div class="text-[10px] text-slate-400">Assigned Seats</div>
          </div>
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm transition-colors">
            <div class="text-[11px] text-slate-500 dark:text-slate-400">Open Seats</div>
            <div class="text-xl sm:text-2xl font-black text-yellow-600 dark:text-yellow-400 font-mono mt-0.5">
              {{ Math.max(0, eventState.capacity.totalExpected - eventState.capacity.checkedInCount).toLocaleString() }}
            </div>
            <div class="text-[10px] text-yellow-700 dark:text-yellow-300">Available</div>
          </div>
        </div>

        <!-- 2:00 PM - 2:45 PM Check-in Window Control -->
        <div
          v-if="eventState"
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm transition-colors"
        >
          <div class="space-y-0.5">
            <div class="flex items-center gap-2">
              <span class="text-xs font-extrabold text-slate-900 dark:text-white">Check-In Window Policy (2:00 PM – 2:45 PM)</span>
              <span
                class="px-2 py-0.5 rounded text-[10px] font-bold"
                :class="eventState.capacity.unclaimedSeatsReleased
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                  : 'bg-orange-500/15 text-orange-700 dark:text-orange-300'"
              >
                {{ eventState.capacity.unclaimedSeatsReleased ? 'Unclaimed Seats Open' : 'Reserved until 2:45 PM' }}
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Release unclaimed seats after 2:45 PM for on-site walk-ins when capacity supports it.
            </p>
          </div>
          <button
            @click="toggleSeatRelease"
            type="button"
            class="px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 border"
            :class="eventState.capacity.unclaimedSeatsReleased
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow'"
          >
            {{ eventState.capacity.unclaimedSeatsReleased ? 'Lock Reserved Seats' : 'Release Unclaimed Seats' }}
          </button>
        </div>

        <!-- On-Site Registration & Seat Assignment Form -->
        <div
          class="bg-white dark:bg-slate-900 border-2 rounded-3xl p-5 sm:p-6 shadow-md transition-all"
          :class="highlightPostReg ? 'border-orange-500 ring-4 ring-orange-500/15' : 'border-slate-200 dark:border-slate-800'"
        >
          <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h3 class="text-base font-extrabold text-slate-900 dark:text-white">
                On-Site Guest Registration &amp; Seat Assignment
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Assign a Table &amp; Seat number to walk-in guests and save directly to the SQLite database
              </p>
            </div>
            <span class="px-2.5 py-1 rounded-lg bg-orange-500/15 text-orange-700 dark:text-orange-400 text-xs font-bold border border-orange-500/30">
              DB Synced
            </span>
          </div>

          <form @submit.prevent="submitPostRegistration" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
              <input
                ref="postRegNameInput"
                v-model="postRegForm.name"
                type="text"
                required
                placeholder="e.g. Amina Bello"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Sponsor / Staff ID *</label>
              <input
                v-model="postRegForm.sponsor"
                type="text"
                required
                placeholder="e.g. REN-STF-108"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Assign Table *</label>
              <select
                v-model="postRegForm.table"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
              >
                <option v-for="t in 200" :key="t" :value="`Table ${t}`">Table {{ t }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Assign Seat *</label>
              <select
                v-model="postRegForm.seat"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
              >
                <option v-for="s in 10" :key="s" :value="`Seat ${s}`">Seat {{ s }}</option>
              </select>
            </div>

            <div class="sm:col-span-2 pt-1">
              <button
                type="submit"
                class="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs sm:text-sm transition shadow-md flex items-center justify-center gap-2"
              >
                <VIcon name="check" size="sm" />
                <span>Register Guest &amp; Assign Seat</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Recent Gate Check-Ins List -->
        <div v-if="eventState" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm transition-colors">
          <div class="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5 flex items-center justify-between">
            <span>Recent Gate Verifications (SQLite Attendees)</span>
            <span class="text-[11px] text-slate-400">Latest {{ Math.min(5, eventState.attendees.length) }}</span>
          </div>
          <div class="space-y-2">
            <div
              v-for="att in eventState.attendees.slice(0, 5)"
              :key="att.ticketId"
              class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs transition-colors"
            >
              <div class="flex items-center gap-2.5">
                <span class="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                  {{ att.ticketId }}
                </span>
                <div>
                  <div class="font-bold text-slate-900 dark:text-white">{{ att.name }}</div>
                  <div class="text-[11px] text-slate-500 dark:text-slate-400">
                    {{ att.type }} • Sponsor: {{ att.sponsorStaffId || 'Internal' }}
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-bold text-orange-600 dark:text-orange-400">{{ att.table }} • {{ att.seat }}</div>
                <div class="text-[10px] text-emerald-600 dark:text-emerald-400">
                  {{ att.checkedIn ? `Checked in ${att.checkedInAt || 'Now'}` : 'Awaiting Scan' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const { eventState, userSession, activeGuestContext, performGateAction } = useEventSuite()

// Allow Gate Ushers / Startup Entry and Admins to operate the QR Scanner; Vendors go to Vendor Dashboard
onMounted(() => {
  if (userSession.value.role === 'vendor') {
    router.replace('/vendor')
  }
})

const manualTicketInput = ref('')
const highlightPostReg = ref(false)
const postRegNameInput = ref<HTMLInputElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const cameraActive = ref(false)
let mediaStream: MediaStream | null = null

const scanResult = reactive({
  status: 'verified' as 'verified' | 'unregistered',
  title: 'QR Scanner Ready',
  subtitle: 'Scan ticket or enter ID below',
  badge: 'VERIFIED ATTENDEE',
  ticketId: 'REN-0842',
  guestName: 'Oluwatosin Dawodu',
  tableSeat: 'Table 12 • Seat 4',
  guestType: 'Pre-Registered (Yes)'
})

const postRegForm = reactive({
  name: '',
  sponsor: 'REN-STF-042',
  table: 'Table 14',
  seat: 'Seat 6'
})

const toggleCameraStream = async () => {
  if (cameraActive.value) {
    stopCamera()
    return
  }
  if (import.meta.client && navigator.mediaDevices?.getUserMedia) {
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      if (videoRef.value) {
        videoRef.value.srcObject = mediaStream
      }
      cameraActive.value = true
    } catch {
      alert('Camera permission not granted or unavailable. Use the Ticket ID lookup box below.')
    }
  }
}

const stopCamera = () => {
  if (mediaStream) {
    mediaStream.getTracks().forEach(t => t.stop())
    mediaStream = null
  }
  cameraActive.value = false
}

onUnmounted(() => {
  stopCamera()
})

const handleManualCodeLookup = async () => {
  if (!manualTicketInput.value.trim()) return
  const res = await performGateAction({
    action: 'scan_qr',
    code: manualTicketInput.value.trim()
  })
  if (res.ok && res.attendee) {
    applyVerifiedAttendee(res.attendee)
  } else {
    triggerScanCheck('walkin')
  }
}

const triggerScanCheck = async (mode: 'valid' | 'walkin') => {
  if (mode === 'valid') {
    const res = await performGateAction({
      action: 'scan_qr',
      simulateMode: 'valid'
    })
    if (res.attendee) {
      applyVerifiedAttendee(res.attendee)
    }
    highlightPostReg.value = false
  } else {
    scanResult.status = 'unregistered'
    scanResult.title = 'Unregistered / Walk-In'
    scanResult.subtitle = 'Complete On-Site Registration'
    scanResult.badge = 'WALK-IN / NO QR'
    scanResult.ticketId = 'NEW'
    scanResult.guestName = 'Unregistered Arrival'
    scanResult.tableSeat = 'Assign Table & Seat on right'
    scanResult.guestType = 'Walk-In'
    highlightPostReg.value = true
    nextTick(() => {
      postRegNameInput.value?.focus()
    })
  }
}

const applyVerifiedAttendee = (att: any) => {
  scanResult.status = 'verified'
  scanResult.title = 'QR Ticket Confirmed'
  scanResult.subtitle = `Verified ${att.type}`
  scanResult.badge = 'ADMITTED & TAGGED'
  scanResult.ticketId = att.ticketId
  scanResult.guestName = att.name
  scanResult.tableSeat = `${att.table} • ${att.seat}`
  scanResult.guestType = att.type

  activeGuestContext.value = {
    name: att.name,
    ticketId: att.ticketId,
    table: att.table,
    seat: att.seat,
    guestType: att.type
  }
}

const submitPostRegistration = async () => {
  const res = await performGateAction({
    action: 'post_register',
    name: postRegForm.name,
    sponsor: postRegForm.sponsor,
    table: postRegForm.table,
    seat: postRegForm.seat
  })
  if (res.ok && res.attendee) {
    applyVerifiedAttendee(res.attendee)
    postRegForm.name = ''
    highlightPostReg.value = false
  }
}

const toggleSeatRelease = async () => {
  await performGateAction({ action: 'toggle_seat_release' })
}

const proceedGuestToFoodMenu = () => {
  router.push('/menu')
}
</script>
