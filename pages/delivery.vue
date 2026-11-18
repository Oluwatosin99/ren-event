<template>
  <div class="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
    <!-- Header -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm transition-colors">
      <div class="flex items-center gap-3.5">
        <div class="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shrink-0">
          <VIcon name="qr" size="lg" />
        </div>
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              Food Delivery &amp; Served Scanner
            </h1>
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
              Active Server Station
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Scan guest meal ticket QR codes or type Ticket/Order ID to mark orders as <strong>Delivered &amp; Served</strong>
          </p>
        </div>
      </div>

      <!-- Server Identity Badge -->
      <div class="w-full sm:w-auto bg-slate-100 dark:bg-slate-950 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between sm:justify-start gap-2.5">
        <div class="text-[11px] font-bold text-slate-500 dark:text-slate-400">Server:</div>
        <select
          v-model="activeServerName"
          class="bg-transparent text-xs font-black text-slate-900 dark:text-white focus:outline-none cursor-pointer"
        >
          <option v-for="s in serverRoster" :key="s" :value="s" class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
            {{ s }}
          </option>
        </select>
      </div>
    </div>

    <!-- Quick Stats for Server -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div class="text-xs text-slate-500 dark:text-slate-400">Total Served</div>
        <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
          {{ totalServedCount }}
        </div>
        <div class="text-[11px] text-slate-400">Across All Tables</div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div class="text-xs text-slate-500 dark:text-slate-400">My Scans Today</div>
        <div class="text-2xl font-black text-orange-500 font-mono mt-0.5">
          {{ myServedCount }}
        </div>
        <div class="text-[11px] text-slate-400">By {{ activeServerName.split(' ')[0] }}</div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div class="text-xs text-slate-500 dark:text-slate-400">Awaiting Service</div>
        <div class="text-2xl font-black text-yellow-600 dark:text-yellow-400 font-mono mt-0.5">
          {{ pendingServedCount }}
        </div>
        <div class="text-[11px] text-slate-400">Printed &amp; En Route</div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div class="text-xs text-slate-500 dark:text-slate-400">Completion</div>
        <div class="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
          {{ completionRate }}%
        </div>
        <div class="text-[11px] text-slate-400">Served vs Received</div>
      </div>
    </div>

    <!-- Scanner / Search Bar -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
      <h2 class="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
        <VIcon name="camera" size="xs" class="text-emerald-500" />
        <span>Scan QR Code or Enter Order ID / Ticket</span>
      </h2>

      <form @submit.prevent="handleScanSubmit" class="flex flex-col sm:flex-row gap-2">
        <div class="relative flex-1">
          <input
            v-model="scanInput"
            type="text"
            ref="scanInputRef"
            placeholder="e.g. REN-ORD-1114-T12S4, ORD-1114, or REN-0842"
            class="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
          />
          <VIcon name="qr" size="sm" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        <button
          type="submit"
          :disabled="isScanning"
          class="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-sm shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 shrink-0"
        >
          <VIcon name="check" size="sm" />
          <span>{{ isScanning ? 'Verifying...' : 'Mark Served' }}</span>
        </button>
      </form>

      <!-- Scan Notification Alerts -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
      >
        <div
          v-if="scanFeedback"
          class="p-4 rounded-2xl border text-xs font-bold flex items-center justify-between gap-3"
          :class="scanFeedback.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
            : 'bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-300'"
        >
          <div class="flex items-center gap-2">
            <VIcon :name="scanFeedback.type === 'success' ? 'checkCircle' : 'alert'" size="sm" />
            <span>{{ scanFeedback.message }}</span>
          </div>
          <button @click="scanFeedback = null" type="button" class="text-slate-400 hover:text-slate-600">×</button>
        </div>
      </Transition>
    </div>

    <!-- Live Scanned Log & Delivery Records -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 class="text-base font-extrabold text-slate-900 dark:text-white">Live Delivery Stream &amp; Audit Log</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">Search by Guest Name, Order ID, Table, or Server</p>
        </div>

        <div class="flex items-center gap-2">
          <div class="relative">
            <input
              v-model="logFilterQuery"
              type="text"
              placeholder="Filter by name / table..."
              class="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white w-48 focus:outline-none focus:border-emerald-500"
            />
            <VIcon name="search" size="xs" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <button
            @click="filterOnlyMine = !filterOnlyMine"
            type="button"
            class="px-3 py-1.5 rounded-xl text-xs font-bold border transition"
            :class="filterOnlyMine
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'"
          >
            My Scans Only
          </button>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold text-slate-400 uppercase">
              <th class="py-2.5 px-3">Order ID</th>
              <th class="py-2.5 px-3">Guest &amp; Seat</th>
              <th class="py-2.5 px-3">Dish</th>
              <th class="py-2.5 px-3">Status</th>
              <th class="py-2.5 px-3">Served By</th>
              <th class="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            <tr
              v-for="ord in filteredDeliveryOrders"
              :key="ord.id"
              class="hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition"
            >
              <td class="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                {{ ord.id }}
                <div class="text-[10px] text-slate-400 font-normal">{{ ord.time }}</div>
              </td>
              <td class="py-3 px-3">
                <div class="font-bold text-slate-900 dark:text-white">{{ ord.guest }}</div>
                <div class="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                  {{ ord.table }} • {{ ord.seat }}
                </div>
              </td>
              <td class="py-3 px-3">
                <div class="font-bold text-slate-800 dark:text-slate-200">{{ ord.dish }}</div>
                <div class="text-[10px] text-slate-400">
                  {{ (ord.sides || []).join(', ') }} | {{ (ord.proteins || []).join(', ') }}
                </div>
              </td>
              <td class="py-3 px-3">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase"
                  :class="ord.status === 'delivered'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                    : ord.status === 'processed'
                    ? 'bg-yellow-400/20 text-yellow-800 dark:text-yellow-300 border border-yellow-500/30'
                    : 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30'"
                >
                  {{ ord.status === 'delivered' ? 'Served' : ord.status === 'processed' ? 'Printed / Ready' : 'Unprocessed' }}
                </span>
              </td>
              <td class="py-3 px-3">
                <span v-if="ord.servedBy" class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <VIcon name="checkCircle" size="xs" class="text-emerald-500" />
                  <span>{{ ord.servedBy }}</span>
                </span>
                <span v-else class="text-[11px] text-slate-400 italic">Not served yet</span>
              </td>
              <td class="py-3 px-3 text-right">
                <button
                  v-if="ord.status !== 'delivered'"
                  @click="quickDeliver(ord.id)"
                  type="button"
                  class="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition shadow-sm"
                >
                  Mark Served
                </button>
                <span v-else class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  Delivered ✓
                </span>
              </td>
            </tr>

            <tr v-if="filteredDeliveryOrders.length === 0">
              <td colspan="6" class="py-8 text-center text-slate-400">
                No orders match your search query.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { eventState, updateOrderStatus } = useEventSuite()

