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
            <div class="text-xs font-extrabold">RenGala Gate Scanner</div>
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

            <!-- Live Auto-Scan Status Pill -->
            <div
              v-if="cameraActive"
              class="absolute bottom-2 left-2 right-2 z-10 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-emerald-500/40 text-[10px] font-bold text-center text-emerald-300 truncate pointer-events-none"
            >
              {{ lastDetectedQr ? `Detected: ${lastDetectedQr}` : 'Auto-scanning QR code… hold steady' }}
            </div>

            <div v-if="!cameraActive" class="text-center px-4">
              <div class="w-20 h-20 rounded-2xl bg-[#090d16] border border-emerald-500/30 mx-auto mb-2 overflow-hidden flex items-center justify-center shadow-inner">
                <img
                  src="/images/svg/placeholder-gala-dark.svg"
                  alt="RenGala Gate Standby"
                  class="w-full h-full object-contain p-1"
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

          <!-- Active Verified Guest Card (Hidden by default until a ticket is actually scanned/verified) -->
          <div
            v-if="hasScanned"
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
          </div>
        </div>
      </div>

      <!-- Right 7 Cols: On-Site Registration -->
      <div class="lg:col-span-7 space-y-5">
        <!-- On-Site Registration Form -->
        <div
          class="bg-white dark:bg-slate-900 border-2 rounded-3xl p-5 sm:p-6 shadow-md transition-all"
          :class="highlightPostReg ? 'border-orange-500 ring-4 ring-orange-500/15' : 'border-slate-200 dark:border-slate-800'"
        >
          <div class="mb-4">
            <h3 class="text-base font-extrabold text-slate-900 dark:text-white">
              On-Site Guest Registration
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Register walk-in guests at the gate and save directly to the database
            </p>
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
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number <span class="text-slate-400 font-normal">(Optional)</span></label>
              <input
                v-model="postRegForm.phone"
                type="tel"
                placeholder="e.g. 08012345678"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
              <input
                v-model="postRegForm.email"
                type="email"
                required
                placeholder="e.g. amina@email.com"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Guest Tier *</label>
              <select
                v-model="postRegForm.guestType"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
              >
                <option value="On-Site Registered">Non-VIP (Regular / On-Site)</option>
                <option value="VIP">VIP Guest</option>
                <option value="Spouse / Plus-One">Spouse / Plus-One</option>
              </select>
            </div>

            <div class="sm:col-span-2 pt-1">
              <button
                type="submit"
                class="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs sm:text-sm transition shadow-md flex items-center justify-center gap-2"
              >
                <VIcon name="check" size="sm" />
                <span>Admit Guest &amp; Generate Admission Receipt</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Admission Receipt Information Mail Confirmation -->
        <div
          v-if="lastAdmittedReceipt"
          class="bg-emerald-500/10 dark:bg-emerald-500/10 border-2 border-emerald-500 rounded-3xl p-5 space-y-3 shadow-md"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-black text-sm">
              <VIcon name="checkCircle" size="sm" />
              <span>Admission Receipt Mail Dispatched</span>
            </div>
            <button
              @click="lastAdmittedReceipt = null"
              type="button"
              class="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Dismiss
            </button>
          </div>
          <div class="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 text-xs space-y-1.5 font-mono">
            <div><strong>To:</strong> {{ lastAdmittedReceipt.email || 'Gate Print / Walk-In' }} ({{ lastAdmittedReceipt.phone || 'N/A' }})</div>
            <div><strong>Subject:</strong> Admitted — RenGala End of Year Event ({{ lastAdmittedReceipt.ticketId }})</div>
            <div class="pt-1 text-slate-600 dark:text-slate-300 font-sans">
              Hello <strong>{{ lastAdmittedReceipt.name }}</strong>, you have been officially admitted by
              <strong>{{ lastAdmittedReceipt.admittedBy }}</strong> at {{ lastAdmittedReceipt.checkedInAt }}
              ({{ lastAdmittedReceipt.isVip ? 'VIP' : lastAdmittedReceipt.type }}).
              <template v-if="lastAdmittedReceipt.table && lastAdmittedReceipt.table !== 'Open Seating'">
                Your assigned seat is <strong>{{ lastAdmittedReceipt.table }} • {{ lastAdmittedReceipt.seat }}</strong>.
              </template>
            </div>
          </div>
        </div>

        <!-- Recent Gate Check-Ins List (Admin Only) -->
        <div v-if="eventState && userSession?.role === 'admin'" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm transition-colors">
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
import jsQR from 'jsqr'

const router = useRouter()
const { eventState, userSession, activeGuestContext, performGateAction } = useEventSuite()

// Allow Gate Registrars and Admins to operate the QR Scanner
onMounted(() => {
  if (userSession.value.role === 'vendor') {
    router.replace('/vendor')
  } else if (userSession.value.role === 'delivery') {
    router.replace('/delivery')
  }
})

const manualTicketInput = ref('')
const hasScanned = ref(false)
const highlightPostReg = ref(false)
const postRegNameInput = ref<HTMLInputElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const cameraActive = ref(false)
const lastDetectedQr = ref('')
const lastAdmittedReceipt = ref<any>(null)
let mediaStream: MediaStream | null = null
let scanRafId: number | null = null
let scanCanvas: HTMLCanvasElement | null = null
let scanCtx: CanvasRenderingContext2D | null = null
let lastFrameCheck = 0
let lastDecodedValue = ''
let lastDecodedTime = 0
let isLookupBusy = false