const scanInput = ref('')
const scanInputRef = ref<HTMLInputElement | null>(null)
const isScanning = ref(false)
const scanFeedback = ref<{ type: 'success' | 'error'; message: string } | null>(null)
const logFilterQuery = ref('')
const filterOnlyMine = ref(false)

const serverRoster = [
  'Numbere Tamunoemi',
  'Maduabuchi Ogu',
  'UI-SCiN-Sampling-Agent',
  'UI-SCiN-Nadrr-Server',
  'Taiwo Balogun',
  'Chiamaka Okonjo',
  'General Food Server'
]

const activeServerName = ref('Numbere Tamunoemi')

onMounted(() => {
  if (import.meta.client) {
    const saved = localStorage.getItem('ren-server-name')
    if (saved && serverRoster.includes(saved)) {
      activeServerName.value = saved
    }
  }
})

watch(activeServerName, (n) => {
  if (import.meta.client) {
    localStorage.setItem('ren-server-name', n)
  }
})

const allOrders = computed(() => eventState.value?.orders || [])

const totalServedCount = computed(() => {
  return allOrders.value.filter(o => o.status === 'delivered').length
})

const myServedCount = computed(() => {
  return allOrders.value.filter(o => o.status === 'delivered' && o.servedBy === activeServerName.value).length
})

const pendingServedCount = computed(() => {
  return allOrders.value.filter(o => o.status === 'processed').length
})

const completionRate = computed(() => {
  if (!allOrders.value.length) return '0.0'
  return ((totalServedCount.value / allOrders.value.length) * 100).toFixed(1)
})

const filteredDeliveryOrders = computed(() => {
  const q = logFilterQuery.value.trim().toLowerCase()
  return allOrders.value.filter(o => {
    if (filterOnlyMine.value && o.servedBy !== activeServerName.value) return false
    if (!q) return true
    return (
      o.id.toLowerCase().includes(q) ||
      o.guest.toLowerCase().includes(q) ||
      o.table.toLowerCase().includes(q) ||
      o.seat.toLowerCase().includes(q) ||
      (o.servedBy && o.servedBy.toLowerCase().includes(q)) ||
      o.dish.toLowerCase().includes(q)
    )
  })
})

const handleScanSubmit = async () => {
  const token = scanInput.value.trim()
  if (!token) return

  isScanning.value = true
  scanFeedback.value = null

  try {
    const res = await updateOrderStatus({
      action: 'scan_delivery',
      query: token,
      serverName: activeServerName.value
    })

    if (res.ok && res.order) {
      scanFeedback.value = {
        type: 'success',
        message: `Order ${res.order.id} for ${res.order.guest} (${res.order.table} • ${res.order.seat}) successfully marked as Served by ${activeServerName.value}!`
      }
      scanInput.value = ''
    }
  } catch (err: any) {
    scanFeedback.value = {
      type: 'error',
      message: err?.data?.statusMessage || err?.message || 'Could not find or update order.'
    }
  } finally {
    isScanning.value = false
    nextTick(() => {
      scanInputRef.value?.focus()
    })
  }
}

const quickDeliver = async (orderId: string) => {
  try {
    await updateOrderStatus({
      action: 'scan_delivery',
      query: orderId,
      serverName: activeServerName.value
    })
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Failed to update order status')
  }
}
</script>