const scanResult = reactive({
  status: 'verified' as 'verified' | 'unregistered',
  title: 'QR Scanner Ready',
  subtitle: 'Scan ticket or enter ID below',
  badge: '',
  ticketId: '',
  guestName: '',
  tableSeat: '',
  guestType: ''
})

const postRegForm = reactive({
  name: '',
  phone: '',
  email: '',
  guestType: 'On-Site Registered',
  sponsor: 'Gate Admission'
})

const runAutoQrScanLoop = (timestamp: number) => {
  if (!cameraActive.value) return
  scanRafId = requestAnimationFrame(runAutoQrScanLoop)

  // Throttle decoding to ~6-7 frames/sec for smooth mobile performance
  if (timestamp - lastFrameCheck < 140 || isLookupBusy) return
  lastFrameCheck = timestamp

  const video = videoRef.value
  if (!video || video.readyState < video.HAVE_ENOUGH_DATA || !video.videoWidth || !video.videoHeight) {
    return
  }

  if (!scanCanvas) {
    scanCanvas = document.createElement('canvas')
    scanCtx = scanCanvas.getContext('2d', { willReadFrequently: true })
  }
  if (!scanCtx) return

  if (scanCanvas.width !== video.videoWidth || scanCanvas.height !== video.videoHeight) {
    scanCanvas.width = video.videoWidth
    scanCanvas.height = video.videoHeight
  }

  scanCtx.drawImage(video, 0, 0, scanCanvas.width, scanCanvas.height)
  const imageData = scanCtx.getImageData(0, 0, scanCanvas.width, scanCanvas.height)
  const decoded = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'attemptBoth'
  })

  if (decoded?.data) {
    const raw = decoded.data.trim()
    const now = Date.now()
    // Debounce same QR code for 2.5 seconds
    if (raw && (raw !== lastDecodedValue || now - lastDecodedTime > 2500)) {
      lastDecodedValue = raw
      lastDecodedTime = now
      lastDetectedQr.value = raw
      if (navigator.vibrate) navigator.vibrate(100)
      manualTicketInput.value = raw
      isLookupBusy = true
      handleManualCodeLookup().finally(() => {
        isLookupBusy = false
      })
    }
  }
}

const toggleCameraStream = async () => {
  if (cameraActive.value) {
    stopCamera()
    return
  }
  if (import.meta.client && navigator.mediaDevices?.getUserMedia) {
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }
      })
      cameraActive.value = true
      lastDetectedQr.value = ''
      await nextTick()
      if (videoRef.value) {
        videoRef.value.srcObject = mediaStream
        await videoRef.value.play().catch(() => {})
      }
      scanRafId = requestAnimationFrame(runAutoQrScanLoop)
    } catch {
      alert('Camera permission not granted or unavailable. Use the Ticket ID lookup box below.')
    }
  }
}

const stopCamera = () => {
  if (scanRafId !== null) {
    cancelAnimationFrame(scanRafId)
    scanRafId = null
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach(t => t.stop())
    mediaStream = null
  }
  cameraActive.value = false
  lastDetectedQr.value = ''
}

onUnmounted(() => {
  stopCamera()
})

const handleManualCodeLookup = async () => {
  if (!manualTicketInput.value.trim()) return
  const res = await performGateAction({
    action: 'scan_qr',
    code: manualTicketInput.value.trim(),
    admittedBy: userSession.value.name || 'Gate Personnel'
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
      simulateMode: 'valid',
      admittedBy: userSession.value.name || 'Gate Personnel'
    })
    if (res.attendee) {
      applyVerifiedAttendee(res.attendee)
    }
    highlightPostReg.value = false
  } else {
    hasScanned.value = true
    scanResult.status = 'unregistered'
    scanResult.title = 'Unregistered / Walk-In'
    scanResult.subtitle = 'Complete Manual Admission'
    scanResult.badge = 'WALK-IN / NO QR'
    scanResult.ticketId = 'NEW'
    scanResult.guestName = 'Unregistered Arrival'
    scanResult.tableSeat = 'Use On-Site Registration form'
    scanResult.guestType = 'Walk-In'
    highlightPostReg.value = true
    nextTick(() => {
      postRegNameInput.value?.focus()
    })
  }
}

const applyVerifiedAttendee = (att: any) => {
  hasScanned.value = true
  scanResult.status = 'verified'
  scanResult.title = 'QR Ticket Confirmed'
  scanResult.subtitle = `Verified ${att.type}`
  scanResult.badge = 'ADMITTED & TAGGED'
  scanResult.ticketId = att.ticketId
  scanResult.guestName = att.name
  scanResult.tableSeat = att.table && att.table !== 'Open Seating' ? `${att.table} • ${att.seat}` : 'Open Seating'
  scanResult.guestType = att.type
  lastAdmittedReceipt.value = att

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
    phone: postRegForm.phone,
    email: postRegForm.email,
    guestType: postRegForm.guestType,
    isVip: postRegForm.guestType === 'VIP',
    sponsor: postRegForm.sponsor,
    admittedBy: userSession.value.name || 'Gate Personnel'
  })
  if (res.ok && res.attendee) {
    applyVerifiedAttendee(res.attendee)
    postRegForm.name = ''
    postRegForm.phone = ''
    postRegForm.email = ''
    highlightPostReg.value = false
  }
}

const toggleSeatRelease = async () => {
  await performGateAction({ action: 'toggle_seat_release' })
}

const proceedGuestToFoodMenu = () => {
  router.push('/Orders')
}
</script>
